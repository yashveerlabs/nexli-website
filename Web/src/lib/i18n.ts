import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from '@/locales/en/common.json';

/**
 * NEXLI i18n. English is the base locale, bundled inline so the app boots without
 * a network round-trip or Suspense fallback. Indian regional languages are added
 * as additional `locales/<lng>/common.json` resources later. Number/date/currency
 * formatting is handled by `@/lib/format` (Indian grouping, ₹, dayjs), so i18next
 * here is purely for UI strings.
 */
export const DEFAULT_LANGUAGE = 'en';
export const NAMESPACES = ['common'] as const;

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: 'common',
    ns: NAMESPACES,
    resources: {
      en: { common: enCommon },
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export default i18n;
