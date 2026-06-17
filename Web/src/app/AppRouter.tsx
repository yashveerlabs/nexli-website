import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { audienceForRole, navForAudience } from '@/app/nav';
import { moduleComponent } from '@/app/moduleRegistry';
import { registerAllModules } from '@/app/registerModules';
import { AppLayout } from '@/app/AppLayout';
import { Guarded } from '@/app/guards';
import { Spinner } from '@/components/feedback';
import { Splash } from '@/app/screens/Splash';
import { Dashboard } from '@/app/screens/Dashboard';
import { ModuleStub } from '@/app/screens/ModuleStub';
import { NoAccessScreen, NotFoundScreen, SuspendedScreen } from '@/app/screens/statuses';

// Wire all built feature modules into the registry once (idempotent).
registerAllModules();

/** Per-audience route tree (nested under the session shell). */
function RoleRoutes() {
  const { isSuperAdmin, role } = useSession();
  const audience = audienceForRole(role, isSuperAdmin);
  const items = navForAudience(audience).filter((i) => i.path !== '/');

  return (
    <Suspense fallback={<div className="nx-route-loading"><Spinner size={22} /></div>}>
      <Routes>
        <Route index element={<Dashboard />} />
        {items.map((item) => {
          const Comp = moduleComponent(audience, item.id);
          const inner = Comp ? <Comp /> : <ModuleStub title={item.label} icon={item.icon} />;
          const sub = item.path.replace(/^\//, '');
          return (
            <Route
              key={item.id}
              path={`${sub}/*`}
              element={
                <Guarded perm={item.permission} anyPerm={item.anyPermission} flag={item.flag} moduleKey={item.id}>
                  {inner}
                </Guarded>
              }
            />
          );
        })}
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
    </Suspense>
  );
}

/**
 * Authentication + tenancy gate for the entire app. Resolves the session and
 * routes to the right experience: splash while loading, login when signed out,
 * a no-access / suspended screen for edge states, otherwise the role-scoped app.
 */
export function ProtectedApp() {
  const { status, member } = useSession();

  if (status === 'loading') return <Splash />;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  if (status === 'no_profile') return <NoAccessScreen />;
  if (member && member.status === 'suspended') return <SuspendedScreen />;

  return (
    <AppLayout>
      <RoleRoutes />
    </AppLayout>
  );
}
