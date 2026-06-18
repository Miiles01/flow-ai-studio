import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Trend, TrendLink } from "@/hooks/useTrends";
import storyReelPlaceholder from "@/assets/story-reel-placeholder.png";

const getSummaryParagraph = (summary: string | null, idx: number, totalSlides: number) => {
  if (!summary) return "";
  const paragraphs = summary.split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return "";
  if (paragraphs.length === 1) {
    return paragraphs[0];
  }
  return paragraphs[idx] || "";
};

const getSlideLinks = (links: TrendLink[], idx: number) => {
  if (!links || links.length === 0) return [];
  if (links.length === 1) {
    return links;
  }
  const link = links[idx];
  return link ? [link] : [];
};

type Props = {
  trends: Trend[];
  startIndex: number | null;
  onClose: () => void;
  onView?: (id: string) => void;
};

export function TrendStoryViewer({ trends, startIndex, onClose, onView }: Props) {
  const { isDark } = useTheme();
  const [index, setIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pointerDownTime, setPointerDownTime] = useState<number>(0);

  const STORY_DURATION = 5000; // 5 seconds per story

  const open = startIndex !== null && trends.length > 0;
  const trend = open ? trends[Math.min(index, trends.length - 1)] : null;

  const slides = trend
    ? trend.bullets.slice(0, 3).length > 0
      ? trend.bullets.slice(0, 3)
      : [trend.summary || ""]
    : [];

  useEffect(() => {
    if (startIndex !== null) {
      setIndex(startIndex);
      setSlideIndex(0);
      setProgress(0);
      setIsPaused(false);
    }
  }, [startIndex]);

  useEffect(() => {
    if (open && trend) onView?.(trend.id);
  }, [open, trend?.id]);

  const goPrev = () => {
    setProgress(0);
    if (slideIndex > 0) {
      setSlideIndex((s) => s - 1);
    } else {
      if (index > 0) {
        const prevIndex = index - 1;
        const prevTrend = trends[prevIndex];
        const prevBullets = prevTrend.bullets.slice(0, 3);
        const prevSlidesCount = prevBullets.length > 0 ? prevBullets.length : 1;
        setIndex(prevIndex);
        setSlideIndex(prevSlidesCount - 1);
      }
    }
  };
  
  const goNext = () => {
    setProgress(0);
    if (slideIndex < slides.length - 1) {
      setSlideIndex((s) => s + 1);
    } else {
      if (index < trends.length - 1) {
        setIndex((i) => i + 1);
        setSlideIndex(0);
      } else {
        onClose();
      }
    }
  };

  // Auto-advance interval
  useEffect(() => {
    if (!open || isPaused) return;

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          if (slideIndex < slides.length - 1) {
            setSlideIndex((s) => s + 1);
            setProgress(0);
          } else {
            if (index < trends.length - 1) {
              setIndex((i) => i + 1);
              setSlideIndex(0);
              setProgress(0);
            } else {
              onClose();
            }
          }
          return 0;
        }
        return p + (50 / STORY_DURATION) * 100;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [open, index, slideIndex, isPaused, trends.length, slides.length, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, trends.length, slideIndex, index]);

  const activeImage = trend
    ? [
        trend.media_url || trend.thumbnail_url || storyReelPlaceholder,
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=500",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=500"
      ][slideIndex % 3]
    : storyReelPlaceholder;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 overflow-visible border-none max-w-4xl w-[95vw] md:h-[580px] rounded-[28px] shadow-2xl flex flex-col md:grid md:grid-cols-[40%_60%] gap-0 [&>button.right-4]:hidden transition-colors duration-300"
        style={{ background: isDark ? "#000000" : "#7E7E7E" }}
      >
        {trend && (
          <>
            {/* Left Navigation Arrow (Outside) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              disabled={trends.length <= 1}
              className="absolute left-[-70px] lg:left-[-90px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/10 hidden md:flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 z-50 pointer-events-auto cursor-pointer"
              aria-label="Anterior"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>

            {/* Media — vertical phone/reel format with hold-to-pause and tap-to-navigate */}
            <div
              className="relative w-full h-[220px] md:h-full flex-shrink-0 bg-black flex items-center justify-center overflow-hidden select-none cursor-pointer rounded-t-[28px] md:rounded-t-none md:rounded-l-[28px]"
              onPointerDown={(e) => {
                setPointerDownTime(Date.now());
                setIsPaused(true);
              }}
              onPointerUp={(e) => {
                setIsPaused(false);
                const duration = Date.now() - pointerDownTime;
                if (duration < 250) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const width = rect.width;
                  if (clickX < width * 0.3) {
                    goPrev();
                  } else {
                    goNext();
                  }
                }
              }}
              onPointerLeave={() => setIsPaused(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${trend.id}-${slideIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <img
                    src={activeImage}
                    alt={trend.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Story progress bars */}
              <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
                {slides.map((_, i) => {
                  let w = "0%";
                  if (i < slideIndex) w = "100%";
                  else if (i === slideIndex) w = `${progress}%`;

                  return (
                    <div key={i} className="h-0.5 flex-1 rounded-full bg-white/30 overflow-hidden">
                      <div
                        className="h-full bg-white"
                        style={{
                          width: w,
                          transition: i === slideIndex ? "none" : "width 0.1s linear",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Text content panel */}
            <div
              className="flex-grow flex flex-col min-h-0 md:h-[580px] overflow-hidden rounded-b-[28px] md:rounded-b-none md:rounded-r-[28px]"
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

              <div className="flex-1 overflow-y-auto px-6 pb-8 scrollbar-hide">
                <h2 className="text-xl font-normal text-white leading-snug">{trend.title}</h2>
                <p className="text-[11px] text-white/50 font-light mt-1">
                  {new Date(trend.published_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${trend.id}-${slideIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="mt-6 space-y-4"
                  >
                    {trend.bullets.length > 0 && (
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-2 font-medium">
                          Tema {slideIndex + 1} de {slides.length}
                        </span>
                        <p className="text-base font-medium text-white leading-relaxed">
                          {slides[slideIndex]}
                        </p>
                      </div>
                    )}

                    {(() => {
                      const paragraph = getSummaryParagraph(trend.summary, slideIndex, slides.length);
                      return paragraph ? (
                        <p className="text-sm font-light text-white/80 leading-relaxed whitespace-pre-wrap">
                          {paragraph}
                        </p>
                      ) : null;
                    })()}

                    {(() => {
                      const slideLinks = getSlideLinks(trend.links, slideIndex);
                      return slideLinks.length > 0 ? (
                        <div className="flex flex-col gap-2 pt-2">
                          {slideLinks.map((l, i) => (
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
                      ) : null;
                    })()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Right Navigation Arrow (Outside) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              disabled={trends.length <= 1}
              className="absolute right-[-70px] lg:right-[-90px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/10 hidden md:flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 z-50 pointer-events-auto cursor-pointer"
              aria-label="Siguiente"
            >
              <ChevronRight size={24} strokeWidth={2} />
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
