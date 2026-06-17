import { onSnapshot, query, where, type Unsubscribe } from 'firebase/firestore';
import { tenantCol } from './db';
import type { RoleId } from '@/types/roles';
import type { TenantRecord } from '@/types/models';

/**
 * Temporary operational delegation — "cover for a staffing gap without a
 * permanent role change". Leadership (or an admin) can grant a substitute the
 * day-to-day *operate* permission for a module for a bounded window. This is a
 * UI-level realism layer over the ownership model (`lib/ownership.ts`): a grant
 * makes `useOwnership(moduleKey).canOperate` true for the delegate while active.
 *
 * Every grant carries the audit triple the owner required: **reason, timestamp,
 * and an audit-log entry** (written in `features/delegation/data.ts`). Database
 * enforcement is deferred to P9; this governs the UI affordances today.
 *
 * Doc lives at `schools/{schoolId}/delegations/{id}`.
 */
export interface Delegation extends TenantRecord {
  /** The user (member uid) who temporarily inherits the operate permission. */
  delegateUid: string;
  delegateName: string;
  delegateRole?: RoleId;
  /** Module key from `MODULE_OWNERSHIP` (e.g. 'library', 'medical'). */
  moduleKey: string;
  /** Human label for the module (for listings + audit summaries). */
  moduleLabel: string;
  /** Required justification for the temporary override. */
  reason: string;
  /** Window of validity (epoch ms). */
  fromAt: number;
  untilAt: number;
  /** Who granted it. */
  grantedByUid: string;
  grantedByName: string;
  /** Set false on explicit revoke (kept for the audit trail). */
  active: boolean;
  revokedAt?: number;
  revokedByUid?: string;
  revokedByName?: string;
}

/** A delegation counts only inside its window and while not revoked. */
export function isDelegationActive(d: Delegation, now: number = Date.now()): boolean {
  return d.active !== false && d.fromAt <= now && d.untilAt >= now;
}

/**
 * Live-subscribe to the module keys a user currently holds via active
 * delegations. Queries only `delegateUid == uid` (no composite index needed on
 * Spark) and filters the window client-side. Used by `SessionProvider` to feed
 * `delegatedModules` into `useOwnership`.
 */
export function subscribeActiveDelegations(
  schoolId: string,
  uid: string,
  cb: (moduleKeys: string[]) => void,
): Unsubscribe {
  const q = query(tenantCol(schoolId, 'delegations'), where('delegateUid', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const now = Date.now();
      const keys = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as object) }) as Delegation)
        .filter((d) => isDelegationActive(d, now))
        .map((d) => d.moduleKey);
      cb(Array.from(new Set(keys)));
    },
    () => cb([]),
  );
}
