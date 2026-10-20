import { useEffect, useRef, useState } from "react";
import { adminFetch } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Eye, EyeOff, Upload, Download, Loader2 } from "lucide-react";
import { KIND_LABEL, downloadTemplateZip, type StudioTemplate } from "@/lib/studio";
import { studioThumbnail, uploadStudioProject } from "@/lib/studioUpload";

const empty: Partial<StudioTemplate> = { title: "", kind: "portfolio", description: "", html: "", thumbnail_url: null, is_published: true };

export default function StudioTab() {
  const [list, setList] = useState<StudioTemplate[]>([]);
  const [form, setForm] = useState<Partial<StudioTemplate> | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [entry, setEntry] = useState("index.html");
  const [progress, setProgress] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const load = async () => {
    setLoading(true);
    const { data, error } = await adminFetch("admin-studio-templates", { action: "list" });
    setLoading(false);
    if (error || data?.error) { setLoadError(data?.error ?? error?.message ?? "No se pudieron cargar las plantillas"); return; }
    setLoadError(""); setList(data.templates ?? []);
  };
  useEffect(() => { void load(); }, []);
  const edit = (template: Partial<StudioTemplate>) => { setFile(null); setEntry("index.html"); setProgress(""); setSaveError(""); setForm({ ...template }); };
  const save = async () => {
    if (!form?.title?.trim()) return toast.error("Escribe un nombre");
    if (!form.thumbnail_url) return toast.error("Sube una miniatura para la Librería");
    setSaving(true);
    setSaveError("");
    try {
      const project = file ? await uploadStudioProject(file, entry, setProgress) : {};
      const template = { ...form, ...project };
      if (!template.html?.trim() && !template.preview_url) throw new Error("Sube un proyecto o un archivo HTML");
      setProgress("Guardando plantilla…");
      const { data, error } = await adminFetch("admin-studio-templates", { action: "upsert", template });
      if (error || data?.error) throw new Error(data?.error ?? error?.message);
      toast.success("Plantilla guardada"); setForm(null); setFile(null); await load();
    } catch (err) { const message = err instanceof Error ? err.message : "No se pudo guardar"; setSaveError(message); toast.error(message); }
    finally { setSaving(false); setProgress(""); }
  };
  const remove = async (id: string) => {
    if (!confirm("¿Borrar esta plantilla?")) return;
    const { data, error } = await adminFetch("admin-studio-templates", { action: "delete", id });
    if (error || data?.error) return toast.error(data?.error ?? error?.message);
    toast.success("Plantilla eliminada"); await load();
  };
  const togglePub = async (t: StudioTemplate) => {
    const { data, error } = await adminFetch("admin-studio-templates", { action: "upsert", template: { ...t, is_published: !t.is_published } });
    if (error || data?.error) return toast.error(data?.error ?? error?.message);
    await load();
  };
  return (
    <div className="dark space-y-6 text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-normal">Plantillas del Estudio</h2>
        <Button onClick={() => edit(empty)}><Plus /> Nueva plantilla</Button>
      </div>
      {form && <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="space-y-5 border-b border-border pb-8">
        <fieldset disabled={saving} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="studio-title">Nombre</Label><Input id="studio-title" required value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="studio-kind">Tipo</Label><select id="studio-kind" className="h-10 w-full rounded-md bg-input px-3 text-sm text-foreground" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>{Object.entries(KIND_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}</select></div>
          </div>
          <div className="space-y-2"><Label htmlFor="studio-description">Descripción</Label><Textarea id="studio-description" value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3"><Label htmlFor="studio-thumbnail">Miniatura de la Librería · 16:9</Label>
              <Input id="studio-thumbnail" type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { const thumbnail_url = await studioThumbnail(f); setForm((prev) => prev ? { ...prev, thumbnail_url } : prev); } catch (err) { toast.error(err instanceof Error ? err.message : "No se pudo cargar la imagen"); } }} />
              {form.thumbnail_url && <img src={form.thumbnail_url} alt="Miniatura de la plantilla" className="aspect-video w-full rounded-lg object-cover" />}
            </div>
            <div className="space-y-3"><Label>Proyecto ZIP</Label>
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (saving) return; const f = e.dataTransfer.files[0]; if (f?.name.toLowerCase().endsWith(".zip")) setFile(f); else toast.error("Selecciona un ZIP"); }} className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted-foreground bg-muted p-4">
                <Upload className="text-muted-foreground" /><span className="max-w-full break-all text-sm">{file?.name ?? "Arrastra tu ZIP"}</span>
                <Button type="button" variant="secondary" onClick={() => fileInput.current?.click()}>Seleccionar archivo</Button>
                <input ref={fileInput} aria-label="Proyecto ZIP" type="file" accept=".zip" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
              <Label htmlFor="studio-entry">Página principal</Label><Input id="studio-entry" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="index.html o dist/index.html" />
              <details className="text-xs text-muted-foreground"><summary>Descargar desde GitHub</summary><p className="mt-2 leading-relaxed">Selecciona la rama en GitHub → Code → Download ZIP. Sube ese archivo aquí. Si el proyecto necesita compilarse, incluye su carpeta dist con index.html, CSS y JavaScript. No se ejecutan servidores ni compilaciones al subirlo.</p></details>
              {form.download_url && !file && <span className="text-xs text-muted-foreground">Proyecto actual guardado</span>}
            </div>
          </div>
          <details><summary className="text-sm text-muted-foreground">HTML alternativo</summary><div className="mt-3 space-y-3">
            <Input aria-label="Archivo HTML" type="file" accept=".html,.htm" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const html = await f.text(); setForm((prev) => prev ? { ...prev, html, preview_url: null, download_url: null } : prev); setFile(null); } }} />
            <Textarea aria-label="Código HTML" className="min-h-40 font-mono text-xs" value={form.html ?? ""} onChange={(e) => setForm({ ...form, html: e.target.value, preview_url: null, download_url: null })} />
          </div></details>
          <div className="flex items-center gap-3"><Switch id="studio-published" checked={form.is_published !== false} onCheckedChange={(checked) => setForm({ ...form, is_published: checked })} /><Label htmlFor="studio-published">Visible en la Librería</Label></div>
        </fieldset>
        {saveError && <p role="alert" className="text-sm text-destructive-foreground">{saveError}</p>}
        <div className="flex flex-wrap items-center justify-end gap-3"><span role="status" className="text-xs text-muted-foreground">{progress}</span><Button type="button" variant="ghost" disabled={saving} onClick={() => setForm(null)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="animate-spin" />}{saving ? "Guardando…" : "Guardar plantilla"}</Button></div>
      </form>}
      {loading && <Loader2 className="animate-spin text-muted-foreground" />}
      {loadError && <div role="alert" className="flex items-center gap-3 text-sm">{loadError}<Button variant="secondary" onClick={load}>Reintentar</Button></div>}
      {!loading && !loadError && !list.length && <p className="text-sm text-muted-foreground">Aún no hay plantillas.</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((t) => <article key={t.id} className="overflow-hidden rounded-lg bg-card">
        {t.thumbnail_url ? <img src={t.thumbnail_url} alt={t.title} className="aspect-video w-full object-cover" /> : <div className="aspect-video bg-muted" />}
        <div className="space-y-3 p-4"><div><h3 className="text-sm font-normal text-foreground">{t.title}</h3><p className="text-xs text-muted-foreground">{t.template_number !== undefined ? `#${t.template_number} · ` : ""}{KIND_LABEL[t.kind]} · {t.is_published ? "Visible" : "Oculta"}</p></div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" title="Publicar u ocultar" aria-label={`Publicar u ocultar ${t.title}`} onClick={() => togglePub(t)}>{t.is_published ? <Eye /> : <EyeOff />}</Button>
          <Button size="icon" variant="ghost" title="Editar" aria-label={`Editar ${t.title}`} onClick={() => edit(t)}><Pencil /></Button>
          <Button size="icon" variant="ghost" title="Descargar proyecto" aria-label={`Descargar ${t.title}`} onClick={() => downloadTemplateZip(t)}><Download /></Button>
          <Button size="icon" variant="ghost" title="Eliminar" aria-label={`Eliminar ${t.title}`} onClick={() => remove(t.id)}><Trash2 /></Button>
        </div></div>
      </article>)}</div>
    </div>
  );
}
