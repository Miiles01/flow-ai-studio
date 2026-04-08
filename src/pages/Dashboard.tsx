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
        <Loader2 size={24} className="animate-spin text-miiles-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-12">
      {/* Greeting */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-2xl md:text-3xl font-normal">
          {getGreeting()}, <em className="text-accent">{displayName}</em>
        </h1>
        <p className="text-miiles-gray-400 mt-2 text-sm font-light">
          Encuentra y gestiona tus colaboraciones con marcas
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {[
          { label: "Programas disponibles", value: "10+", icon: ShoppingBag },
          { label: "Guardados", value: savedCount, icon: Bookmark },
          { label: "Tendencia", value: "Deportes", icon: TrendingUp },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-lg shadow-md"
          >
            <div className="w-8 h-8 rounded-sm bg-background shadow-sm flex items-center justify-center mb-3">
              <s.icon size={16} className="text-miiles-blue" />
            </div>
            <p className="text-2xl font-normal">{s.value}</p>
            <p className="text-xs text-miiles-gray-400 font-light mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-normal">Categorías</h2>
          <Link to="/programs" className="text-xs text-accent hover:underline flex items-center gap-1 font-light">
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>
        <div className="flex gap-3 flex-wrap">
          {categories.map((c) => (
            <Link
              key={c.value}
              to={`/programs?category=${c.value}`}
              className="suggestion-card px-5 py-4 rounded-lg text-sm font-light flex items-center gap-2 transition-all duration-600"
            >
              <span className="text-lg">{c.emoji}</span>
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured programs */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-normal">Programas destacados</h2>
          <Link to="/programs" className="text-xs text-accent hover:underline flex items-center gap-1 font-light">
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featured.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-lg shadow-md hover:shadow-sm transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-normal">{p.brand_name}</p>
                  <p className="text-xs text-miiles-gray-400 font-light mt-0.5">{p.name}</p>
                </div>
                {p.commission_rate && (
                  <span className="text-xs bg-miiles-blue-light text-miiles-blue px-3 py-1 rounded-full font-light">
                    {p.commission_rate}
                  </span>
                )}
              </div>
              <p className="text-sm text-miiles-gray-400 font-light mt-4 line-clamp-2">{p.description}</p>
              <Link
                to={`/programs?highlight=${p.id}`}
                className="text-xs text-accent mt-4 inline-flex items-center gap-1 hover:underline font-light"
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
