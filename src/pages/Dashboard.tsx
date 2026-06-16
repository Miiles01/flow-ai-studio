import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Bell, Heart, ArrowRight, Loader2, Send, X, Trash2, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import TutorialModal from "@/components/TutorialModal";
import tutorialBanner from "@/assets/tablero-banner.webp.asset.json";

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

type UserApplication = {
  id: string;
  program_id: string;
  status: string;
  created_at: string;
  program_name?: string;
  brand_name?: string;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [flows, setFlows] = useState<any[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [appsOpen, setAppsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [tutorialTrigger, setTutorialTrigger] = useState(0);

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
      supabase.from("flows").select("id, name, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(5),
      supabase.from("user_applications").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("notifications").select("*").eq("recipient_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
    ]).then(async ([profileRes, flowsRes, appsRes, notifRes, roleRes]) => {
      setDisplayName(profileRes.data?.display_name || user.email?.split("@")[0] || "");
      setFlows(flowsRes.data || []);
      setSavedCount(appsRes.count || 0);
      setNotifications((notifRes.data as Notification[]) || []);
      setIsAdmin(!!roleRes.data);

      // Load applications with program names
      const { data: appsData } = await supabase
        .from("user_applications")
        .select("id, program_id, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (appsData && appsData.length > 0) {
        const programIds = [...new Set(appsData.map((a) => a.program_id))];
        const { data: programs } = await supabase
          .from("brand_programs")
          .select("id, name, brand_name")
          .in("id", programIds);

        const merged = appsData.map((a) => {
          const p = programs?.find((pr) => pr.id === a.program_id);
          return { ...a, program_name: p?.name || "", brand_name: p?.brand_name || "" };
        });
        setApplications(merged);
      }

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

  async function generateTestBoard() {
    if (!user) return;
    setLoading(true);
    const testNodes = [
      { id: "title", type: "TextNode", position: { x: 0, y: -100 }, data: { text: "Business Model Canvas", fontSize: 48, fontWeight: "600" } },
      { id: "frame-problem", type: "FrameNode", position: { x: 0, y: 0 }, style: { width: 300, height: 400 }, data: { label: "1. Problema" } },
      { id: "text-problem", type: "TextNode", position: { x: 20, y: 60 }, parentId: "frame-problem", extent: "parent", data: { text: "• Tiempos largos de desarrollo\n• Costos altos de diseño\n• Falta de validación rápida", fontSize: 16 } },
      { id: "frame-value", type: "FrameNode", position: { x: 350, y: 0 }, style: { width: 300, height: 400 }, data: { label: "2. Propuesta de Valor" } },
      { id: "text-value", type: "TextNode", position: { x: 20, y: 60 }, parentId: "frame-value", extent: "parent", data: { text: "Plataforma SaaS que genera modelos de negocio y prototipos visuales usando IA en minutos.", fontSize: 16 } },
      { id: "frame-segments", type: "FrameNode", position: { x: 700, y: 0 }, style: { width: 300, height: 400 }, data: { label: "3. Segmentos de Clientes" } },
      { id: "text-segments", type: "TextNode", position: { x: 20, y: 60 }, parentId: "frame-segments", extent: "parent", data: { text: "• Emprendedores\n• Agencias de diseño\n• Consultoras de negocio", fontSize: 16 } },
      { id: "todo-next", type: "TodoNode", position: { x: 0, y: 450 }, data: { title: "Próximos Pasos", tasks: [{ id: "1", text: "Validar con 10 usuarios", completed: false }, { id: "2", text: "Definir pricing", completed: false }] } }
    ];
    const testEdges = [
      { id: "e1", source: "frame-problem", target: "frame-value", type: "smoothstep", animated: true },
      { id: "e2", source: "frame-value", target: "frame-segments", type: "smoothstep", animated: true }
    ];
    
    const { data, error } = await supabase.from("flows").insert({
      user_id: user.id,
      name: "Lean Canvas Generado por IA",
      nodes: testNodes,
      edges: testEdges
    }).select().single();
    
    setLoading(false);
    if (error) {
      toast.error("Error al generar el tablero de prueba.");
    } else {
      toast.success("¡Tablero generado! Revisa 'Mis tableros'.");
      setFlows(prev => [data, ...prev]);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-miiles-gray-400" />
      </div>
    );
  }

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const } },
  } as const;

  return (
    <>
    <motion.div
      className="p-8 md:px-12 md:pb-12 md:pt-48 max-w-5xl mx-auto space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Greeting */}
      <motion.div variants={sectionVariants}>
        <h1 className={`text-2xl md:text-3xl font-normal leading-tight ${isDark ? 'text-white' : 'text-black'}`}>
          {getGreeting()},<br />
          <span className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>{displayName}</span>
        </h1>
        <p className="text-miiles-gray-400 mt-2 text-sm font-light">
          ¿Qué vamos hacer hoy?
        </p>
      </motion.div>


      {/* Stats */}
      <motion.div variants={sectionVariants} className="grid grid-cols-2 gap-5">
        {/* Notifications card */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={`p-5 rounded-lg shadow-md cursor-pointer ${isDark ? 'bg-white/5' : 'bg-white'}`}
          onClick={() => setNotifOpen(true)}
        >
          <div className="w-8 h-8 rounded-sm bg-background shadow-sm flex items-center justify-center mb-3 relative">
            <Bell size={16} className={isDark ? "text-white" : "text-black"} />
            {unreadCount > 0 && (
              <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] flex items-center justify-center ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-2xl font-normal text-foreground">{unreadCount}</p>
          <p className="text-xs text-miiles-gray-400 font-light mt-1">Notificaciones</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={`p-5 rounded-lg shadow-md cursor-pointer ${isDark ? 'bg-white/5' : 'bg-white'}`}
          onClick={() => setAppsOpen(true)}
        >
          <div className="w-8 h-8 rounded-sm bg-background shadow-sm flex items-center justify-center mb-3">
            <Heart size={16} className={isDark ? "text-white" : "text-black"} />
          </div>
          <p className="text-2xl font-normal text-foreground">{savedCount}</p>
          <p className="text-xs text-miiles-gray-400 font-light mt-1">Proyectos</p>
        </motion.div>
      </motion.div>

      {/* Admin: send notification button */}
      {isAdmin && (
        <motion.div variants={sectionVariants}>
          <Button
            size="sm"
            className={`gap-1.5 ${isDark ? 'bg-white/10 text-white border border-white/10 hover:bg-white/15' : ''}`}
            onClick={() => {
              loadProfiles();
              setSendOpen(true);
            }}
          >
            <Send size={14} />
            Enviar notificación
          </Button>
        </motion.div>
      )}

      {user?.email === "contmanuel@gmail.com" && (
        <motion.div variants={sectionVariants}>
          <Button onClick={generateTestBoard} className="bg-miiles-blue text-white w-full md:w-auto">
            🪄 Generar Tablero de Prueba (IA)
          </Button>
        </motion.div>
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

      {/* Projects / Applications popup */}
      <Dialog open={appsOpen} onOpenChange={setAppsOpen}>
        <DialogContent className="sm:max-w-md max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-normal">Mis proyectos</DialogTitle>
          </DialogHeader>
          {applications.length === 0 ? (
            <p className="text-sm text-miiles-gray-400 font-light py-8 text-center">No tienes postulaciones aún</p>
          ) : (
            <div className="space-y-2">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Link
                    to={`/programs/${app.program_id}`}
                    className="flex-1 min-w-0"
                    onClick={() => setAppsOpen(false)}
                  >
                    <p className="text-sm font-normal truncate">{app.brand_name}</p>
                    <p className="text-[10px] text-miiles-gray-400 font-light mt-0.5">{app.program_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-light ${
                        app.status === "applied"
                          ? "bg-miiles-blue-light text-miiles-blue"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {app.status === "applied" ? "Postulado" : "Guardado"}
                      </span>
                      <span className="text-[10px] text-miiles-gray-400 font-light">
                        {new Date(app.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={() => setConfirmDeleteId(app.id)}
                    className="p-2 text-miiles-gray-400 hover:text-destructive-foreground transition-colors flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(v) => !v && setConfirmDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-normal text-center">Cancelar postulación</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground font-light text-center py-2">
            ¿Estás seguro que quieres cancelar esta postulación?
          </p>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmDeleteId(null)}
            >
              No, volver
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={async () => {
                if (!confirmDeleteId) return;
                const { error } = await supabase
                  .from("user_applications")
                  .delete()
                  .eq("id", confirmDeleteId);
                if (!error) {
                  setApplications((prev) => prev.filter((a) => a.id !== confirmDeleteId));
                  setSavedCount((c) => Math.max(0, c - 1));
                  toast.success("Postulación cancelada");
                } else {
                  toast.error("Error al cancelar");
                }
                setConfirmDeleteId(null);
              }}
            >
              Sí, cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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


      {/* Tutorial banner */}
      <motion.button
        type="button"
        variants={sectionVariants}
        onClick={() => setTutorialTrigger((n) => n + 1)}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="group relative block w-full overflow-hidden rounded-[20px] md:rounded-[24px] text-left shadow-md ring-1 ring-black/5"
        style={{ height: "clamp(260px, 38vw, 380px)" }}
      >
        <img
          src={tutorialBanner.url}
          alt="Descubre cómo funciona Miiles"
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        {/* Texto flotante — alineado a la izquierda en mobile, a la derecha en desktop */}
        <div className="absolute top-[8%] left-[6%] right-auto md:left-auto md:right-[4%] flex flex-col gap-2 md:gap-3 items-start max-w-[70%] md:max-w-[38%]">
          <span className="inline-flex items-center bg-white text-black text-[10px] md:text-[11px] font-normal px-3 md:px-4 py-1 md:py-1.5 rounded-full">
            Novedades
          </span>
          <div>
            <p className="text-white font-normal leading-[1.15]" style={{ fontSize: "clamp(18px, 3.2vw, 44px)" }}>
              Primeros
            </p>
            <p
              className="text-white"
              style={{
                fontFamily: "'WelthCatritz', serif",
                fontSize: "clamp(18px, 3.2vw, 44px)",
                fontStyle: "italic",
                fontWeight: 400,
                lineHeight: 1.05,
              }}
            >
              pasos
            </p>
          </div>
        </div>
      </motion.button>

      {/* Boards Carousel */}

      <motion.div variants={sectionVariants}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-normal text-foreground">Mis tableros</h2>
          <Link to="/boards" className="text-xs text-foreground/60 hover:text-foreground flex items-center gap-1 font-light">
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>
        
        {flows.length === 0 ? (
          <div className={`text-center py-16 rounded-xl border border-dashed border-muted ${isDark ? 'bg-white/5' : 'bg-background'}`}>
            <LayoutDashboard size={40} className="mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm font-normal mb-1 text-foreground">Sin tableros recientes</p>
            <p className="text-xs font-light text-muted-foreground">Crea uno nuevo para organizar tus ideas.</p>
            <Link to="/boards" className={`mt-4 inline-block px-4 py-2 text-xs rounded-full ${isDark ? 'bg-black text-white border border-white/10 hover:bg-zinc-900' : 'bg-foreground text-background'}`}>
              Crear tablero
            </Link>
          </div>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-8 px-6 md:-mx-4 md:px-4 py-8 -my-6">
            {flows.map((flow, i) => (
              <motion.div
                key={flow.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`snap-start shrink-0 w-[280px] md:w-[320px] aspect-[4/3] rounded-[24px] overflow-hidden cursor-pointer group transition-colors m-2 ${isDark ? 'bg-black hover:bg-zinc-900 ring-1 ring-white/10' : 'bg-white hover:bg-miiles-gray-50 shadow-[0_20px_40px_rgba(0,0,0,0.04)]'}`}
              >
                <Link to={`/boards/${flow.id}`} className="w-full h-full flex flex-col justify-end p-6">
                  <div className={`flex items-center gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
                    <LayoutDashboard className="w-[22px] h-[22px]" strokeWidth={1.5} />
                    <span className="font-normal text-[16px] truncate">{flow.name}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
            
            {/* "Ver todos" card at the end of the carousel */}
            {flows.length >= 5 && (
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="snap-start shrink-0 w-[120px] rounded-xl border border-dashed border-muted bg-background flex items-center justify-center cursor-pointer m-2"
              >
                <Link to="/boards" className="flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground w-full h-full min-h-[210px] md:min-h-[240px]">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <ArrowRight size={16} />
                  </div>
                  <span className="text-xs font-light">Ver todos</span>
                </Link>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>

      {/* Tutorial modal */}
      <TutorialModal userId={user?.id} triggerOpen={tutorialTrigger} />
    </>
  );
}
