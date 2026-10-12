import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Phone, Plus, Trash2, Loader2, Lock } from "lucide-react";

type Lead = { id: string; name: string; phone: string | null; status: string; service: string | null; created_at: string };

const SERVICES = ["Diseño de marca", "Embudo de ventas", "Sistema de clínicas"];

const COLUMNS = [
  { key: "new", label: "Nuevo", dot: "bg-miiles-blue" },
  { key: "contacted", label: "Contactado", dot: "bg-amber-400" },
  { key: "won", label: "Ganado", dot: "bg-emerald-500" },
  { key: "lost", label: "Perdido", dot: "bg-red-400" },
];

const call = (pin: string, payload: Record<string, unknown>) =>
  supabase.functions.invoke("sales-leads", { body: { pin, ...payload } });

export default function Ventas() {
  const [pin, setPin] = useState(() => sessionStorage.getItem("ventas_pin") ?? "");
  const [unlocked, setUnlocked] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("new");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState(SERVICES[0]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    document.title = "Ventas · Miiles";
    if (pin) unlock(pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unlock = async (p: string) => {
    setLoading(true);
    const { data, error } = await call(p, { action: "list" });
    setLoading(false);
    if (error || data?.error) {
      sessionStorage.removeItem("ventas_pin");
      if (p) toast.error("PIN incorrecto");
      return;
    }
    sessionStorage.setItem("ventas_pin", p);
    setLeads(data.leads ?? []);
    setUnlocked(true);
  };

  const add = async () => {
    if (!name.trim()) return;
    const { data, error } = await call(pin, { action: "create", name, phone, service });
    if (error || data?.error) return toast.error("No se pudo guardar");
    setLeads((l) => [data.lead, ...l]);
    setName(""); setPhone(""); setShowAdd(false); setTab("new");
  };

  const move = async (id: string, status: string) => {
    setLeads((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
    const { error, data } = await call(pin, { action: "status", id, status });
    if (error || data?.error) toast.error("No se pudo actualizar");
  };

  const changeService = async (id: string, service: string) => {
    setLeads((l) => l.map((x) => (x.id === id ? { ...x, service } : x)));
    const { error, data } = await call(pin, { action: "service", id, service });
    if (error || data?.error) toast.error("No se pudo actualizar");
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar lead?")) return;
    setLeads((l) => l.filter((x) => x.id !== id));
    await call(pin, { action: "delete", id });
  };

  const copy = (text: string, what: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${what} copiado`);
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-miiles-gray-50 p-6">
        <form
          onSubmit={(e) => { e.preventDefault(); unlock(pin); }}
          className="w-full max-w-xs bg-white rounded-[24px] shadow-md p-8 space-y-5 text-center"
        >
          <div className="mx-auto h-12 w-12 rounded-full bg-miiles-blue-light flex items-center justify-center">
            <Lock className="h-5 w-5 text-miiles-blue" />
          </div>
          <h1 className="text-xl font-normal text-black">Panel de ventas</h1>
          <Input
            autoFocus type="password" inputMode="numeric" maxLength={8} placeholder="PIN"
            value={pin} onChange={(e) => setPin(e.target.value)}
            className="text-center text-2xl tracking-[0.5em] h-14"
          />
          <Button type="submit" disabled={loading} className="w-full rounded-full bg-black text-white hover:bg-miiles-pink h-12">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
          </Button>
        </form>
      </div>
    );
  }

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-[#F3F4F6] p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-normal text-black capitalize truncate">{lead.name.toLowerCase()}</p>
          <p className="text-xs text-miiles-gray-400 font-light">{lead.phone || "Sin teléfono"}</p>
          <select
            value={lead.service ?? SERVICES[0]}
            onChange={(e) => changeService(lead.id, e.target.value)}
            className="mt-1.5 rounded-full bg-miiles-blue-light text-miiles-blue text-[10px] px-2 py-0.5 outline-none cursor-pointer"
          >
            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={() => remove(lead.id)} className="text-miiles-gray-400 hover:text-red-500 p-1" aria-label="Eliminar">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" className="rounded-full flex-1 h-9 text-xs" onClick={() => copy(lead.name, "Nombre")}>
          <Copy className="h-3 w-3 mr-1" /> Nombre
        </Button>
        {lead.phone && (
          <>
            <Button size="sm" variant="secondary" className="rounded-full flex-1 h-9 text-xs" onClick={() => copy(lead.phone!, "Número")}>
              <Copy className="h-3 w-3 mr-1" /> Número
            </Button>
            <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className="h-9 w-9 shrink-0 rounded-full bg-black text-white flex items-center justify-center hover:bg-miiles-pink" aria-label="Llamar">
              <Phone className="h-3.5 w-3.5" />
            </a>
          </>
        )}
      </div>
      <select
        value={lead.status}
        onChange={(e) => move(lead.id, e.target.value)}
        className="w-full rounded-full bg-miiles-gray-50 border border-miiles-gray-200 text-xs px-3 h-9 outline-none text-black"
      >
        {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-miiles-gray-50">
      <header className="sticky top-0 z-10 bg-miiles-gray-50/90 backdrop-blur px-4 md:px-8 pt-5 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-normal text-black">Ventas</h1>
          <Button onClick={() => setShowAdd((s) => !s)} className="rounded-full bg-black text-white hover:bg-miiles-pink">
            <Plus className="h-4 w-4 mr-1" /> Lead
          </Button>
        </div>
        {showAdd && (
          <form onSubmit={(e) => { e.preventDefault(); add(); }} className="bg-white rounded-2xl shadow-sm p-3 flex flex-col sm:flex-row gap-2">
            <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <Input placeholder="Teléfono" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <select
              value={service} onChange={(e) => setService(e.target.value)}
              className="rounded-md border border-input bg-background px-3 h-10 text-sm outline-none text-black sm:w-44"
            >
              {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Button type="submit" className="rounded-full bg-black text-white hover:bg-miiles-pink">Guardar</Button>
          </form>
        )}
        {/* Tabs mobile */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide md:hidden -mx-4 px-4">
          {COLUMNS.map((c) => {
            const n = leads.filter((l) => l.status === c.key).length;
            return (
              <button
                key={c.key} onClick={() => setTab(c.key)}
                className={`shrink-0 rounded-full px-4 h-9 text-xs ${tab === c.key ? "bg-black text-white" : "bg-white text-miiles-gray-400 shadow-sm"}`}
              >
                {c.label} · {n}
              </button>
            );
          })}
        </div>
      </header>

      {/* Mobile: una columna */}
      <div className="md:hidden px-4 pb-10 space-y-3">
        {leads.filter((l) => l.status === tab).map((l) => <LeadCard key={l.id} lead={l} />)}
        {leads.filter((l) => l.status === tab).length === 0 && (
          <p className="text-center text-xs text-miiles-gray-400 py-10 font-light">Sin leads aquí</p>
        )}
      </div>

      {/* Desktop: board */}
      <div className="hidden md:grid grid-cols-4 gap-4 px-8 pb-10">
        {COLUMNS.map((c) => {
          const items = leads.filter((l) => l.status === c.key);
          return (
            <div key={c.key} className="bg-miiles-gray-100 rounded-2xl p-3 space-y-3 min-h-[60vh]">
              <div className="flex items-center gap-2 px-1">
                <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                <span className="text-sm font-normal text-black">{c.label}</span>
                <span className="text-xs text-miiles-gray-400 ml-auto">{items.length}</span>
              </div>
              {items.map((l) => <LeadCard key={l.id} lead={l} />)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
