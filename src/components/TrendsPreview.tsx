import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTrends } from "@/hooks/useTrends";
import { TrendStoryViewer } from "@/components/TrendStoryViewer";

const VIEWED_KEY = "miiles_viewed_trends";

function getViewed(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(VIEWED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function TrendsPreview() {
  const { isDark } = useTheme();
  const { trends, loading } = useTrends();
  const displayTrends = trends.slice(0, 10);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [viewed, setViewed] = useState<Set<string>>(() => getViewed());

  // Mouse Drag Scroll State
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [dragMoved, setDragMoved] = useState(false);

  // Scroll Fades State
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkScrollFades = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const canScrollLeft = el.scrollLeft > 5;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const canScrollRight = el.scrollLeft < maxScrollLeft - 5;
    setShowLeftFade(canScrollLeft);
    setShowRightFade(canScrollRight);
  };

  useEffect(() => {
    const timer = setTimeout(checkScrollFades, 200);
    return () => clearTimeout(timer);
  }, [displayTrends, loading]);

  useEffect(() => {
    window.addEventListener("resize", checkScrollFades);
    return () => window.removeEventListener("resize", checkScrollFades);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
    setDragMoved(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const el = e.currentTarget;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5; // multiplier to adjust scrolling speed
    if (Math.abs(walk) > 3) {
      setDragMoved(true);
    }
    el.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (dragMoved) {
      // Keep dragMoved true for 50ms to allow click interception
      setTimeout(() => setDragMoved(false), 50);
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setDragMoved(false);
  };

  const markViewed = (id: string) => {
    setViewed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(VIEWED_KEY, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const openStory = (i: number) => {
    setOpenIndex(i);
    const t = displayTrends[i];
    if (t) markViewed(t.id);
  };

  return (
    <div>
      <h2 className="text-lg font-normal text-foreground mb-1">Descubrimientos</h2>
      <p className="text-xs text-miiles-gray-400 font-light mb-4">
        Nuevas actualizaciones estratégicas
      </p>

      <div className="relative">
        {/* Left Fade Overlay */}
        <div 
          className={`absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none transition-opacity duration-300 z-10 hidden md:block ${
            showLeftFade ? "opacity-100" : "opacity-0"
          }`} 
        />

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollFades}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="flex gap-4 overflow-x-auto pt-2 pb-4 scrollbar-hide -mx-8 px-8 md:mx-0 md:px-0 select-none cursor-grab active:cursor-grabbing"
        >
          {loading || displayTrends.length === 0
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div
                    className={`w-[88px] h-[140px] rounded-[20px] flex items-center justify-center ${
                      isDark ? "bg-white/5 ring-1 ring-white/10" : "bg-miiles-gray-50 shadow-sm"
                    } ${loading ? "animate-pulse" : ""}`}
                  >
                    {!loading && <Newspaper size={22} className="text-miiles-gray-400" strokeWidth={1.2} />}
                  </div>
                  <div className={`h-2 w-14 rounded-full ${isDark ? "bg-white/5" : "bg-miiles-gray-100"}`} />
                </div>
              ))
            : displayTrends.map((t, i) => {
                const isViewed = viewed.has(t.id);
                return (
                  <motion.button
                    key={t.id}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    onClick={(e) => {
                      if (dragMoved) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      openStory(i);
                    }}
                    className="flex flex-col items-center gap-2 flex-shrink-0 w-[88px]"
                  >
                    <div
                      className="w-[88px] h-[140px] rounded-[20px] p-[2.5px]"
                      style={
                        isViewed
                          ? { background: isDark ? "hsl(222 10% 30%)" : "hsl(222 10% 80%)" }
                          : { background: "linear-gradient(135deg, #4059F1, #FCB5B9)" }
                      }
                    >
                      <div className="w-full h-full rounded-[18px] overflow-hidden bg-black flex items-center justify-center">
                        {t.thumbnail_url ? (
                          <img src={t.thumbnail_url} alt={t.title} className="w-full h-full object-cover" />
                        ) : (
                          <Newspaper size={22} className="text-white/40" strokeWidth={1.2} />
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] font-light text-foreground/80 leading-tight text-center line-clamp-2 w-full">
                      {t.title}
                    </span>
                  </motion.button>
                );
              })}
        </div>

        {/* Right Fade Overlay */}
        <div 
          className={`absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none transition-opacity duration-300 z-10 hidden md:block ${
            showRightFade ? "opacity-100" : "opacity-0"
          }`} 
        />
      </div>

      <TrendStoryViewer
        trends={displayTrends}
        startIndex={openIndex}
        onClose={() => setOpenIndex(null)}
        onView={markViewed}
      />
    </div>
  );
}
