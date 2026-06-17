import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Trend } from "@/hooks/useTrends";
import storyReelPlaceholder from "@/assets/story-reel-placeholder.png";

type Props = {
  trends: Trend[];
  startIndex: number | null;
  onClose: () => void;
  onView?: (id: string) => void;
};

export function TrendStoryViewer({ trends, startIndex, onClose, onView }: Props) {
  const { isDark } = useTheme();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (startIndex !== null) setIndex(startIndex);
  }, [startIndex]);

  const open = startIndex !== null && trends.length > 0;
  const trend = open ? trends[Math.min(index, trends.length - 1)] : null;

  useEffect(() => {
    if (open && trend) onView?.(trend.id);
  }, [open, trend?.id]);

  const goPrev = () => setIndex((i) => (i - 1 + trends.length) % trends.length);
  const goNext = () => setIndex((i) => (i + 1) % trends.length);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, trends.length]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden border-none max-w-4xl w-[95vw] md:h-[580px] rounded-[28px] shadow-2xl flex flex-col md:grid md:grid-cols-[40%_60%] gap-0 [&>button]:hidden transition-colors duration-300"
        style={{ background: isDark ? "#000000" : "#7E7E7E" }}
      >
        {trend && (
          <>
            {/* Media — vertical phone/reel format */}
            <div className="relative w-full h-[220px] md:h-full flex-shrink-0 bg-black flex items-center justify-center overflow-hidden select-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={trend.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <img
                    src={storyReelPlaceholder}
                    alt={trend.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Story progress bars */}
              <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
                {trends.map((_, i) => (
                  <div key={i} className="h-0.5 flex-1 rounded-full bg-white/30 overflow-hidden">
                    <div className={`h-full bg-white transition-all ${i <= index ? "w-full" : "w-0"}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Text content panel */}
            <div
              className="flex-grow flex flex-col min-h-0 md:h-[580px] overflow-hidden"
              style={{ background: isDark ? "#000000" : "#7E7E7E" }}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-2">
                <span className="text-[11px] uppercase tracking-wide text-white/60 font-medium">
                  {trend.category}
                </span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full transition-colors hover:bg-white/10 text-white"
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-4 scrollbar-hide">
                <h2 className="text-xl font-normal text-white leading-snug">{trend.title}</h2>
                <p className="text-[11px] text-white/50 font-light mt-1">
                  {new Date(trend.published_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                {trend.summary && (
                  <p className="text-sm font-light text-white/80 leading-relaxed mt-4 whitespace-pre-wrap">
                    {trend.summary}
                  </p>
                )}

                {trend.bullets.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {trend.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2 text-sm font-light text-white/80 leading-relaxed">
                        <span className="text-white/40 mt-0.5">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {trend.links.length > 0 && (
                  <div className="mt-5 flex flex-col gap-2">
                    {trend.links.map((l, i) => (
                      <a
                        key={i}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 px-4 py-3 rounded-full text-sm font-light transition-all hover:scale-[1.01] bg-white/10 text-white border border-white/10 hover:bg-white/15"
                      >
                        <span className="truncate">{l.label || l.url}</span>
                        <ExternalLink size={14} className="flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                <button
                  onClick={goPrev}
                  disabled={trends.length <= 1}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 bg-white/10 text-white hover:bg-white/15"
                  aria-label="Anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-xs text-white/60 font-light">
                  {index + 1} / {trends.length}
                </span>
                <button
                  onClick={goNext}
                  disabled={trends.length <= 1}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 bg-white/10 text-white hover:bg-white/15"
                  aria-label="Siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
