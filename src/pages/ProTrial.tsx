import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logotipoSvg from "@/assets/miiles/logotipo.svg";
import { useAuth } from "@/contexts/AuthContext";
import { PRO_TRIAL_PATH, claimProTrial, clearProTrialCode, getStoredProTrialCode } from "@/lib/proTrial";
import { getStoredLang, langOf, LOCALE_OF } from "@/i18n";

type Mode = "signup" | "login";

const ProTrial = () => {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signup");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [code, setCode] = useState<string | null>(() => getStoredProTrialCode());
  const claiming = useRef(false);

  // Once a session exists on this page, grant the trial and continue to the app.
  useEffect(() => {
    if (authLoading || !user || !code || claiming.current) return;
    claiming.current = true;
    (async () => {
      const result = await claimProTrial(code);
      if (result?.reason === "invalid_code") {
        clearProTrialCode();
        setCode(null);
        claiming.current = false;
        toast.error(t("protrial.invalidCode"));
        return;
      }
      clearProTrialCode();
      if (!result) {
        toast.error(t("protrial.error"));
      } else if (result.granted) {
        const until = result.expires_at
          ? new Date(result.expires_at).toLocaleDateString(LOCALE_OF[langOf(i18n.language)], { day: "numeric", month: "long" })
          : "";
        toast.success(t("protrial.granted", { date: until }));
      } else if (result.reason === "already_claimed") {
        toast(t("protrial.alreadyClaimed"));
      } else if (result.reason === "already_pro") {
        toast(t("protrial.alreadyPro"));
      }
      navigate("/dashboard", { replace: true });
    })();
  }, [authLoading, user, code, navigate, t, i18n.language]);

  // The gift is only offered from the Afiliados page: without a code entered there, go back to it.
  useEffect(() => {
    if (!code) navigate(`/${getStoredLang() || "es"}/afiliados`, { replace: true });
  }, [code, navigate]);

  const returnUrl = new URL(PRO_TRIAL_PATH, window.location.origin).href;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: displayName }, emailRedirectTo: returnUrl },
      });
      if (error) toast.error(error.message);
      else if (!data.session) setCheckEmail(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: returnUrl });
    if (result.error) toast.error(t("protrial.googleError"));
  };

  if (user && code) {
    return (
      <div className="bg-white w-full py-16 px-8 rounded-[32px] flex flex-col items-center justify-center gap-4 border border-solid border-[#E5E7EB]">
        <Loader2 size={22} className="animate-spin text-black" />
        <p className="text-sm text-miiles-gray-400 font-light">{t("protrial.activating")}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white w-full py-8 px-4 md:py-12 md:px-8 rounded-[32px] flex flex-col justify-center border border-solid border-[#E5E7EB]"
    >
      <div className="text-center mb-8">
        <Link to="/" className="block w-fit mx-auto mb-6 hover:opacity-80 transition-opacity">
          <img src={logotipoSvg} alt="miiles" className="h-6 mx-auto" />
        </Link>
        <span className="w-fit mx-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-miiles-pink-light text-black text-xs font-normal mb-4">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C12.3 8.8 15.2 11.7 24 12C15.2 12.3 12.3 15.2 12 24C11.7 15.2 8.8 12.3 0 12C8.8 11.7 11.7 8.8 12 0Z" /></svg>
          {t("protrial.badge")}
        </span>
        <h1 className="text-[28px] font-medium text-black leading-tight">{code ? t("protrial.title") : t("protrial.codeTitle")}</h1>
      </div>

      {!code || user ? null : checkEmail ? (
        <div className="text-center rounded-2xl bg-miiles-gray-50 px-6 py-8">
          <Mail size={22} className="mx-auto mb-3 text-black" />
          <p className="text-[15px] text-black font-normal">{t("protrial.checkEmailTitle")}</p>
          <p className="text-sm text-miiles-gray-400 font-light mt-1">{t("protrial.checkEmailBody", { email })}</p>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1 rounded-full bg-miiles-gray-50">
              {(["signup", "login"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-5 h-9 rounded-full text-sm transition-colors ${mode === m ? "bg-black text-white" : "text-miiles-gray-600 hover:text-black"}`}
                >
                  {m === "signup" ? t("protrial.tabSignup") : t("protrial.tabLogin")}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-miiles-gray-400" />
                <Input type="text" placeholder={t("protrial.name")} value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-12 h-14 bg-transparent border-border rounded-full" required />
              </div>
            )}
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-miiles-gray-400" />
              <Input type="email" placeholder={t("protrial.email")} value={email} onChange={(e) => setEmail(e.target.value)} className="pl-12 h-14 bg-transparent border-border rounded-full" required />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-miiles-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t("protrial.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12 h-14 bg-transparent border-border rounded-full"
                minLength={6}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={t("protrial.togglePassword")} className="absolute right-5 top-1/2 -translate-y-1/2 text-miiles-gray-400 hover:text-black transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="w-auto px-10 min-w-[200px] h-12 rounded-full bg-black text-white font-medium hover:-translate-y-1 transition-transform disabled:opacity-50 disabled:pointer-events-none"
                disabled={loading}
              >
                {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : mode === "signup" ? t("protrial.submitSignup") : t("protrial.submitLogin")}
              </button>
            </div>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-4 text-muted-foreground">{t("protrial.or")}</span></div>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" className="w-auto px-10 rounded-full h-12 shadow-none border border-solid border-[#E5E7EB] hover:bg-gray-50" onClick={handleGoogle}>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t("protrial.google")}
            </Button>
          </div>
        </>
      )}

      {code && !checkEmail && (
        <div className="flex justify-center mt-6">
          <button type="button" onClick={() => { clearProTrialCode(); setCode(null); }} className="text-xs text-miiles-gray-400 hover:text-black underline-offset-4 hover:underline">
            {t("protrial.changeCode")}
          </button>
        </div>
      )}
      <p className="text-center text-xs text-miiles-gray-400 font-light mt-4">{t("protrial.fineprint")}</p>
    </motion.div>
  );
};

export default ProTrial;
