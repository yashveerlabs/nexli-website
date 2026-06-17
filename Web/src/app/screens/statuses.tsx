import { useNavigate } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { StatusScreen } from './StatusScreen';

/** Authenticated, but no NEXLI profile is linked to this account. */
export function NoAccessScreen() {
  const { logout, firebaseUser } = useSession();
  return (
    <StatusScreen
      icon="lock"
      tone="warning"
      title="Account not linked"
      message="You're signed in, but this account isn't connected to a school yet. Please ask your school administrator to finish setting up your access."
      primary={{ label: 'Sign out', onClick: () => void logout(), icon: 'log-out' }}
      footnote={firebaseUser?.email ? <>Signed in as {firebaseUser.email}</> : undefined}
    />
  );
}

/** Member exists but has been suspended. */
export function SuspendedScreen() {
  const { logout, member } = useSession();
  return (
    <StatusScreen
      icon="shield"
      tone="danger"
      title="Access paused"
      message="Your account has been temporarily suspended. If you believe this is a mistake, contact your school administrator or IT admin."
      primary={{ label: 'Sign out', onClick: () => void logout(), icon: 'log-out' }}
      footnote={member?.name ? <>{member.name}</> : undefined}
    />
  );
}

/** Signed in, but not permitted to view this route. */
export function ForbiddenScreen() {
  const navigate = useNavigate();
  return (
    <StatusScreen
      icon="shield"
      tone="warning"
      title="You don't have access to this"
      message="Your role doesn't include this area. If you need it, ask your administrator to grant the permission."
      primary={{ label: 'Back to dashboard', onClick: () => navigate('/'), icon: 'home' }}
    />
  );
}

/** Unknown route inside the authenticated app. */
export function NotFoundScreen() {
  const navigate = useNavigate();
  return (
    <StatusScreen
      icon="search"
      tone="info"
      title="Page not found"
      message="The page you're looking for doesn't exist or may have moved."
      primary={{ label: 'Back to dashboard', onClick: () => navigate('/'), icon: 'home' }}
    />
  );
}
