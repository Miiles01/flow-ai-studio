import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';

// Detectar idioma inicial desde la URL
const getInitialLang = (): string => {
  if (typeof window !== 'undefined') {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments[0] === 'en') return 'en';
    if (pathSegments[0] === 'es') return 'es';
  }
  return 'es'; // Español por defecto
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      es: { translation: esTranslation }
    },
    lng: getInitialLang(),
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
