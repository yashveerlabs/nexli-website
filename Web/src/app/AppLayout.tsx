import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { touchSchoolUsage, USAGE_HEARTBEAT_MS } from '@/lib/usage';
import { AppShell } from '@/app/shell';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { Sheet } from '@/components/Sheet';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/feedback';
import { useSession } from '@/app/providers/SessionProvider';
import {
  audienceForRole,
  bottomNavForAudience,
  filterNav,
  navForAudience,
  type NavItem,
} from '@/app/nav';
import { moduleComponent } from '@/app/moduleRegistry';
import { ROLES } from '@/types/roles';

/**
 * Session-driven application frame. Resolves the signed-in user's audience, filters
 * the nav manifest by their permissions + active feature flags, and feeds the
 * presentational AppShell the right navigation, school context, and account
 * controls. Replaces the static P0 ShellPreview.
 */
export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useSession();
  const { isSuperAdmin, role, member, school, schoolId, can, hasFlag, logout, delegatedModules } = session;
  const [accountOpen, setAccountOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Usage telemetry: refresh the tenant's last-active stamp (throttled) so the
  // Super Admin console reflects real activity. Best-effort; never blocks UX.
  useEffect(() => {
    if (!schoolId || isSuperAdmin) return;
    if (Date.now() - (school?.lastActiveAt ?? 0) > USAGE_HEARTBEAT_MS) {
      void touchSchoolUsage(schoolId, { lastActiveAt: Date.now() });
    }
  }, [schoolId, isSuperAdmin, school?.lastActiveAt]);

  const audience = audienceForRole(role, isSuperAdmin);

  // Only show a nav item that has a real screen behind it: the dashboard, a module
  // registered for this audience, or one surfaced via a live delegation. This hides
  // not-yet-built "In build" placeholders (e.g. staff Settings/Security, parent
  // Academics/Calendar/Notices) so a user never opens an empty page from the menu.
  const isReachable = useCallback(
    (it: NavItem) => it.path === '/' || !!moduleComponent(audience, it.id) || !!delegatedModules?.includes(it.id),
    [audience, delegatedModules],
  );

  const nav = useMemo(
    () => filterNav(navForAudience(audience), { isSuperAdmin, can, hasFlag, delegatedModules }).filter(isReachable),
    [audience, isSuperAdmin, can, hasFlag, delegatedModules, isReachable],
  );
  const bottomNav = useMemo(
    () => filterNav(bottomNavForAudience(audience), { isSuperAdmin, can, hasFlag, delegatedModules }).filter(isReachable),
    [audience, isSuperAdmin, can, hasFlag, delegatedModules, isReachable],
  );

  const name = member?.name ?? (isSuperAdmin ? 'Super Admin' : 'Account');
  const roleLabel = role ? ROLES[role]?.label : isSuperAdmin ? 'Platform' : '';

  const activeTitle = useMemo(() => currentTitle(nav, location.pathname), [nav, location.pathname]);

  const contextChip = isSuperAdmin ? (
    <div className="sb-school">
      <div className="sb-school__wrap">
        <div className="sb-school__name">NEXLI Platform</div>
        <div className="sb-school__meta">Super Admin Console</div>
      </div>
    </div>
  ) : school ? (
    <div className="sb-school">
      <div className="sb-school__wrap">
        <div className="sb-school__name">{school.name}</div>
        <div className="sb-school__meta">
          {school.currentAcademicYear ?? 'Academic year'}
          {school.city ? <><span className="dot" /> {school.city}</> : null}
        </div>
      </div>
    </div>
  ) : null;

  const appbarActions = (
    <>
      <button type="button" className="nx-appbar__btn" aria-label="Notifications" onClick={() => setNotifOpen(true)}>
        <Icon name="bell" size={19} />
      </button>
      <button
        type="button"
        className="nx-appbar__btn"
        aria-label="Account"
        onClick={() => setAccountOpen(true)}
        style={{ padding: 0 }}
      >
        <Avatar name={name} src={member?.photoUrl} size={30} />
      </button>
    </>
  );

  const sidebarFooter = (
    <button type="button" className="sb-account" onClick={() => setAccountOpen(true)}>
      <Avatar name={name} src={member?.photoUrl} size={34} />
      <div className="sb-account__meta">
        <div className="n">{name}</div>
        <div className="r">{roleLabel}</div>
      </div>
      <Icon name="chevron-right" size={15} className="sb-account__chev" />
    </button>
  );

  return (
    <>
      <AppShell
        nav={nav}
        bottomNav={bottomNav}
        contextChip={contextChip}
        appbarTitle={activeTitle}
        appbarActions={appbarActions}
        sidebarFooter={sidebarFooter}
      >
        {children}
      </AppShell>

      {/* Account sheet */}
      <Sheet open={accountOpen} onClose={() => setAccountOpen(false)} side="right" size="sm" title="Account">
        <div className="nx-account">
          <div className="nx-account__head">
            <Avatar name={name} src={member?.photoUrl} size={52} />
            <div>
              <div className="nx-account__name">{name}</div>
              <div className="nx-account__role">{roleLabel}</div>
            </div>
          </div>
          {member?.email && <AccountRow icon="mail" label={member.email} />}
          {member?.phone && <AccountRow icon="phone" label={member.phone} />}
          {school?.name && <AccountRow icon="school" label={school.name} />}
          <div className="nx-account__actions">
            {moduleComponent(audience, 'settings') && (
              <Button
                variant="ghost"
                block
                leftIcon="settings"
                onClick={() => {
                  setAccountOpen(false);
                  navigate('/settings');
                }}
              >
                Settings
              </Button>
            )}
            <Button variant="danger" block leftIcon="log-out" onClick={() => void logout()}>
              Sign out
            </Button>
          </div>
        </div>
      </Sheet>

      {/* Notifications sheet (in-app only until push/WhatsApp/SMS provisioned) */}
      <Sheet open={notifOpen} onClose={() => setNotifOpen(false)} side="right" size="sm" title="Notifications">
        <EmptyState icon="bell" title="You're all caught up" message="New alerts and circulars will show up here." />
      </Sheet>
    </>
  );
}

function AccountRow({ icon, label }: { icon: 'mail' | 'phone' | 'school'; label: string }) {
  return (
    <div className="nx-account__row">
      <Icon name={icon} size={15} />
      <span>{label}</span>
    </div>
  );
}

/** Best-match nav label for the current path (for the mobile app-bar title). */
function currentTitle(nav: NavItem[], pathname: string): string {
  if (pathname === '/' || pathname === '') return nav.find((n) => n.path === '/')?.label ?? 'Dashboard';
  const match = nav
    .filter((n) => n.path !== '/')
    .sort((a, b) => b.path.length - a.path.length)
    .find((n) => pathname === n.path || pathname.startsWith(n.path + '/'));
  return match?.label ?? 'NEXLI';
}
