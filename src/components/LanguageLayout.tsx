import { useEffect } from "react";
import { Outlet, useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SUPPORTED_LANGS = ["es", "en"];

const LanguageLayout = () => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && SUPPORTED_LANGS.includes(lang) && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  // Si el idioma no es válido, redirigir a /es/
  if (!lang || !SUPPORTED_LANGS.includes(lang)) {
    return <Navigate to="/es/" replace />;
  }

  return <Outlet />;
};

export default LanguageLayout;
