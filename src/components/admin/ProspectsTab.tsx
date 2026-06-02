import { useEffect, useState, useMemo } from "react";
import { adminFetch } from "@/hooks/useAdminAuth";
import FileDropzone from "./FileDropzone";
import ProspectBrain from "./ProspectBrain";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Trash2, Search, FileX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/data/prospect-categories";

type Prospect = {
  id: string;
  name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  industry: string | null;
  location: string | null;
  website: string | null;
  notes: string | null;
  tags: string[];
  source_file: string | null;
  created_at: string;
};

export default function ProspectsTab() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const load = async (s = search) => {
    setLoading(true);
    const { data, error } = await adminFetch("admin-prospects", { action: "list", search: s, limit: 500 });
    setLoading(false);
    if (error || data?.error) {
      toast.error(data?.error ?? error?.message ?? "Error cargando");
      return;
    }
    setProspects(data.prospects ?? []);
    setSources(data.sources ?? []);
    setTotal(data.total ?? 0);
  };

  useEffect(() => {
    load("");
    // Realtime: refresh the prospects base whenever rows change (imports, edits, deletes)
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const channel = supabase
      .channel("admin-prospects-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "prospects" },
        () => {
          if (debounce) clearTimeout(debounce);
          debounce = setTimeout(() => load(""), 400);
        }
      )
      .subscribe();
    return () => {
      if (debounce) clearTimeout(debounce);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async (file: File) => {
    try {
      const { data: signed, error: signErr } = await adminFetch("admin-ingest", {
        mode: "get_upload_url",
        filename: file.name,
      });
      if (signErr || signed?.error) throw new Error(signed?.error ?? signErr?.message ?? "No se pudo iniciar la subida");

      const { error: upErr } = await supabase.storage
        .from("admin-uploads")
        .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type || "application/octet-stream" });
      if (upErr) throw upErr;

      const { data, error } = await adminFetch("admin-ingest", {
        storage_path: signed.path,
        filename: file.name,
      });
      if (error || data?.error) throw new Error(data?.error ?? error?.message);
      toast.success(`${file.name}: ${data.inserted ?? 0} prospectos importados`);
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Error al importar");
    }
  };

  const handleDelete = async (id: string) => {
    await adminFetch("admin-prospects", { action: "delete", id });
    await load();
  };

  const handleDeleteSource = async (source_file: string) => {
    if (!confirm(`¿Borrar todos los prospectos de "${source_file}"?`)) return;
    await adminFetch("admin-prospects", { action: "delete_source", source_file });
    toast.success("Lote borrado");
    await load();
  };

  // Client-side filter by active category
  const filtered = useMemo(() => {
    if (!activeCategory) return prospects;
    const cat = CATEGORIES.find((c) => c.id === activeCategory);
    if (!cat) return prospects;
    return prospects.filter((p) => {
      const haystack = [
        p.industry ?? "",
        p.company ?? "",
        p.notes ?? "",
        ...(p.tags ?? []),
      ].join(" ").toLowerCase();
      return cat.keywords.some((kw) => haystack.includes(kw.toLowerCase()));
    });
  }, [prospects, activeCategory]);

  return (
    <div className="space-y-5">
      <FileDropzone onFile={handleUpload} />

      {sources.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/50 uppercase tracking-wide">Archivos cargados</p>
          <div className="flex flex-wrap gap-2">
            {sources.map((s) => (
              <button
                key={s}
                onClick={() => handleDeleteSource(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-red-950/40 hover:text-red-300 transition-colors flex items-center gap-1.5"
              >
                <FileX className="h-3 w-3" /> {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brain category map */}
      <ProspectBrain
        prospects={prospects}
        activeCategory={activeCategory}
        onFilter={setActiveCategory}
      />

      {/* Search + count */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Buscar por nombre, empresa, industria…"
            className="pl-9 bg-[hsl(222,20%,14%)] text-white"
          />
        </div>
        <Button onClick={() => load()} variant="secondary" className="bg-white/10 text-white hover:bg-white/15 border border-white/10">
          Buscar
        </Button>
        <span className="text-xs text-white/50 ml-auto">
          {activeCategory ? `${filtered.length} de ${total}` : `${total} totales`}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/60">Empresa</TableHead>
              <TableHead className="text-white/60">Nombre</TableHead>
              <TableHead className="text-white/60">Industria</TableHead>
              <TableHead className="text-white/60">Ubicación</TableHead>
              <TableHead className="text-white/60">Sitio</TableHead>
              <TableHead className="text-white/60">Tags</TableHead>
              <TableHead className="text-white/60 w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-white/50">Cargando…</TableCell>
              </TableRow>
            )}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-white/50 py-8">
                  {activeCategory ? "Sin prospectos en esta categoría" : "Sin prospectos"}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((p) => (
              <TableRow key={p.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="text-white text-sm font-medium">{p.company ?? "—"}</TableCell>
                <TableCell className="text-white/70 text-sm">{p.name ?? "—"}</TableCell>
                <TableCell className="text-white/70 text-sm">{p.industry ?? "—"}</TableCell>
                <TableCell className="text-white/60 text-sm">{p.location ?? "—"}</TableCell>
                <TableCell className="text-sm">
                  {p.website
                    ? <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-blue-400/80 hover:text-blue-300 truncate max-w-[160px] block">{p.website.replace(/^https?:\/\//, "")}</a>
                    : <span className="text-white/30">—</span>
                  }
                </TableCell>
                <TableCell className="text-xs text-white/50">{(p.tags ?? []).slice(0, 3).join(", ")}</TableCell>
                <TableCell>
                  <button onClick={() => handleDelete(p.id)} className="text-white/30 hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
