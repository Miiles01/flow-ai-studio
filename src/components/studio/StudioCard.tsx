import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { type StudioTemplate } from "@/lib/studio";

export default function StudioCard({ t, className = "" }: { t: StudioTemplate; className?: string }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  return (
    <motion.div whileHover={{ y: -6, transition: { duration: 0.2 } }}>
      <Button variant="ghost" aria-label={`Ver ${t.title}`} onClick={() => navigate(`/studio/${t.slug}`)}
        className={`relative block aspect-[4/3] h-auto w-full overflow-hidden rounded-[24px] p-0 hover:bg-muted ${isDark ? 'bg-black ring-1 ring-white/10 hover:bg-zinc-900' : 'bg-white shadow-md hover:bg-white'} ${className}`}>
        {t.thumbnail_url && <img src={t.thumbnail_url} alt={t.title} className="h-full w-full object-cover" loading="lazy" />}
      </Button>
    </motion.div>
  );
}