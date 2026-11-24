import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { langOf } from "@/i18n";

export const LANGS = [
  { value: "es", label: "Español", short: "ES" },
  { value: "en", label: "English", short: "EN" },
  { value: "pt", label: "Português", short: "PT" },
  { value: "fr", label: "Français", short: "FR" },
] as const;

export function useLang() {
  const { i18n } = useTranslation();
  const current = langOf(i18n.language);
  return { current, change: (lng: string) => { if (lng !== current) void i18n.changeLanguage(lng); } };
}

/** Selector de idioma del dashboard (página de perfil): un control segmentado con la opción activa en negro. */
export function LanguageOptions({ isDark, label }: { isDark: boolean; label: string }) {
  const { current, change } = useLang();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`grid grid-cols-2 gap-1 rounded-2xl p-1 sm:grid-cols-4 sm:rounded-full ${isDark ? "bg-white/[0.06]" : "bg-gray-100"}`}
    >
      {LANGS.map((l) => {
        const selected = current === l.value;
        return (
          <button
            key={l.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => change(l.value)}
            className={`relative flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm transition-colors duration-200 sm:rounded-full ${
              selected
                ? isDark ? "text-black" : "text-white"
                : isDark ? "text-white/60 hover:text-white" : "text-black/55 hover:text-black"
            }`}
          >
            {selected && (
              <motion.span
                layoutId="lang-pill"
                className={`absolute inset-0 rounded-xl sm:rounded-full ${isDark ? "bg-white" : "bg-black"}`}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative flex items-center gap-1.5 whitespace-nowrap">
              {selected && <Check size={14} strokeWidth={2.5} />}
              {l.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
