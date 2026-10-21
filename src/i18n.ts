import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';

export const SUPPORTED_LANGS = ['es', 'en'] as const;
export const LANG_STORAGE_KEY = 'miiles-lang';

// Per-page translation files: src/locales/<lang>/<section>.json → t("<section>.key")
const sectionFiles = import.meta.glob('./locales/*/*.json', { eager: true }) as Record<string, { default: Record<string, unknown> }>;
const sections: Record<string, Record<string, unknown>> = { es: {}, en: {} };
for (const [path, mod] of Object.entries(sectionFiles)) {
  const m = path.match(/\.\/locales\/(\w+)\/([\w-]+)\.json$/);
  if (m && sections[m[1]]) sections[m[1]][m[2]] = mod.default;
}

export const getStoredLang = (): string | null => {
  try {
    const v = localStorage.getItem(LANG_STORAGE_KEY);
    return v === 'en' || v === 'es' ? v : null;
  } catch {
    return null;
  }
};

const getInitialLang = (): string => {
  if (typeof window !== 'undefined') {
    const first = window.location.pathname.split('/').filter(Boolean)[0];
    if (first === 'en' || first === 'es') return first;
    return getStoredLang() || 'es';
  }
  return 'es';
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { ...enTranslation, ...sections.en } },
    es: { translation: { ...esTranslation, ...sections.es } },
  },
  lng: getInitialLang(),
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  try { localStorage.setItem(LANG_STORAGE_KEY, lng); } catch { /* ignore */ }
  if (typeof document !== 'undefined') document.documentElement.lang = lng;
});
if (typeof document !== 'undefined') document.documentElement.lang = i18n.language;

export default i18n;
