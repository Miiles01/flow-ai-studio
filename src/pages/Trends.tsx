import { useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTrends } from "@/hooks/useTrends";
import { TrendStoryViewer } from "@/components/TrendStoryViewer";

export default function Trends() {
  const { isDark } = useTheme();
  const { trends, loading } = useTrends();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const } },
  } as const;

  return (
    <div className="p-8 md:px-12 md:pb-12 md:pt-48 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className={`text-2xl md:text-3xl font-normal leading-tight ${isDark ? "text-white" : "text-black"}`}>
          Descubrimientos
        </h1>
        <p className="text-miiles-gray-400 mt-2 text-sm font-light">
          Nuevas actualizaciones estratégicas, actualizadas constantemente.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-miiles-gray-400" />
        </div>
      ) : trends.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-24 gap-3 rounded-2xl ${isDark ? "bg-white/5" : "bg-miiles-gray-50"}`}>
          <Newspaper size={36} className="text-miiles-gray-400" strokeWidth={1.2} />
          <p className="text-sm text-miiles-gray-400 font-light">Aún no hay descubrimientos. Vuelve pronto.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {trends.map((t, i) => (
            <motion.button
              key={t.id}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => setOpenIndex(i)}
              className="flex flex-col gap-2 text-left"
            >
              <div className="aspect-[9/16] rounded-[20px] overflow-hidden bg-black flex items-center justify-center ring-1 ring-black/5">
                {t.thumbnail_url ? (
                  <img src={t.thumbnail_url} alt={t.title} className="w-full h-full object-cover" />
                ) : (
                  <Newspaper size={28} className="text-white/40" strokeWidth={1.2} />
                )}
              </div>
              <span className="text-[13px] font-light text-foreground/85 leading-snug line-clamp-2">
                {t.title}
              </span>
            </motion.button>
          ))}
        </motion.div>
      )}

      <TrendStoryViewer trends={trends} startIndex={openIndex} onClose={() => setOpenIndex(null)} />
    </div>
  );
}
