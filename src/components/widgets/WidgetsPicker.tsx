import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { WIDGETS, type WidgetDef } from "./registry";
import { useTheme } from "@/contexts/ThemeContext";

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (widget: WidgetDef) => void;
};

const WidgetsPicker = ({ open, onClose, onPick }: Props) => {
  const { isDark } = useTheme();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = WIDGETS.filter((w) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q);
  });

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Click-outside catcher (no visual overlay) */}
          <div className="fixed inset-0 z-[9998]" onClick={onClose} />

          <motion.div
            key="widgets-picker"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
            className="fixed z-[9999] left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2"
            style={{ width: "min(720px, calc(100vw - 32px))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`rounded-3xl border overflow-hidden ${
                isDark ? "bg-[#1C1C1E] border-white/10" : "bg-white border-neutral-200"
              }`}
            >
              {/* Header / search */}
              <div className={`flex items-center gap-3 px-5 py-3.5 border-b ${isDark ? "border-white/10" : "border-neutral-100"}`}>
                <Search size={16} className={isDark ? "text-white/40" : "text-neutral-400"} />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar widgets…"
                  className={`flex-1 bg-transparent border-none outline-none text-[14px] font-light ${
                    isDark ? "text-white placeholder:text-white/40" : "text-black placeholder:text-neutral-400"
                  }`}
                />
                <button
                  onClick={onClose}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors text-sm font-medium ${
                    isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10 text-black"
                  }`}
                  aria-label="Cerrar"
                >
                  <span>Cerrar</span>
                  <X size={14} />
                </button>
              </div>

              {/* Grid */}
              <div className="p-5 overflow-y-auto scrollbar-hide" style={{ maxHeight: "60vh" }}>
                {filtered.length === 0 ? (
                  <div className={`text-center py-12 text-sm font-light ${isDark ? "text-white/40" : "text-neutral-400"}`}>
                    No hay widgets que coincidan.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {filtered.map((w) => {
                      const Icon = w.icon;
                      return (
                        <button
                          key={w.id}
                          onClick={() => {
                            onPick(w);
                            onClose();
                          }}
                          className={`group text-left p-4 rounded-2xl border transition-all hover:-translate-y-0.5 shadow-sm ${
                            isDark
                              ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 shadow-black/20"
                              : "bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-md"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                              isDark ? "bg-white/10 text-white" : "bg-neutral-100 text-neutral-700"
                            }`}
                          >
                            <Icon size={18} strokeWidth={1.5} />
                          </div>
                          <div className={`text-[14px] font-normal mb-0.5 ${isDark ? "text-white" : "text-black"}`}>{w.name}</div>
                          <div className={`text-[11px] font-light leading-snug ${isDark ? "text-white/50" : "text-neutral-500"}`}>
                            {w.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default WidgetsPicker;
