import { createBrowserRouter } from 'react-router-dom';
import { ProtectedApp } from '@/app/AppRouter';
import { StaffLogin, ParentLogin } from '@/features/auth';
import { FoundationPage } from '@/app/FoundationPage';
import { KitPreview } from '@/app/KitPreview';

/**
 * NEXLI router.
 *  - Public: `/login` (staff email/pass) and `/login/parent` (phone OTP).
 *  - Dev smoke tests: `/foundation`, `/kit` (kept reachable during the build).
 *  - Everything else → `ProtectedApp`, which gates on the session and mounts the
 *    role-scoped app (shell + per-audience route tree). Major data-entry screens
 *    live as dedicated pages inside each module's route subtree.
 */
export const router = createBrowserRouter([
  { path: '/login', element: <StaffLogin /> },
  { path: '/login/parent', element: <ParentLogin /> },
  { path: '/foundation', element: <FoundationPage /> },
  { path: '/kit', element: <KitPreview /> },
  { path: '*', element: <ProtectedApp /> },
]);
