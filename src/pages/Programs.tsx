import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Search, Bookmark, BookmarkCheck, ExternalLink, Loader2, Plus, X, Pencil } from "lucide-react";
import { motion } from "framer-motion";
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
  banner_url: string | null;
  banner_position: number;
};

const categoryOptions = ["todos", "deportes", "moda", "belleza", "tech", "general"];

type ProgramFormData = {
  name: string;
  brand_name: string;
  description: string;
  category: string;
  commission_rate: string;
  program_url: string;
  is_featured: boolean;
  banner_url: string;
  banner_position: number;
};

const emptyForm: ProgramFormData = {
  name: "",
  brand_name: "",
  description: "",
  category: "general",
  commission_rate: "",
  program_url: "",
  is_featured: false,
  banner_url: "",
  banner_position: 50,
};

function ProgramFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  saving,
  title,
  submitLabel,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialData: ProgramFormData;
  onSubmit: (data: ProgramFormData) => void;
  saving: boolean;
  title: string;
  submitLabel: string;
}) {
  const [form, setForm] = useState(initialData);

  useEffect(() => {
    setForm(initialData);
  }, [initialData, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-normal">{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="space-y-4 mt-2"
        >
          <div className="space-y-2">
            <Label className="font-light">Marca</Label>
            <Input value={form.brand_name} onChange={(e) => setForm({ ...form, brand_name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label className="font-light">Nombre del programa</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label className="font-light">Descripción</Label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-md bg-background shadow-sm px-3 py-2 text-sm font-light min-h-[80px] resize-none focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-light">Categoría</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-md bg-background shadow-sm px-3 py-2 text-sm"
              >
                {categoryOptions.filter((c) => c !== "todos").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="font-light">Comisión</Label>
              <Input placeholder="ej: 10%" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-light">URL del programa</Label>
            <Input type="url" placeholder="https://..." value={form.program_url} onChange={(e) => setForm({ ...form, program_url: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="font-light">Banner (URL de imagen)</Label>
            <Input type="url" placeholder="https://ejemplo.com/banner.jpg" value={form.banner_url} onChange={(e) => setForm({ ...form, banner_url: e.target.value })} />
            {form.banner_url && (
              <div className="space-y-2 mt-1">
                <div className="w-full h-24 rounded-md overflow-hidden relative">
                  <img
                    src={form.banner_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: `center ${form.banner_position}%` }}
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-light shrink-0">Posición</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form.banner_position}
                    onChange={(e) => setForm({ ...form, banner_position: Number(e.target.value) })}
                    className="w-full accent-primary h-1"
                  />
                </div>
              </div>
            )}
              />
            )}
          </div>
          <label className="flex items-center gap-2 text-sm font-light cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="rounded"
            />
            Destacado
          </label>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
            {submitLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Programs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "todos");
  const [isAdmin, setIsAdmin] = useState(false);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editProgram, setEditProgram] = useState<Program | null>(null);

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

  async function handleAdd(data: ProgramFormData) {
    setSaving(true);
    const { error } = await supabase.from("brand_programs").insert({
      name: data.name,
      brand_name: data.brand_name,
      description: data.description,
      category: data.category,
      commission_rate: data.commission_rate || null,
      program_url: data.program_url || null,
      is_featured: data.is_featured,
      banner_url: data.banner_url || null,
      banner_position: data.banner_position,
    });
    if (error) {
      toast.error("Error al añadir programa");
    } else {
      toast.success("Programa añadido");
      setAddOpen(false);
      loadData();
    }
    setSaving(false);
  }

  async function handleEdit(data: ProgramFormData) {
    if (!editProgram) return;
    setSaving(true);
    const { error } = await supabase.from("brand_programs").update({
      name: data.name,
      brand_name: data.brand_name,
      description: data.description,
      category: data.category,
      commission_rate: data.commission_rate || null,
      program_url: data.program_url || null,
      is_featured: data.is_featured,
      banner_url: data.banner_url || null,
      banner_position: data.banner_position,
    }).eq("id", editProgram.id);
    if (error) {
      toast.error("Error al actualizar programa");
    } else {
      toast.success("Programa actualizado");
      setEditOpen(false);
      setEditProgram(null);
      loadData();
    }
    setSaving(false);
  }

  async function handleDelete(programId: string) {
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
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus size={14} />
            Añadir programa
          </Button>
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
            className="rounded-lg shadow-md transition-shadow duration-200 relative cursor-pointer hover:-translate-y-1 transition-transform overflow-hidden"
            onClick={() => navigate(`/programs/${p.id}`)}
          >
            {p.banner_url && (
              <img
                src={p.banner_url}
                alt={p.brand_name}
                className="w-full h-32 object-cover"
                style={{ objectPosition: `center ${p.banner_position}%` }}
                loading="lazy"
              />
            )}
            <div className="p-6">
            {isAdmin && (
              <div className="absolute top-3 right-3 flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditProgram(p);
                    setEditOpen(true);
                  }}
                  className="p-1 rounded-full hover:bg-miiles-blue-light text-muted-foreground hover:text-miiles-blue transition-colors"
                  title="Editar programa"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                  className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Eliminar programa"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="flex items-start justify-between pr-12">
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
                onClick={(e) => { e.stopPropagation(); toggleSave(p.id); }}
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
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-accent hover:underline inline-flex items-center gap-1 font-light"
                >
                  Visitar <ExternalLink size={12} />
                </a>
              )}
            </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-miiles-gray-400 font-light">
          <p>No se encontraron programas</p>
        </div>
      )}

      {/* Add program dialog */}
      <ProgramFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        initialData={emptyForm}
        onSubmit={handleAdd}
        saving={saving}
        title="Nuevo programa"
        submitLabel="Añadir"
      />

      {/* Edit program dialog */}
      {editProgram && (
        <ProgramFormDialog
          open={editOpen}
          onOpenChange={(v) => { setEditOpen(v); if (!v) setEditProgram(null); }}
          initialData={{
            name: editProgram.name,
            brand_name: editProgram.brand_name,
            description: editProgram.description,
            category: editProgram.category,
            commission_rate: editProgram.commission_rate || "",
            program_url: editProgram.program_url || "",
            is_featured: editProgram.is_featured,
            banner_url: editProgram.banner_url || "",
            banner_position: editProgram.banner_position ?? 50,
          }}
          onSubmit={handleEdit}
          saving={saving}
          title="Editar programa"
          submitLabel="Guardar cambios"
        />
      )}
    </div>
  );
}
