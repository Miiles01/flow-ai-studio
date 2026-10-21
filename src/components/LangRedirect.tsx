import { Navigate, useLocation } from "react-router-dom";
import i18n, { getStoredLang } from "@/i18n";

/** Sends public pages without a language prefix to /<lang>/..., keeping query and hash. */
const LangRedirect = () => {
  const { pathname, search, hash } = useLocation();
  const lang = getStoredLang() || (i18n.language?.startsWith("en") ? "en" : "es");
  const rest = pathname === "/" ? "/" : pathname;
  return <Navigate to={`/${lang}${rest}${search}${hash}`} replace />;
};

export default LangRedirect;
