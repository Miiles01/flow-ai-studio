import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, ChevronLeft } from "lucide-react";
import dashboardI18n from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const dt = (key: string): string => dashboardI18n.t(key) as string;

/** Evento que avisa que cambió el número de notificaciones sin leer (campana e inicio se actualizan). */
export const NOTIFS_CHANGED = "miiles:notificaciones";

type Notificacion = { id: string; title: string; body: string; read: boolean; created_at: string };

/** Campana junto al botón de ajustes: un pop-up con las notificaciones, sin cambiar de página. */
export function NotificationsBell() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [lista, setLista] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [abierta, setAbierta] = useState<Notificacion | null>(null);

  const cargar = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("id, title, body, read, created_at")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);
    setLista((data as Notificacion[]) ?? []);
  }, [user]);

  useEffect(() => { void cargar(); }, [cargar, location.pathname]);
  useEffect(() => {
    const on = () => void cargar();
    window.addEventListener(NOTIFS_CHANGED, on);
    window.addEventListener("focus", on);
    return () => { window.removeEventListener(NOTIFS_CHANGED, on); window.removeEventListener("focus", on); };
  }, [cargar]);
  useEffect(() => {
    if (!open) { setAbierta(null); return; }
    setCargando(true);
    void cargar().finally(() => setCargando(false));
  }, [open, cargar]);

  const unread = lista.filter((n) => !n.read).length;

  const leer = async (n: Notificacion) => {
    setAbierta(n);
    if (n.read) return;
    setLista((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    await supabase.from("notifications").update({ read: true }).eq("id", n.id);
    window.dispatchEvent(new Event(NOTIFS_CHANGED));
  };

  const fecha = (iso: string, larga = false) =>
    new Date(iso).toLocaleDateString(dashboardI18n.language, larga
      ? { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
      : { day: "numeric", month: "short" });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={dt("dashboard.text16")}
          aria-label={dt("dashboard.text16")}
          className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 outline-none ${
            isDark ? "border-white/20 bg-white/10 hover:bg-white/20 text-white" : "border-black/10 bg-white hover:bg-gray-50 text-black shadow-sm"
          }`}
        >
          <Bell size={16} strokeWidth={1.5} />
          {unread > 0 && (
            <span className={`absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>

      {/* Mismo estilo que el pop-up de ajustes */}
      <PopoverContent
        align="end"
        sideOffset={8}
        className={`w-80 rounded-[24px] p-4 border border-white/10 text-white shadow-[0_24px_70px_rgba(0,0,0,0.15)] ${isDark ? "bg-[#1C1C1E]" : "bg-black/70 backdrop-blur-2xl"}`}
      >
        {abierta ? (
          <div className="space-y-3">
            <button type="button" onClick={() => setAbierta(null)} className="flex items-center gap-1 text-[11px] text-white/60 hover:text-white">
              <ChevronLeft size={14} /> {dt("dashboard.text16")}
            </button>
            <h4 className="text-[14px] font-medium leading-snug">{abierta.title}</h4>
            <p className="max-h-[45vh] overflow-y-auto whitespace-pre-wrap text-[13px] font-light leading-relaxed text-white/80">{abierta.body}</p>
            <p className="text-[10px] font-light text-white/50">{fecha(abierta.created_at, true)}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold tracking-wider opacity-50">{dt("dashboard.text16")}</h4>
            {lista.length === 0 ? (
              <p className="py-6 text-center text-[13px] font-light text-white/60">{cargando ? "…" : dt("dashboard.text23")}</p>
            ) : (
              <div className="-mx-1 max-h-[55vh] space-y-0.5 overflow-y-auto pr-1">
                {lista.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => void leer(n)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/10 ${n.read ? "" : "bg-white/5"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[13px] leading-snug ${n.read ? "font-light text-white/70" : "font-normal"}`}>{n.title}</p>
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-miiles-blue" />}
                    </div>
                    <p className="mt-1 text-[10px] font-light text-white/50">{fecha(n.created_at)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
