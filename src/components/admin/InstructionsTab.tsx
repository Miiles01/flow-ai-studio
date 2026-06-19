import { useEffect, useState } from "react";
import { adminFetch } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, Brain } from "lucide-react";

type Row = { key: string; content: string; updated_at: string };

const SECTIONS: { key: string; title: string; help: string }[] = [
  { key: "global", title: "Global (siempre)", help: "Reglas que la IA aplica en TODAS las etapas: tono, idioma, lo que nunca debe mencionar." },
  { key: "generate", title: "Generar flujo", help: "Cómo construir el diagrama final (nodos, fases, estructura)." },
  { key: "clarify", title: "Preguntas / Intención", help: "Cómo hacer preguntas y entender la intención cuando el prompt es ambiguo." },
  { key: "plan", title: "Plan estratégico", help: "Cómo planear las fases antes de construir el flujo." },
  { key: "search", title: "Búsqueda (qué buscar)", help: "Qué y cuándo buscar en vivo: canales (Instagram / Google Maps), cuándo descubrir prospectos reales y cómo armar los términos de búsqueda." },
];

export default function InstructionsTab() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await adminFetch("admin-instructions", { action: "list" });
    setLoading(false);
    if (error || data?.error) {
      toast.error(data?.error ?? error?.message ?? "Error cargando");
      return;
    }
    const map: Record<string, string> = {};
    for (const r of (data.instructions as Row[]) ?? []) map[r.key] = r.content ?? "";
    setValues(map);
  };

  useEffect(() => { load(); }, []);

  const save = async (key: string) => {
    setSaving(key);
    const { error, data } = await adminFetch("admin-instructions", { action: "save", key, content: values[key] ?? "" });
    setSaving(null);
    if (error || data?.error) {
      toast.error(data?.error ?? "No se pudo guardar");
      return;
    }
    toast.success("Instrucciones guardadas");
  };

  if (loading) {
    return <div className="flex items-center gap-2 text-white/50 py-10"><Loader2 className="h-4 w-4 animate-spin" /> Cargando…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/70 font-light">
        <p className="flex items-center gap-2 text-white mb-1"><Brain className="h-4 w-4" /> Instrucciones de la IA</p>
        Estas instrucciones se aplican cada vez que la IA crea un flujo, hace preguntas o entiende la intención del usuario.
        También se pueden editar por código en GitHub en{" "}
        <code className="text-miiles-blue-light">supabase/functions/_shared/flow-instructions.ts</code> (esos son los valores por defecto; lo que guardes aquí tiene prioridad).
      </div>

      {SECTIONS.map((s) => (
        <div key={s.key} className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
          <div>
            <h3 className="text-white font-normal">{s.title}</h3>
            <p className="text-xs text-white/40 font-light">{s.help}</p>
          </div>
          <Textarea
            value={values[s.key] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
            rows={5}
            placeholder="Deja vacío para usar el valor por defecto del código…"
            className="bg-[hsl(222,20%,14%)] border-white/10 text-white text-sm font-light resize-y"
          />
          <div className="flex justify-end">
            <Button
              onClick={() => save(s.key)}
              disabled={saving === s.key}
              className="bg-white text-black hover:bg-white/90 rounded-full"
            >
              {saving === s.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
