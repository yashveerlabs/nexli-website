import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { globalFlagsRef, memberRef, schoolFlagsRef, schoolRef, userIndexRef } from '@/lib/db';
import { DEFAULT_FLAGS, resolveFlags, type FeatureFlagKey, type FlagMap } from '@/lib/featureFlags';
import { hasPermission, permissionListGrants, type Permission } from '@/lib/rbac';
import { fetchSessionPermissions, type ResolvedPerms } from '@/lib/roles/data';
import { isOperator as ownIsOperator, isReviewer as ownIsReviewer, isApprover as ownIsApprover, moduleOwnerLabel as ownLabel } from '@/lib/ownership';
import { subscribeActiveDelegations } from '@/lib/delegation';
import { writeAuditEvent, type AuditAction, type AuditEventInput } from '@/lib/audit';
import type { RoleId } from '@/types/roles';
import type { Member, School, UserIndex } from '@/types/models';

export type SessionStatus = 'loading' | 'unauthenticated' | 'authenticated' | 'no_profile';

interface SessionState {
  status: SessionStatus;
  firebaseUser: User | null;
  uid?: string;
  isSuperAdmin: boolean;
  schoolId?: string;
  role?: RoleId;
  /** Optional second role held simultaneously (multi-role staffing — e.g. VP + Teacher,
   *  Class Teacher + HOD). Permissions/ownership are the UNION of both roles. */
  secondaryRole?: RoleId;
  member: Member | null;
  school: School | null;
  flags: FlagMap;
  /** Module keys this user currently operates via an active temporary delegation. */
  delegatedModules: string[];
  /** Effective permission keys resolved from the data-driven role definitions
   *  (Firestore override ◀ bundled catalogue), or '*' for full access. */
  permissions?: ResolvedPerms;
}

export interface SessionContextValue extends SessionState {
  can: (perm: Permission) => boolean;
  hasFlag: (key: FeatureFlagKey) => boolean;
  reload: () => Promise<void>;
  logout: () => Promise<void>;
}

const initial: SessionState = {
  status: 'loading',
  firebaseUser: null,
  isSuperAdmin: false,
  member: null,
  school: null,
  flags: DEFAULT_FLAGS,
  delegatedModules: [],
};

const SessionContext = createContext<SessionContextValue | null>(null);

