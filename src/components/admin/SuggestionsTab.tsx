import { useEffect, useState } from "react";
import { adminFetch } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Trash2, Lightbulb, Inbox } from "lucide-react";

type Suggestion = {
  id: string;
  message: string;
  network: string | null;
  context: string | null;
  status: string;
  created_at: string;
  author_name: string | null;
  author_username: string | null;
};

const STATUS_OPTIONS = [
  { value: "new", label: "Nueva" },
  { value: "reviewed", label: "Revisada" },
  { value: "applied", label: "Aplicada" },
  { value: "archived", label: "Archivada" },
];

export default function SuggestionsTab() {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await adminFetch("admin-suggestions", { action: "list" });
    setLoading(false);
    if (error || data?.error) {
      toast.error(data?.error ?? error?.message ?? "Error cargando");
      return;
    }
    setItems(data.suggestions ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    const { error, data } = await adminFetch("admin-suggestions", { action: "update_status", id, status });
    if (error || data?.error) toast.error("No se pudo actualizar");
  };

  const remove = async (id: string) => {
    const { error, data } = await adminFetch("admin-suggestions", { action: "delete", id });
    if (error || data?.error) {
      toast.error("No se pudo eliminar");
      return;
    }
    setItems((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/50">
        <Inbox className="h-8 w-8 mb-3" />
        <p className="text-sm font-light">Aún no hay sugerencias de usuarios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/40 font-light">{items.length} sugerencia(s)</p>
      {items.map((s) => (
        <div key={s.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-base font-normal text-white">
                  <Lightbulb className="h-4 w-4" /> {s.author_name || "Usuario"}
                </span>
                {s.author_username && (
                  <span className="text-xs text-white/40 font-light">@{s.author_username}</span>
                )}
                {s.network && (
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-light text-white/70 capitalize">
                    {s.network}
                  </span>
                )}
              </div>
              <p className="max-w-2xl whitespace-pre-wrap text-sm font-light text-white/70">{s.message}</p>
              <p className="pt-1 text-[11px] font-light text-white/30">
                {s.context ? `${s.context} · ` : ""}
                {new Date(s.created_at).toLocaleString("es-MX")}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <select
                value={s.status}
                onChange={(e) => updateStatus(s.id, e.target.value)}
                className="rounded-full bg-white/10 border border-white/10 text-white text-xs px-3 py-1.5 outline-none"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-zinc-900">{o.label}</option>
                ))}
              </select>
              <Button
                onClick={() => remove(s.id)}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-950/40"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
