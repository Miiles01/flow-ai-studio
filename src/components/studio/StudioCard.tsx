import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { type StudioTemplate } from "@/lib/studio";

export default function StudioCard({ t, className = "" }: { t: StudioTemplate; className?: string }) {
  const navigate = useNavigate();
  return (
    <motion.div whileHover={{ y: -6, transition: { duration: 0.2 } }}>
      <Button variant="ghost" aria-label={`Ver ${t.title}`} onClick={() => navigate(`/studio/${t.slug}`)}
        className={`relative block aspect-video h-auto w-full overflow-hidden rounded-lg bg-muted p-0 hover:bg-muted ${className}`}>
        {t.thumbnail_url && <img src={t.thumbnail_url} alt={t.title} className="h-full w-full object-cover" loading="lazy" />}
      </Button>
    </motion.div>
  );
}