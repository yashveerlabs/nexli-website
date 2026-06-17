import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/Icon';
import type { NavItem } from '@/app/nav';

/** Short labels for the cramped mobile bottom bar. */
const SHORT: Record<string, string> = {
  dashboard: 'Home',
  communication: 'Chat',
  examinations: 'Exams',
  subscriptions: 'Subs',
  assignments: 'Tasks',
};

export interface BottomNavProps {
  items: NavItem[];
  onMore: () => void;
}

/** Mobile-only bottom tab bar (≤4 primary items + More → drawer). */
export function BottomNav({ items, onMore }: BottomNavProps) {
  return (
    <nav className="nx-bottomnav" aria-label="Primary">
      {items.map((it) => (
        <NavLink
          key={it.id}
          to={it.path}
          end={it.end}
          className={({ isActive }) => cn('nx-bottomnav__item', isActive && 'active')}
        >
          <Icon name={it.icon} size={21} />
          <span>{SHORT[it.id] ?? it.label}</span>
        </NavLink>
      ))}
      <button type="button" className="nx-bottomnav__item" onClick={onMore} aria-label="More menu">
        <Icon name="menu" size={21} />
        <span>More</span>
      </button>
    </nav>
  );
}
