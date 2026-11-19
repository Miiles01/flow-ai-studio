import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';
import ptTranslation from './locales/pt.json';

export const SUPPORTED_LANGS = ['es', 'en', 'pt'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const isLang = (v: unknown): v is Lang => typeof v === 'string' && (SUPPORTED_LANGS as readonly string[]).includes(v);
/** Normalizes any i18next language code (en-US, pt-BR…) to one of the supported languages. */
export const langOf = (lng?: string | null): Lang => {
  const base = (lng || '').slice(0, 2).toLowerCase();
  return isLang(base) ? base : 'es';
};
/** BCP 47 locale for dates/numbers and SEO tags. */
export const LOCALE_OF: Record<Lang, string> = { es: 'es-MX', en: 'en-US', pt: 'pt-BR' };
/** Picks inline copy written as { es, en, pt? }; Portuguese falls back to Spanish when missing. */
export const pickLang = <T,>(o: { es: T; en: T; pt?: T }, lng?: string | null): T => {
  const l = langOf(lng ?? i18n.language);
  return l === 'pt' ? (o.pt ?? o.es) : o[l];
};
export const LANG_STORAGE_KEY = 'miiles-lang';

// Per-page translation files: src/locales/<lang>/<section>.json → t("<section>.key")
const sectionFiles = import.meta.glob('./locales/*/*.json', { eager: true }) as Record<string, { default: Record<string, unknown> }>;
const sections: Record<string, Record<string, unknown>> = { es: {}, en: {}, pt: {} };
for (const [path, mod] of Object.entries(sectionFiles)) {
  const m = path.match(/\.\/locales\/(\w+)\/([\w-]+)\.json$/);
  if (m && sections[m[1]]) sections[m[1]][m[2]] = mod.default;
}

export const getStoredLang = (): string | null => {
  try {
    const v = localStorage.getItem(LANG_STORAGE_KEY);
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
};

const getInitialLang = (): string => {
  if (typeof window !== 'undefined') {
    const first = window.location.pathname.split('/').filter(Boolean)[0];
    if (isLang(first)) return first;
    return getStoredLang() || 'es';
  }
  return 'es';
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { ...enTranslation, ...sections.en } },
    es: { translation: { ...esTranslation, ...sections.es } },
    pt: { translation: { ...ptTranslation, ...sections.pt } },
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
