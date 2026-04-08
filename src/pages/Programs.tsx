import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Search, Bookmark, BookmarkCheck, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Program = {
  id: string;
  name: string;
  brand_name: string;
  description: string;
  category: string;
  commission_rate: string | null;
  program_url: string | null;
  is_featured: boolean;
};

const categoryOptions = ["todos", "deportes", "moda", "belleza", "tech", "general"];

export default function Programs() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "todos");

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    const [progsRes, appsRes] = await Promise.all([
      supabase.from("brand_programs").select("*"),
      supabase.from("user_applications").select("program_id").eq("user_id", user.id),
    ]);
    setPrograms((progsRes.data as Program[]) || []);
    setSavedIds(new Set((appsRes.data || []).map((a: any) => a.program_id)));
    setLoading(false);
  }

  async function toggleSave(programId: string) {
    if (!user) return;
    if (savedIds.has(programId)) {
      await supabase.from("user_applications").delete().eq("user_id", user.id).eq("program_id", programId);
      setSavedIds((prev) => { const s = new Set(prev); s.delete(programId); return s; });
      toast.success("Programa eliminado");
    } else {
      await supabase.from("user_applications").insert({ user_id: user.id, program_id: programId, status: "saved" });
      setSavedIds((prev) => new Set(prev).add(programId));
      toast.success("Programa guardado");
    }
  }

  const filtered = programs.filter((p) => {
    const matchCat = category === "todos" || p.category === category;
    const matchSearch = !search || p.brand_name.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-miiles-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-normal">Programas de marcas</h1>
        <p className="text-sm text-miiles-gray-400 font-light mt-2">Encuentra y guarda programas de afiliados y colaboraciones</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-miiles-gray-400" />
          <Input
            placeholder="Buscar marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categoryOptions.map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); setSearchParams(c === "todos" ? {} : { category: c }); }}
              className={`px-4 py-2 rounded-full text-xs transition-all duration-200 capitalize font-light ${
                category === c
                  ? "bg-foreground text-background"
                  : "bg-background text-miiles-gray-400 shadow-sm hover:-translate-y-1 hover:bg-foreground hover:text-background"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="p-6 rounded-lg shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-normal">{p.brand_name}</p>
                <p className="text-xs text-miiles-gray-400 font-light mt-0.5">{p.name}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {p.commission_rate && (
                  <span className="text-xs bg-miiles-blue-light text-miiles-blue px-3 py-1 rounded-full font-light">
                    {p.commission_rate}
                  </span>
                )}
                <span className="text-[10px] bg-miiles-pink-light text-miiles-pink px-2 py-0.5 rounded-full capitalize font-light">
                  {p.category}
                </span>
              </div>
            </div>
            <p className="text-sm text-miiles-gray-400 font-light mt-4 line-clamp-2">{p.description}</p>
            <div className="flex items-center gap-3 mt-5">
              <Button
                size="sm"
                variant={savedIds.has(p.id) ? "default" : "secondary"}
                onClick={() => toggleSave(p.id)}
                className="text-xs"
              >
                {savedIds.has(p.id) ? <BookmarkCheck size={14} className="mr-1" /> : <Bookmark size={14} className="mr-1" />}
                {savedIds.has(p.id) ? "Guardado" : "Guardar"}
              </Button>
              {p.program_url && (
                <a
                  href={p.program_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline inline-flex items-center gap-1 font-light"
                >
                  Visitar <ExternalLink size={12} />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-miiles-gray-400 font-light">
          <p>No se encontraron programas</p>
        </div>
      )}
    </div>
  );
}
