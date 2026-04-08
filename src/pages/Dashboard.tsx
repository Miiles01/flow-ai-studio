import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag, TrendingUp, Bookmark, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type Program = {
  id: string;
  name: string;
  brand_name: string;
  description: string;
  category: string;
  commission_rate: string | null;
  is_featured: boolean;
};

const categories = [
  { label: "Deportes", value: "deportes", emoji: "⚽" },
  { label: "Moda", value: "moda", emoji: "👗" },
  { label: "Belleza", value: "belleza", emoji: "💄" },
  { label: "Tech", value: "tech", emoji: "💻" },
  { label: "General", value: "general", emoji: "🌐" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

export default function Dashboard() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [featured, setFeatured] = useState<Program[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
      supabase.from("brand_programs").select("*").eq("is_featured", true).limit(4),
      supabase.from("user_applications").select("id", { count: "exact" }).eq("user_id", user.id),
    ]).then(([profileRes, programsRes, appsRes]) => {
      setDisplayName(profileRes.data?.display_name || user.email?.split("@")[0] || "");
      setFeatured((programsRes.data as Program[]) || []);
      setSavedCount(appsRes.count || 0);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">
      {/* Greeting */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-2xl md:text-3xl font-semibold">
          {getGreeting()}, <span className="text-accent">{displayName}</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Encuentra y gestiona tus colaboraciones con marcas
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Programas disponibles", value: featured.length + "+", icon: ShoppingBag },
          { label: "Guardados", value: savedCount, icon: Bookmark },
          { label: "Tendencia", value: "Deportes", icon: TrendingUp },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-md bg-muted/50"
          >
            <s.icon size={18} className="text-muted-foreground mb-2" />
            <p className="text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Categorías</h2>
          <Link to="/programs" className="text-xs text-accent hover:underline flex items-center gap-1">
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>
        <div className="flex gap-3 flex-wrap">
          {categories.map((c) => (
            <Link
              key={c.value}
              to={`/programs?category=${c.value}`}
              className="px-4 py-3 rounded-sm bg-muted/50 hover:bg-muted transition-colors text-sm flex items-center gap-2"
            >
              <span className="text-lg">{c.emoji}</span>
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured programs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Programas destacados</h2>
          <Link to="/programs" className="text-xs text-accent hover:underline flex items-center gap-1">
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featured.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{p.brand_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.name}</p>
                </div>
                {p.commission_rate && (
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                    {p.commission_rate}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{p.description}</p>
              <Link
                to={`/programs?highlight=${p.id}`}
                className="text-xs text-accent mt-3 inline-flex items-center gap-1 hover:underline"
              >
                Ver detalles <ArrowRight size={12} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
