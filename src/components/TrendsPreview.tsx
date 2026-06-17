import { useState } from "react";
import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTrends } from "@/hooks/useTrends";
import { TrendStoryViewer } from "@/components/TrendStoryViewer";

export function TrendsPreview() {
  const { isDark } = useTheme();
  const { trends, loading } = useTrends();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      <h2 className="text-lg font-normal text-foreground mb-1">Tendencias</h2>
      <p className="text-xs text-miiles-gray-400 font-light mb-4">
        Noticias y tendencias de negocios
      </p>

      <div className="flex gap-4 overflow-x-auto pt-2 pb-4 snap-x snap-mandatory scrollbar-hide -mx-8 px-8 md:mx-0 md:px-0">
        {loading || trends.length === 0
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 snap-start flex-shrink-0">
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
          : trends.map((t, i) => (
              <motion.button
                key={t.id}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onClick={() => setOpenIndex(i)}
                className="flex flex-col items-center gap-2 snap-start flex-shrink-0 w-[88px]"
              >
                <div
                  className="w-[88px] h-[140px] rounded-[20px] p-[2.5px]"
                  style={{
                    background: "linear-gradient(135deg, #4059F1, #FCB5B9)",
                  }}
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
            ))}
      </div>

      <TrendStoryViewer trends={trends} startIndex={openIndex} onClose={() => setOpenIndex(null)} />
    </div>
  );
}
