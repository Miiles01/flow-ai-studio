import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import { ChevronLeft, ChevronRight, ExternalLink, X, Newspaper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Trend } from "@/hooks/useTrends";

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
        className="p-0 overflow-hidden border-none max-w-3xl w-[95vw] md:w-full rounded-[28px] gap-0 [&>button]:hidden"
      >
        {trend && (
          <div className="flex flex-col md:flex-row max-h-[85vh]">
            {/* Media — vertical phone format */}
            <div className="relative md:w-[44%] flex-shrink-0 bg-black flex items-center justify-center aspect-[9/16] md:aspect-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={trend.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {trend.media_url ? (
                    trend.media_type === "video" ? (
                      <video
                        src={trend.media_url}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls
                      />
                    ) : (
                      <img src={trend.media_url} alt={trend.title} className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/30">
                      <Newspaper size={40} strokeWidth={1.2} />
                      <span className="text-xs font-light">Sin contenido</span>
                    </div>
                  )}
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

            {/* Text content */}
            <div
              className={`flex-1 flex flex-col min-w-0 ${isDark ? "bg-[hsl(222,20%,11%)]" : "bg-white"}`}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-2">
                <span className="text-[11px] uppercase tracking-wide text-miiles-gray-400 font-light">
                  {trend.category}
                </span>
                <button
                  onClick={onClose}
                  className={`p-1.5 rounded-full transition-colors ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-miiles-gray-100 text-black"}`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-4 scrollbar-hide">
                <h2 className="text-xl font-normal text-foreground leading-snug">{trend.title}</h2>
                <p className="text-[11px] text-miiles-gray-400 font-light mt-1">
                  {new Date(trend.published_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                {trend.summary && (
                  <p className="text-sm font-light text-foreground/80 leading-relaxed mt-4 whitespace-pre-wrap">
                    {trend.summary}
                  </p>
                )}

                {trend.bullets.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {trend.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2 text-sm font-light text-foreground/80 leading-relaxed">
                        <span className="text-miiles-blue mt-0.5">•</span>
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
                        className={`flex items-center justify-between gap-2 px-4 py-3 rounded-full text-sm font-light transition-all hover:scale-[1.01] ${
                          isDark
                            ? "bg-white/10 text-white border border-white/10 hover:bg-white/15"
                            : "bg-miiles-gray-50 text-black hover:bg-miiles-gray-100 border border-[#F3F4F6]"
                        }`}
                      >
                        <span className="truncate">{l.label || l.url}</span>
                        <ExternalLink size={14} className="flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className={`flex items-center justify-between px-6 py-4 border-t ${isDark ? "border-white/10" : "border-[#F3F4F6]"}`}>
                <button
                  onClick={goPrev}
                  disabled={trends.length <= 1}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 ${
                    isDark ? "bg-white/10 text-white hover:bg-white/15" : "bg-miiles-gray-50 text-black hover:bg-miiles-gray-100"
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-xs text-miiles-gray-400 font-light">
                  {index + 1} / {trends.length}
                </span>
                <button
                  onClick={goNext}
                  disabled={trends.length <= 1}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 ${
                    isDark ? "bg-white/10 text-white hover:bg-white/15" : "bg-miiles-gray-50 text-black hover:bg-miiles-gray-100"
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
