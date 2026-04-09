import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Search, Bookmark, BookmarkCheck, ExternalLink, Loader2, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newProgram, setNewProgram] = useState({
    name: "",
    brand_name: "",
    description: "",
    category: "general",
    commission_rate: "",
    program_url: "",
  });

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    const [progsRes, appsRes, roleRes] = await Promise.all([
      supabase.from("brand_programs").select("*"),
      supabase.from("user_applications").select("program_id").eq("user_id", user.id),
      supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
    ]);
    setPrograms((progsRes.data as Program[]) || []);
    setSavedIds(new Set((appsRes.data || []).map((a: any) => a.program_id)));
    setIsAdmin(!!roleRes.data);
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

  async function handleAddProgram(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("brand_programs").insert({
      name: newProgram.name,
      brand_name: newProgram.brand_name,
      description: newProgram.description,
      category: newProgram.category,
      commission_rate: newProgram.commission_rate || null,
      program_url: newProgram.program_url || null,
    });
    if (error) {
      toast.error("Error al añadir programa");
    } else {
      toast.success("Programa añadido");
      setNewProgram({ name: "", brand_name: "", description: "", category: "general", commission_rate: "", program_url: "" });
      setDialogOpen(false);
      loadData();
    }
    setSaving(false);
  }

  async function handleDeleteProgram(programId: string) {
    const { error } = await supabase.from("brand_programs").delete().eq("id", programId);
    if (error) {
      toast.error("Error al eliminar programa");
    } else {
      toast.success("Programa eliminado");
      setPrograms((prev) => prev.filter((p) => p.id !== programId));
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-normal">Programas de marcas</h1>
          <p className="text-sm text-miiles-gray-400 font-light mt-2">Encuentra y guarda programas de afiliados y colaboraciones</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus size={14} />
                Añadir programa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-normal">Nuevo programa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProgram} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label className="font-light">Marca</Label>
                  <Input value={newProgram.brand_name} onChange={(e) => setNewProgram({ ...newProgram, brand_name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-light">Nombre del programa</Label>
                  <Input value={newProgram.name} onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-light">Descripción</Label>
                  <Input value={newProgram.description} onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-light">Categoría</Label>
                    <select
                      value={newProgram.category}
                      onChange={(e) => setNewProgram({ ...newProgram, category: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {categoryOptions.filter(c => c !== "todos").map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-light">Comisión</Label>
                    <Input placeholder="ej: 10%" value={newProgram.commission_rate} onChange={(e) => setNewProgram({ ...newProgram, commission_rate: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-light">URL del programa</Label>
                  <Input type="url" placeholder="https://..." value={newProgram.program_url} onChange={(e) => setNewProgram({ ...newProgram, program_url: e.target.value })} />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                  Añadir
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
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
            className="p-6 rounded-lg shadow-md transition-shadow duration-200 relative"
          >
            {isAdmin && (
              <button
                onClick={() => handleDeleteProgram(p.id)}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Eliminar programa"
              >
                <X size={14} />
              </button>
            )}
            <div className="flex items-start justify-between pr-6">
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
