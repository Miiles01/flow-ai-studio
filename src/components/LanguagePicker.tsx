import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

const LANGS = [
  { value: "es", label: "Español", short: "ES" },
  { value: "en", label: "English", short: "EN" },
] as const;

function useLang() {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("en") ? "en" : "es";
  return { current, change: (lng: string) => { if (lng !== current) void i18n.changeLanguage(lng); } };
}

/** Dos opciones grandes para elegir el idioma del dashboard (página de perfil). */
export function LanguageOptions({ isDark, label }: { isDark: boolean; label: string }) {
  const { current, change } = useLang();
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-3 sm:grid-cols-2">
      {LANGS.map((l) => {
        const selected = current === l.value;
        return (
          <button
            key={l.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => change(l.value)}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors duration-200 ${
              selected
                ? isDark ? "border-white/40 bg-white/[0.06]" : "border-black bg-black/[0.02]"
                : isDark ? "border-white/10 hover:bg-white/5" : "border-border hover:bg-black/[0.03]"
            }`}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium ${isDark ? "bg-white/10 text-white" : "bg-[#F3F4F6] text-black"}`}>{l.short}</span>
            <span className="min-w-0 flex-1 text-sm font-normal text-foreground">{l.label}</span>
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
              selected ? (isDark ? "bg-white text-black" : "bg-black text-white") : (isDark ? "border border-white/20" : "border border-black/15")
            }`}>
              {selected && <Check size={12} strokeWidth={2.5} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
