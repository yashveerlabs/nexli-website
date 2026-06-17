import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from '@/components/Icon';
import type { NavItem } from '@/app/nav';

export interface QuickAction {
  label: string;
  icon: IconName;
  onClick?: () => void;
}

export interface SidebarProps {
  nav: NavItem[];
  contextChip?: ReactNode;
  quickActions?: QuickAction[];
  footer?: ReactNode;
  onNavigate?: () => void;
}

/** Sidebar contents (used inside the desktop rail and the mobile drawer). */
export function Sidebar({ nav, contextChip, quickActions, footer, onNavigate }: SidebarProps) {
  return (
    <>
      <div className="sb-logo">
        <div className="sb-logo__mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round">
            <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" />
            <path d="M3 7 L12 12 L21 7" />
            <path d="M12 12 L12 22" />
          </svg>
        </div>
        <div className="sb-logo__text">
          <div className="b">NEXLI</div>
          <div className="s">SCHOOL ERP</div>
        </div>
      </div>

      {contextChip}

      <nav className="sb-nav" aria-label="Main navigation">
        {nav.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => cn('sb-nav__item', isActive && 'active')}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
            {item.ai && <span className="nx-navtag">AI</span>}
          </NavLink>
        ))}
      </nav>

      {quickActions && quickActions.length > 0 && (
        <div className="sb-quick">
          <div className="sb-quick__head">
            <span className="t">Quick Actions</span>
          </div>
          {quickActions.map((qa, i) => (
            <button key={i} type="button" className="sb-quick__btn" onClick={qa.onClick}>
              <Icon name={qa.icon} size={14} />
              {qa.label}
            </button>
          ))}
        </div>
      )}

      {footer ?? (
        <div className="sb-foot">
          <div className="v">NEXLI School ERP v0.1.0</div>
          <div>© 2026 NEXLI. All rights reserved.</div>
        </div>
      )}
    </>
  );
}
