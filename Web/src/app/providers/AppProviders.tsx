import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { SessionProvider } from '@/app/providers/SessionProvider';
import { ToastProvider } from '@/components/Toast';

/**
 * Single composition root for every app-wide context, in dependency order:
 *   i18n (strings) → Session (auth/tenant/flags/RBAC) → Toast (global feedback).
 * Mount once at the top of the tree (see `main.tsx`); add future providers here.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <SessionProvider>
        <ToastProvider>{children}</ToastProvider>
      </SessionProvider>
    </I18nextProvider>
  );
}
