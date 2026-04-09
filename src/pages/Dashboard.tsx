import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, TrendingUp, Bookmark, ArrowRight, Loader2, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Program = {
  id: string;
  name: string;
  brand_name: string;
  description: string;
  category: string;
  commission_rate: string | null;
  is_featured: boolean;
  banner_url: string | null;
  banner_position: number;
};

type Notification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

type ProfileOption = {
  user_id: string;
  display_name: string | null;
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

export default function Dashboard() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [featured, setFeatured] = useState<Program[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin send notification state
  const [sendOpen, setSendOpen] = useState(false);
  const [sendTitle, setSendTitle] = useState("");
  const [sendBody, setSendBody] = useState("");
  const [sendTo, setSendTo] = useState<"all" | "specific">("all");
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
      supabase.from("brand_programs").select("*").eq("is_featured", true).limit(4),
      supabase.from("user_applications").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("notifications").select("*").eq("recipient_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
    ]).then(([profileRes, programsRes, appsRes, notifRes, roleRes]) => {
      setDisplayName(profileRes.data?.display_name || user.email?.split("@")[0] || "");
      setFeatured((programsRes.data as Program[]) || []);
      setSavedCount(appsRes.count || 0);
      setNotifications((notifRes.data as Notification[]) || []);
      setIsAdmin(!!roleRes.data);
      setLoading(false);
    });
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAsRead(notif: Notification) {
    setSelectedNotif(notif);
    if (!notif.read) {
      await supabase.from("notifications").update({ read: true }).eq("id", notif.id);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    }
  }

  async function loadProfiles() {
    const { data } = await supabase.from("profiles").select("user_id, display_name");
    setProfiles((data as ProfileOption[]) || []);
  }

  async function handleSendNotification(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSending(true);

    const recipients = sendTo === "all" ? profiles.map((p) => p.user_id) : Array.from(selectedUsers);

    if (recipients.length === 0) {
      toast.error("Selecciona al menos un destinatario");
      setSending(false);
      return;
    }

    const rows = recipients.map((rid) => ({
      title: sendTitle,
      body: sendBody,
      recipient_id: rid,
      sender_id: user.id,
    }));

    const { error } = await supabase.from("notifications").insert(rows);
    if (error) {
      toast.error("Error al enviar notificación");
    } else {
      toast.success(`Notificación enviada a ${recipients.length} usuario(s)`);
      setSendOpen(false);
      setSendTitle("");
      setSendBody("");
      setSelectedUsers(new Set());
    }
    setSending(false);
  }

  function toggleUser(uid: string) {
    setSelectedUsers((prev) => {
      const s = new Set(prev);
      s.has(uid) ? s.delete(uid) : s.add(uid);
      return s;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-miiles-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-12">
      {/* Greeting */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-2xl md:text-3xl font-normal">
          {getGreeting()}, <span className="text-accent">{displayName}</span>
        </h1>
        <p className="text-miiles-gray-400 mt-2 text-sm font-light">
          Encuentra y gestiona tus colaboraciones con marcas
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {/* Notifications card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-5 rounded-lg shadow-md cursor-pointer hover:-translate-y-1 transition-transform duration-200"
          onClick={() => setNotifOpen(true)}
        >
          <div className="w-8 h-8 rounded-sm bg-background shadow-sm flex items-center justify-center mb-3 relative">
            <Bell size={16} className="text-miiles-blue" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-miiles-pink text-[9px] text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-2xl font-normal">{unreadCount}</p>
          <p className="text-xs text-miiles-gray-400 font-light mt-1">Notificaciones</p>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="p-5 rounded-lg shadow-md"
        >
          <div className="w-8 h-8 rounded-sm bg-background shadow-sm flex items-center justify-center mb-3">
            <Bookmark size={16} className="text-miiles-blue" />
          </div>
          <p className="text-2xl font-normal">{savedCount}</p>
          <p className="text-xs text-miiles-gray-400 font-light mt-1">Guardados</p>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-lg shadow-md"
        >
          <div className="w-8 h-8 rounded-sm bg-background shadow-sm flex items-center justify-center mb-3">
            <TrendingUp size={16} className="text-miiles-blue" />
          </div>
          <p className="text-2xl font-normal">Deportes</p>
          <p className="text-xs text-miiles-gray-400 font-light mt-1">Tendencia</p>
        </motion.div>
      </div>

      {/* Admin: send notification button */}
      {isAdmin && (
        <div>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              loadProfiles();
              setSendOpen(true);
            }}
          >
            <Send size={14} />
            Enviar notificación
          </Button>
        </div>
      )}

      {/* Notifications popup */}
      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
        <DialogContent className="sm:max-w-md max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-normal">Notificaciones</DialogTitle>
          </DialogHeader>
          {selectedNotif ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedNotif(null)}
                className="text-xs text-miiles-gray-400 hover:text-foreground font-light flex items-center gap-1"
              >
                ← Volver
              </button>
              <h3 className="font-normal text-sm">{selectedNotif.title}</h3>
              <p className="text-sm text-miiles-gray-600 font-light leading-relaxed whitespace-pre-wrap">
                {selectedNotif.body}
              </p>
              <p className="text-[10px] text-miiles-gray-400 font-light">
                {new Date(selectedNotif.created_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-miiles-gray-400 font-light py-8 text-center">Sin notificaciones</p>
          ) : (
            <div className="space-y-1">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markAsRead(n)}
                  className={`w-full text-left p-3 rounded-md transition-colors duration-200 hover:bg-miiles-gray-50 ${
                    !n.read ? "bg-miiles-blue-light/30" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!n.read ? "font-normal" : "font-light"}`}>{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-miiles-blue flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-[10px] text-miiles-gray-400 font-light mt-1">
                    {new Date(n.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin: send notification dialog */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-normal">Enviar notificación</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendNotification} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="font-light">Título</Label>
              <Input value={sendTitle} onChange={(e) => setSendTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label className="font-light">Mensaje</Label>
              <textarea
                value={sendBody}
                onChange={(e) => setSendBody(e.target.value)}
                className="w-full rounded-md bg-background shadow-sm px-3 py-2 text-sm font-light min-h-[80px] resize-none focus:outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="font-light">Destinatarios</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSendTo("all")}
                  className={`px-4 py-2 rounded-full text-xs font-light transition-all duration-200 ${
                    sendTo === "all" ? "bg-foreground text-background" : "bg-background shadow-sm text-miiles-gray-400"
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setSendTo("specific")}
                  className={`px-4 py-2 rounded-full text-xs font-light transition-all duration-200 ${
                    sendTo === "specific" ? "bg-foreground text-background" : "bg-background shadow-sm text-miiles-gray-400"
                  }`}
                >
                  Específicos
                </button>
              </div>
            </div>
            {sendTo === "specific" && (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {profiles.map((p) => (
                  <button
                    key={p.user_id}
                    type="button"
                    onClick={() => toggleUser(p.user_id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-xs font-light transition-colors ${
                      selectedUsers.has(p.user_id)
                        ? "bg-miiles-blue-light text-miiles-blue"
                        : "hover:bg-miiles-gray-50"
                    }`}
                  >
                    {p.display_name || p.user_id.slice(0, 8)}
                  </button>
                ))}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              Enviar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Featured programs */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-normal">Programas destacados</h2>
          <Link to="/programs" className="text-xs text-accent hover:underline flex items-center gap-1 font-light">
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featured.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg shadow-md hover:shadow-sm transition-shadow duration-200 overflow-hidden"
            >
              {p.banner_url && (
                <img
                  src={p.banner_url}
                  alt={p.brand_name}
                  className="w-full h-36 object-cover"
                  style={{ objectPosition: `center ${p.banner_position}%` }}
                  loading="lazy"
                />
              )}
              <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-normal">{p.brand_name}</p>
                  <p className="text-xs text-miiles-gray-400 font-light mt-0.5">{p.name}</p>
                </div>
                {p.commission_rate && (
                  <span className="text-xs bg-miiles-blue-light text-miiles-blue px-3 py-1 rounded-full font-light">
                    {p.commission_rate}
                  </span>
                )}
              </div>
              <p className="text-sm text-miiles-gray-400 font-light mt-4 line-clamp-2">{p.description}</p>
              <Link
                to={`/programs/${p.id}`}
                className="text-xs text-accent mt-4 inline-flex items-center gap-1 hover:underline font-light"
              >
                Ver detalles <ArrowRight size={12} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
