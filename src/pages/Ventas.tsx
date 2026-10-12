import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Phone, Plus, Trash2, Loader2, Lock } from "lucide-react";

type Lead = { id: string; name: string; phone: string | null; status: string; service: string | null; created_at: string };

const SERVICES = ["Diseño de marca", "Embudo de ventas", "Sistema de clínicas"];

const COLUMNS = [
  { key: "new", label: "Nuevo", dot: "bg-miiles-blue" },
  { key: "contacted", label: "Contactado", dot: "bg-amber-400" },
  { key: "won", label: "Ganado", dot: "bg-emerald-500" },
  { key: "lost", label: "Perdido", dot: "bg-red-400" },
];

let channel: ReturnType<typeof supabase.channel> | null = null;
let subscribed = false;
const ping = () => { if (subscribed && channel) channel.send({ type: "broadcast", event: "changed", payload: {} }); };

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
  const [filter, setFilter] = useState<string | null>(null);
  const visible = filter ? leads.filter((l) => (l.service ?? SERVICES[0]) === filter) : leads;

  useEffect(() => {
    document.title = "Ventas · Miiles";
    if (pin) unlock(pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    const refresh = async () => {
      const { data } = await call(pin, { action: "list" });
      if (data?.leads) setLeads(data.leads);
    };
    channel = supabase.channel("ventas-board");
    channel.on("broadcast", { event: "changed" }, refresh).subscribe((st) => { subscribed = st === "SUBSCRIBED"; });
    const onFocus = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onFocus);
    const iv = setInterval(refresh, 30000);
    return () => { document.removeEventListener("visibilitychange", onFocus); clearInterval(iv); if (channel) supabase.removeChannel(channel); channel = null; subscribed = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

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
    setLeads((l) => [data.lead, ...l]); ping();
    setName(""); setPhone(""); setShowAdd(false); setTab("new");
  };

  const move = async (id: string, status: string) => {
    setLeads((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
    const { error, data } = await call(pin, { action: "status", id, status });
    if (error || data?.error) toast.error("No se pudo actualizar"); else ping();
  };

  const changeService = async (id: string, service: string) => {
    setLeads((l) => l.map((x) => (x.id === id ? { ...x, service } : x)));
    const { error, data } = await call(pin, { action: "service", id, service });
    if (error || data?.error) toast.error("No se pudo actualizar"); else ping();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar lead?")) return;
    setLeads((l) => l.filter((x) => x.id !== id));
    await call(pin, { action: "delete", id }); ping();
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
      <header className="sticky top-0 z-10 bg-miiles-gray-50/90 backdrop-blur px-4 md:px-8 pt-5 md:pt-8 pb-3 md:pb-5 space-y-3 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-normal text-black">Ventas</h1>
            <p className="hidden md:block text-xs text-miiles-gray-400 font-light">{leads.length} leads · se actualiza en vivo</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="rounded-full bg-black text-white hover:bg-miiles-pink">
            <Plus className="h-4 w-4 mr-1" /> Lead
          </Button>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md rounded-[24px] bg-white">
            <DialogHeader><DialogTitle className="font-normal text-black">Nuevo lead</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); add(); }} className="space-y-3">
              <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} autoFocus className="h-11" />
              <Input placeholder="Teléfono" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" />
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((s) => (
                  <button type="button" key={s} onClick={() => setService(s)}
                    className={`rounded-full px-3 h-8 text-xs ${service === s ? "bg-black text-white" : "bg-miiles-gray-100 text-miiles-gray-600"}`}>{s}</button>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowAdd(false)} className="rounded-full flex-1 h-11">Cancelar</Button>
                <Button type="submit" disabled={!name.trim()} className="rounded-full flex-1 h-11 bg-black text-white hover:bg-miiles-pink">Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {[null, ...SERVICES].map((s) => {
            const n = s ? leads.filter((l) => (l.service ?? SERVICES[0]) === s).length : leads.length;
            return (
              <button key={s ?? "all"} onClick={() => setFilter(s)}
                className={`shrink-0 rounded-full px-3 h-8 text-xs border ${filter === s ? "bg-miiles-blue text-white border-miiles-blue" : "bg-white text-miiles-gray-600 border-miiles-gray-200"}`}>
                {s ?? "Todos"} · {n}
              </button>
            );
          })}
        </div>
        {/* Tabs mobile */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide md:hidden -mx-4 px-4">
          {COLUMNS.map((c) => {
            const n = visible.filter((l) => l.status === c.key).length;
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
        {visible.filter((l) => l.status === tab).map((l) => <LeadCard key={l.id} lead={l} />)}
        {visible.filter((l) => l.status === tab).length === 0 && (
          <p className="text-center text-xs text-miiles-gray-400 py-10 font-light">Sin leads aquí</p>
        )}
      </div>

      {/* Desktop: board */}
      <div className="hidden md:flex lg:grid lg:grid-cols-4 gap-4 px-8 pb-10 overflow-x-auto snap-x max-w-[1400px] mx-auto">
        {COLUMNS.map((c) => {
          const items = visible.filter((l) => l.status === c.key);
          return (
            <div key={c.key} className="w-[320px] shrink-0 lg:w-auto snap-start bg-miiles-gray-100 rounded-2xl p-3 flex flex-col h-[calc(100vh-200px)]">
              <div className="flex items-center gap-2 px-1 pb-3">
                <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                <span className="text-sm font-normal text-black">{c.label}</span>
                <span className="text-xs text-miiles-gray-400 ml-auto">{items.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 -mx-1 px-1 pb-1">
                {items.map((l) => <LeadCard key={l.id} lead={l} />)}
                {items.length === 0 && <p className="text-center text-xs text-miiles-gray-400 py-10 font-light">Sin leads</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