/** Resolve a signed-in user → tenant + role + flags via the /userIndex lookup. */
async function loadProfile(user: User): Promise<Partial<SessionState>> {
  const idxSnap = await getDoc(userIndexRef(user.uid));
  if (!idxSnap.exists()) {
    return { status: 'no_profile', firebaseUser: user, uid: user.uid };
  }
  const idx = idxSnap.data() as UserIndex;

  if (idx.isSuperAdmin || idx.roleId === 'super_admin') {
    const globalFlags = (await getDoc(globalFlagsRef())).data() as Partial<FlagMap> | undefined;
    return {
      status: 'authenticated',
      firebaseUser: user,
      uid: user.uid,
      isSuperAdmin: true,
      role: 'super_admin',
      flags: resolveFlags(globalFlags, null),
      permissions: '*',
    };
  }

  const schoolId = idx.schoolId;
  if (!schoolId) return { status: 'no_profile', firebaseUser: user, uid: user.uid };

  const [memberSnap, schoolSnap, globalSnap, schoolFlagSnap] = await Promise.all([
    getDoc(memberRef(schoolId, user.uid)),
    getDoc(schoolRef(schoolId)),
    getDoc(globalFlagsRef()),
    getDoc(schoolFlagsRef(schoolId)),
  ]);

  const member = memberSnap.exists() ? ({ ...(memberSnap.data() as Member), uid: user.uid }) : null;
  const school = schoolSnap.exists() ? ({ id: schoolId, ...(schoolSnap.data() as object) } as School) : null;
  const flags = resolveFlags(
    globalSnap.data() as Partial<FlagMap> | undefined,
    schoolFlagSnap.data() as Partial<FlagMap> | undefined,
  );
  // Resolve permissions from the data-driven role definitions (Firestore override
  // ◀ bundled catalogue) for the primary + optional secondary role.
  const permissions = await fetchSessionPermissions(schoolId, idx.roleId, member?.secondaryRoleId);

  return {
    status: 'authenticated',
    firebaseUser: user,
    uid: user.uid,
    isSuperAdmin: false,
    schoolId,
    role: idx.roleId,
    secondaryRole: member?.secondaryRoleId,
    member,
    school,
    flags,
    permissions,
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(initial);

  const applyUser = useCallback(async (user: User | null) => {
    if (!user) {
      setState({ ...initial, status: 'unauthenticated' });
      return;
    }
    setState((s) => ({ ...s, status: 'loading', firebaseUser: user, uid: user.uid }));
    try {
      const next = await loadProfile(user);
      setState({ ...initial, ...next } as SessionState);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[NEXLI session] failed to load profile', err);
      setState({ ...initial, status: 'no_profile', firebaseUser: user, uid: user.uid });
    }
  }, []);

  useEffect(() => onAuthStateChanged(auth, applyUser), [applyUser]);

  // Live-subscribe to the user's active temporary delegations (decision: leadership
  // can grant substitutes temporary operate access). Feeds `useOwnership`.
  useEffect(() => {
    if (state.status !== 'authenticated' || state.isSuperAdmin || !state.schoolId || !state.uid) {
      return;
    }
    const unsub = subscribeActiveDelegations(state.schoolId, state.uid, (moduleKeys) => {
      setState((s) => ({ ...s, delegatedModules: moduleKeys }));
    });
    return unsub;
  }, [state.status, state.isSuperAdmin, state.schoolId, state.uid]);

  const can = useCallback(
    (perm: Permission) => {
      if (state.isSuperAdmin) return true;
      const granted = state.member?.grantedPermissions ?? [];
      const perms = state.permissions;
      // Primary path: the data-driven permission set resolved for this session
      // (already the union of primary + secondary role, Firestore ◀ catalogue).
      if (perms === '*') return true;
      if (perms) return permissionListGrants([...perms, ...granted], perm);
      // Fallback (permissions not resolved yet): bundled role defaults.
      if (!state.role) return false;
      if (hasPermission(state.role, perm, granted)) return true;
      return !!state.secondaryRole && hasPermission(state.secondaryRole, perm, granted);
    },
    [state.isSuperAdmin, state.role, state.secondaryRole, state.member, state.permissions],
  );

  const hasFlag = useCallback((key: FeatureFlagKey) => state.flags[key] ?? false, [state.flags]);

  const reload = useCallback(async () => {
    if (auth.currentUser) await applyUser(auth.currentUser);
  }, [applyUser]);

  const logout = useCallback(async () => {
    if (state.uid) {
      void writeAuditEvent({
        action: 'logout',
        schoolId: state.schoolId,
        actor: { uid: state.uid, name: state.member?.name, role: state.role },
      });
    }
    await signOut(auth);
  }, [state.uid, state.schoolId, state.member, state.role]);

  const value = useMemo<SessionContextValue>(
    () => ({ ...state, can, hasFlag, reload, logout }),
    [state, can, hasFlag, reload, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within <SessionProvider>');
  return ctx;
}

export const useCan = (perm: Permission): boolean => useSession().can(perm);
export const useFlag = (key: FeatureFlagKey): boolean => useSession().hasFlag(key);

/**
 * Operational ownership for a module (realism layer over RBAC). Gate the primary
 * *operate* affordances on `canOperate`; show a review-mode note when `isReviewer`
 * (leadership oversees, the owning role operates). `isApprover` gates sign-offs.
 *
 * `canOperate` is true for the module's owner/deputy roles, the Super Admin, OR a
 * user holding an active temporary delegation for this module (`isDelegated`).
 */
export function useOwnership(moduleKey: string): {
  canOperate: boolean;
  isReviewer: boolean;
  isApprover: boolean;
  isDelegated: boolean;
  ownerLabel: string;
} {
  const { role, secondaryRole, isSuperAdmin, delegatedModules } = useSession();
  const isDelegated = delegatedModules.includes(moduleKey);
  // Multi-role: operate/review/approve if EITHER role qualifies.
  const sec = secondaryRole;
  return {
    canOperate:
      isSuperAdmin || ownIsOperator(role, moduleKey) || (!!sec && ownIsOperator(sec, moduleKey)) || isDelegated,
    isReviewer: ownIsReviewer(role, moduleKey) || (!!sec && ownIsReviewer(sec, moduleKey)),
    isApprover:
      isSuperAdmin || ownIsApprover(role, moduleKey) || (!!sec && ownIsApprover(sec, moduleKey)),
    isDelegated,
    ownerLabel: ownLabel(moduleKey),
  };
}

/** Returns a session-bound audit logger: `log('student.edited', { targetId })`. */
export function useAudit() {
  const { uid, schoolId, member, role } = useSession();
  return useCallback(
    (action: AuditAction, opts?: Omit<AuditEventInput, 'action' | 'actor' | 'schoolId'>) =>
      writeAuditEvent({
        action,
        schoolId,
        actor: { uid: uid ?? 'unknown', name: member?.name, role },
        ...opts,
      }),
    [uid, schoolId, member, role],
  );
}
