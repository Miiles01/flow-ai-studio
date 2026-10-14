import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { KIND_LABEL, type StudioTemplate } from "@/lib/studio";

export default function StudioCard({ t, className = "" }: { t: StudioTemplate; className?: string }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  return (
    <motion.button
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/studio/${t.slug}`)}
      className={`text-left rounded-[24px] overflow-hidden ${isDark ? "bg-white/5 ring-1 ring-white/10" : "bg-white shadow-md"} ${className}`}
    >
      <div className="aspect-[4/3] bg-muted overflow-hidden relative">
        {t.thumbnail_url ? (
          <img src={t.thumbnail_url} alt={t.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <iframe
            title={t.title}
            srcDoc={t.html}
            sandbox=""
            className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left pointer-events-none border-0"
            style={{ transform: "scale(0.25)" }}
          />
        )}
      </div>
      <div className="p-4">
        <p className="text-base font-normal text-foreground">{t.title}</p>
        <p className="text-xs text-muted-foreground font-light mt-1">{KIND_LABEL[t.kind] ?? t.kind}</p>
      </div>
    </motion.button>
  );
}
