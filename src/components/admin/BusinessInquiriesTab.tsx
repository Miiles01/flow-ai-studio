import { useEffect, useState } from "react";
import { adminFetch } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Trash2, Mail, Phone, Building2, Users, Globe, Inbox } from "lucide-react";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  team_size: string | null;
  web_or_socials: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: "new", label: "Nuevo" },
  { value: "contacted", label: "Contactado" },
  { value: "closed", label: "Cerrado" },
];

export default function BusinessInquiriesTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await adminFetch("admin-business-inquiries", { action: "list" });
    setLoading(false);
    if (error || data?.error) {
      toast.error(data?.error ?? error?.message ?? "Error cargando");
      return;
    }
    setInquiries(data.inquiries ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    const { error, data } = await adminFetch("admin-business-inquiries", { action: "update_status", id, status });
    if (error || data?.error) toast.error("No se pudo actualizar");
  };

  const remove = async (id: string) => {
    const { error, data } = await adminFetch("admin-business-inquiries", { action: "delete", id });
    if (error || data?.error) {
      toast.error("No se pudo eliminar");
      return;
    }
    setInquiries((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/50">
        <Inbox className="h-8 w-8 mb-3" />
        <p className="text-sm font-light">Aún no hay solicitudes del plan Negocios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/40 font-light">{inquiries.length} solicitud(es)</p>
      {inquiries.map((i) => (
        <div key={i.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-normal text-white">{i.name}</span>
                {i.company && (
                  <span className="inline-flex items-center gap-1 text-xs text-white/60 font-light">
                    <Building2 className="h-3 w-3" /> {i.company}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 text-sm text-white/70 font-light">
                <a href={`mailto:${i.email}`} className="inline-flex items-center gap-2 hover:text-white">
                  <Mail className="h-3.5 w-3.5" /> {i.email}
                </a>
                {i.phone && (
                  <span className="inline-flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {i.phone}</span>
                )}
                {i.team_size && (
                  <span className="inline-flex items-center gap-2"><Users className="h-3.5 w-3.5" /> {i.team_size}</span>
                )}
                {i.web_or_socials && (
                  <span className="inline-flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> {i.web_or_socials}</span>
                )}
              </div>
              {i.message && (
                <p className="text-sm text-white/60 font-light pt-1 max-w-2xl whitespace-pre-wrap">{i.message}</p>
              )}
              <p className="text-[11px] text-white/30 font-light pt-1">
                {new Date(i.created_at).toLocaleString("es-MX")}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <select
                value={i.status}
                onChange={(e) => updateStatus(i.id, e.target.value)}
                className="rounded-full bg-white/10 border border-white/10 text-white text-xs px-3 py-1.5 outline-none"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-zinc-900">{o.label}</option>
                ))}
              </select>
              <Button
                onClick={() => remove(i.id)}
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
