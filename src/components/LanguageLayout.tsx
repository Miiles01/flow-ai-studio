import { useEffect } from "react";
import { Outlet, useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isLang } from "@/i18n";

const LanguageLayout = () => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (isLang(lang) && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    if (lang) document.documentElement.lang = lang;
  }, [lang, i18n]);

  if (!isLang(lang)) {
    return <Navigate to="/es/" replace />;
  }

  return <Outlet />;
};

export default LanguageLayout;
