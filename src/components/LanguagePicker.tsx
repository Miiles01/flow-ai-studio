import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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

/** Dropdown redondeado para el menú de ajustes (fondo oscuro): se abre deslizándose hacia abajo. */
export function LanguageDropdown({ label }: { label: string }) {
  const { current, change } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = LANGS.find((l) => l.value === current) ?? LANGS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); } };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey, true); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 h-8 pl-3 pr-2.5 rounded-full border border-white/10 bg-white/5 text-[12px] font-medium text-white transition-colors hover:bg-white/10"
      >
        {active.label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex">
          <ChevronDown size={14} strokeWidth={2} className="opacity-70" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={label}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-[calc(100%+6px)] z-50 w-40 rounded-2xl border border-white/10 bg-[#2C2C2E] p-1 shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
          >
            {LANGS.map((l) => {
              const selected = l.value === current;
              return (
                <li key={l.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => { change(l.value); setOpen(false); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] text-left transition-colors ${selected ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                  >
                    {l.label}
                    {selected && <Check size={14} strokeWidth={2.2} />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
