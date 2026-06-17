import type { ReactNode } from 'react';
import { useSession } from '@/app/providers/SessionProvider';
import type { Permission } from '@/lib/rbac';
import type { FeatureFlagKey } from '@/lib/featureFlags';
import { ForbiddenScreen } from '@/app/screens/statuses';

/**
 * Route-level UI guards. These mirror the authoritative Firestore rules so the UI
 * never renders an area the user can't use. Wrap a route element to gate it.
 */

export function RequirePermission({ perm, children }: { perm: Permission; children: ReactNode }) {
  const { can } = useSession();
  if (!can(perm)) return <ForbiddenScreen />;
  return <>{children}</>;
}

export function RequireFlag({ flag, children }: { flag: FeatureFlagKey; children: ReactNode }) {
  const { hasFlag } = useSession();
  if (!hasFlag(flag)) return <ForbiddenScreen />;
  return <>{children}</>;
}

export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { isSuperAdmin } = useSession();
  if (!isSuperAdmin) return <ForbiddenScreen />;
  return <>{children}</>;
}

/**
 * Combine a permission and/or flag gate (both must pass). When `moduleKey` is the
 * target of an active temporary delegation, the permission gate is waived so a
 * substitute can reach the module they've been asked to cover (the flag gate still
 * applies — a disabled feature stays off regardless of delegation).
 */
export function Guarded({
  perm,
  flag,
  moduleKey,
  children,
}: {
  perm?: Permission;
  flag?: FeatureFlagKey;
  moduleKey?: string;
  children: ReactNode;
}) {
  const { can, hasFlag, delegatedModules } = useSession();
  if (flag && !hasFlag(flag)) return <ForbiddenScreen />;
  const delegated = !!moduleKey && delegatedModules.includes(moduleKey);
  if (perm && !can(perm) && !delegated) return <ForbiddenScreen />;
  return <>{children}</>;
}
