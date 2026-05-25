import { useEffect, useState } from "react";
import { adminFetch } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, Trash2, FileCode } from "lucide-react";

type Template = {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  nodes: any[];
  edges: any[];
  prompt_hint: string;
  updated_at: string;
};

// Lee todos los archivos JSON de plantillas del repo
const templateFiles = import.meta.glob("@/data/flow-templates/*.json", { eager: true }) as Record<string, any>;

export default function TemplatesTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await adminFetch("admin-sync-templates", { action: "list" });
    setLoading(false);
    if (error || data?.error) {
      toast.error(data?.error ?? error?.message ?? "Error");
      return;
    }
    setTemplates(data.templates ?? []);
  };

  useEffect(() => { load(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    const local = Object.entries(templateFiles).map(([path, mod]) => {
      const t = (mod as any).default ?? mod;
      return { ...t, slug: t.slug ?? path.split("/").pop()?.replace(".json", "") };
    });
    const { data, error } = await adminFetch("admin-sync-templates", { action: "sync", templates: local });
    setSyncing(false);
    if (error || data?.error) {
      toast.error(data?.error ?? error?.message ?? "Error");
      return;
    }
    toast.success(`${data.synced} plantillas sincronizadas desde el repo`);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Borrar esta plantilla?")) return;
    await adminFetch("admin-sync-templates", { action: "delete", id });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 p-5 rounded-xl bg-white/5 border border-white/10">
        <div>
          <p className="text-sm text-white font-light">Plantillas desde el repo</p>
          <p className="text-xs text-white/60 mt-1 font-light">
            Edita los archivos en <code className="text-white/80">src/data/flow-templates/*.json</code> y haz push a GitHub. Se sincronizarán <strong className="text-[#4059F1]">automáticamente</strong> mediante Actions.
          </p>
          <p className="text-xs text-white/40 mt-1">{Object.keys(templateFiles).length} archivos detectados en el repo local</p>
        </div>
        <Button onClick={handleSync} disabled={syncing} className="bg-white/10 text-white hover:bg-white/20 shrink-0 border border-white/10">
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          Forzar Sync Manual
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-white/50">Cargando…</p>
      ) : templates.length === 0 ? (
        <p className="text-sm text-white/50 text-center py-12">Aún no hay plantillas. Sincroniza desde el repo.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <FileCode className="h-4 w-4 text-white/60 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-white font-light">{t.title}</p>
                    <p className="text-xs text-white/50 mt-0.5">{t.slug}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(t.id)} className="text-white/40 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {t.description && <p className="text-xs text-white/70 font-light">{t.description}</p>}
              <div className="flex flex-wrap gap-1.5">
                {(t.tags ?? []).map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">{tag}</span>
                ))}
              </div>
              <div className="text-[10px] text-white/40">
                {(t.nodes ?? []).length} nodos · {(t.edges ?? []).length} edges
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
