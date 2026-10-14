import { useEffect, useState } from "react";
import { adminFetch } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Eye, EyeOff } from "lucide-react";
import { KIND_LABEL, type StudioTemplate } from "@/lib/studio";

const empty: Partial<StudioTemplate> = { title: "", kind: "portfolio", description: "", html: "", thumbnail_url: null, is_published: true };

async function toThumb(file: File): Promise<string> {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  const w = Math.min(800, img.naturalWidth);
  const c = document.createElement("canvas");
  c.width = w; c.height = Math.round((img.naturalHeight / img.naturalWidth) * w);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.8);
}

export default function StudioTab() {
  const [list, setList] = useState<StudioTemplate[]>([]);
  const [form, setForm] = useState<Partial<StudioTemplate> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await adminFetch("admin-studio-templates", { action: "list" });
    if (error || data?.error) return toast.error(data?.error ?? error?.message);
    setList(data.templates ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const { data, error } = await adminFetch("admin-studio-templates", { action: "upsert", template: form });
    setSaving(false);
    if (error || data?.error) return toast.error(data?.error ?? error?.message);
    toast.success("Plantilla guardada");
    setForm(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Borrar esta plantilla?")) return;
    await adminFetch("admin-studio-templates", { action: "delete", id });
    load();
  };

  const togglePub = async (t: StudioTemplate) => {
    await adminFetch("admin-studio-templates", { action: "upsert", template: { ...t, is_published: !t.is_published } });
    load();
  };

  const field = "bg-white/5 border-white/10 text-white";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-5 rounded-xl bg-white/5 border border-white/10">
        <div>
          <p className="text-sm text-white font-light">Plantillas del Estudio</p>
          <p className="text-xs text-white/60 mt-1 font-light">Portafolios y páginas web que los usuarios pueden ver, copiar y descargar.</p>
        </div>
        <Button onClick={() => setForm({ ...empty })} className="bg-white text-black hover:bg-white/90">
          <Plus className="h-4 w-4" /> Nueva
        </Button>
      </div>

      {form && (
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <Input className={field} placeholder="Nombre" value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="flex gap-2">
            {(["portfolio", "website"] as const).map((k) => (
              <button key={k} onClick={() => setForm({ ...form, kind: k })}
                className={`px-4 py-1.5 rounded-full text-sm ${form.kind === k ? "bg-white text-black" : "bg-white/10 text-white/60"}`}>
                {KIND_LABEL[k]}
              </button>
            ))}
          </div>
          <Textarea className={field} placeholder="Descripción" value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex items-center gap-3">
            <label className="text-xs text-white/60">Miniatura</label>
            <input type="file" accept="image/*" className="text-xs text-white/60"
              onChange={async (e) => { const f = e.target.files?.[0]; if (f) setForm({ ...form, thumbnail_url: await toThumb(f) }); }} />
            {form.thumbnail_url && <img src={form.thumbnail_url} className="h-12 rounded" alt="" />}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-white/60">Archivo HTML</label>
            <input type="file" accept=".html,.htm,text/html" className="text-xs text-white/60"
              onChange={async (e) => { const f = e.target.files?.[0]; if (f) setForm({ ...form, html: await f.text() }); }} />
          </div>
          <Textarea className={`${field} font-mono text-xs min-h-[200px]`} placeholder="…o pega el HTML aquí" value={form.html ?? ""} onChange={(e) => setForm({ ...form, html: e.target.value })} />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" className="text-white/70 hover:bg-white/10" onClick={() => setForm(null)}>Cancelar</Button>
            <Button onClick={save} disabled={saving} className="bg-white text-black hover:bg-white/90">{saving ? "Guardando…" : "Guardar"}</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((t) => (
          <div key={t.id} className="p-5 rounded-xl bg-white/5 border border-white/10 flex justify-between gap-3">
            <div>
              <p className="text-sm text-white font-light">{t.title}</p>
              <p className="text-xs text-white/50">{KIND_LABEL[t.kind] ?? t.kind} · /studio/{t.slug} {t.is_published ? "" : "· oculta"}</p>
            </div>
            <div className="flex gap-2 text-white/50">
              <button onClick={() => togglePub(t)} title="Publicar/ocultar" className="hover:text-white">{t.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
              <button onClick={() => setForm(t)} className="hover:text-white"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(t.id)} className="hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
