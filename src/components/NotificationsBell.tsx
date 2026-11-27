import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import dashboardI18n from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const dt = (key: string): string => dashboardI18n.t(key) as string;

/** Evento que avisa a la campana que cambió el número de notificaciones sin leer. */
export const NOTIFS_CHANGED = "miiles:notificaciones";

/** Campana junto al botón de ajustes: muestra las no leídas y abre la lista (en el inicio). */
export function NotificationsBell() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .eq("read", false);
    setUnread(count ?? 0);
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh, location.pathname]);
  useEffect(() => {
    const on = () => void refresh();
    window.addEventListener(NOTIFS_CHANGED, on);
    window.addEventListener("focus", on);
    return () => { window.removeEventListener(NOTIFS_CHANGED, on); window.removeEventListener("focus", on); };
  }, [refresh]);

  return (
    <button
      type="button"
      title={dt("dashboard.text16")}
      aria-label={dt("dashboard.text16")}
      onClick={() => navigate("/dashboard?notificaciones=1")}
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
  );
}
