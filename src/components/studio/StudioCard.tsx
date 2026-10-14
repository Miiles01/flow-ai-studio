import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { type StudioTemplate } from "@/lib/studio";

export default function StudioCard({ t, className = "" }: { t: StudioTemplate; className?: string }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  return (
    <motion.button
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/studio/${t.slug}`)}
      className={`text-left rounded-[24px] overflow-hidden ${isDark ? "bg-white/5 ring-1 ring-white/10" : "bg-white shadow-md"} ${className}`}
    >
      {/* Título */}
      <div className="px-4 pt-4 pb-3">
        <p className={`text-base font-normal truncate ${isDark ? "text-white" : "text-foreground"}`}>{t.title}</p>
      </div>

      {/* Mockup de computadora: mini navegador con la página, cortado a la mitad */}
      <div className={`mx-3 mb-3 rounded-t-xl overflow-hidden border ${isDark ? "border-white/10 bg-white/10" : "border-miiles-gray-200 bg-miiles-gray-100"}`}>
        {/* Barra del navegador */}
        <div className={`flex items-center gap-1.5 px-3 py-2 border-b ${isDark ? "border-white/10 bg-black" : "border-miiles-gray-200 bg-white"}`}>
          <span className={`w-2 h-2 rounded-full ${isDark ? "bg-white/25" : "bg-miiles-gray-200"}`} />
          <span className={`w-2 h-2 rounded-full ${isDark ? "bg-white/25" : "bg-miiles-gray-200"}`} />
          <span className={`w-2 h-2 rounded-full ${isDark ? "bg-white/25" : "bg-miiles-gray-200"}`} />
          <div className={`flex-1 h-3.5 rounded-full ml-1.5 ${isDark ? "bg-white/10" : "bg-miiles-gray-100"}`} />
        </div>
        {/* Página adentro: solo se ve la mitad superior */}
        <div className="aspect-[4/3] overflow-hidden relative bg-white">
          {t.thumbnail_url ? (
            <img src={t.thumbnail_url} alt={t.title} className="w-full object-cover object-top" loading="lazy" />
          ) : (
            <iframe
              title={t.title}
              srcDoc={t.html}
              sandbox=""
              className="absolute top-0 left-0 w-[400%] h-[800%] origin-top-left pointer-events-none border-0"
              style={{ transform: "scale(0.25)" }}
            />
          )}
        </div>
      </div>
    </motion.button>
  );
}
