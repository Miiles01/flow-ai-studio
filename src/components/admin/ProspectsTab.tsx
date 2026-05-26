import { useEffect, useState } from "react";
import { adminFetch } from "@/hooks/useAdminAuth";
import FileDropzone from "./FileDropzone";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Trash2, Search, FileX } from "lucide-react";

type Prospect = {
  id: string;
  name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  industry: string | null;
  location: string | null;
  tags: string[];
  source_file: string | null;
  created_at: string;
};

import { supabase } from "@/integrations/supabase/client";

export default function ProspectsTab() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (s = search) => {
    setLoading(true);
    const { data, error } = await adminFetch("admin-prospects", { action: "list", search: s });
    setLoading(false);
    if (error || data?.error) {
      toast.error(data?.error ?? error?.message ?? "Error cargando");
      return;
    }
    setProspects(data.prospects ?? []);
    setSources(data.sources ?? []);
    setTotal(data.total ?? 0);
  };

  useEffect(() => { load(""); }, []);

  const handleUpload = async (file: File) => {
    try {
      // 1) Pedimos URL firmada para subir a storage (evita el límite de 50MB del edge function)
      const { data: signed, error: signErr } = await adminFetch("admin-ingest", {
        mode: "get_upload_url",
        filename: file.name,
      });
      if (signErr || signed?.error) throw new Error(signed?.error ?? signErr?.message ?? "No se pudo iniciar la subida");

      // 2) Subimos el archivo directo al storage
      const { error: upErr } = await supabase.storage
        .from("admin-uploads")
        .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type || "application/octet-stream" });
      if (upErr) throw upErr;

      // 3) El edge function descarga y procesa
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

  return (
    <div className="space-y-6">
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
        <span className="text-xs text-white/50 ml-auto">{total} totales</span>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/60">Nombre</TableHead>
              <TableHead className="text-white/60">Empresa</TableHead>
              <TableHead className="text-white/60">Rol</TableHead>
              <TableHead className="text-white/60">Email</TableHead>
              <TableHead className="text-white/60">Industria</TableHead>
              <TableHead className="text-white/60">Tags</TableHead>
              <TableHead className="text-white/60 w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={7} className="text-center text-white/50">Cargando…</TableCell></TableRow>
            )}
            {!loading && prospects.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-white/50">Sin prospectos</TableCell></TableRow>
            )}
            {prospects.map((p) => (
              <TableRow key={p.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="text-white text-sm">{p.name ?? "—"}</TableCell>
                <TableCell className="text-white/80 text-sm">{p.company ?? "—"}</TableCell>
                <TableCell className="text-white/70 text-sm">{p.role ?? "—"}</TableCell>
                <TableCell className="text-white/70 text-sm">{p.email ?? "—"}</TableCell>
                <TableCell className="text-white/70 text-sm">{p.industry ?? "—"}</TableCell>
                <TableCell className="text-xs text-white/60">{(p.tags ?? []).slice(0, 3).join(", ")}</TableCell>
                <TableCell>
                  <button onClick={() => handleDelete(p.id)} className="text-white/40 hover:text-red-400">
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
