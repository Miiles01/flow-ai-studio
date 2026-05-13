import { ReactNode, useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, ShoppingBag, User, Bot, Plus, MessageSquare, Trash2, LayoutDashboard } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NavLink } from "@/components/NavLink";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Inicio", url: "/dashboard", icon: Home },
  { title: "Tableros", url: "/boards", icon: LayoutDashboard },
  { title: "Programas", url: "/programs", icon: ShoppingBag },
  // { title: "Búsqueda IA", url: "/search", icon: Bot },
];

type Conversation = { id: string; title: string; updated_at: string };

function SidebarBody() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setDisplayName(data?.display_name || user.email?.split("@")[0] || "");
        setAvatarUrl(data?.avatar_url || "");
      });
  }, [user]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ai_conversations")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(30);
    setConversations(data ?? []);
  }, [user]);

  useEffect(() => {
    loadConversations();
    const handler = () => loadConversations();
    window.addEventListener("ai-conversations-changed", handler);
    return () => window.removeEventListener("ai-conversations-changed", handler);
  }, [loadConversations]);

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    const { error } = await supabase.from("ai_conversations").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar");
      return;
    }
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (location.pathname === `/search/${id}`) navigate("/search");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const initials = displayName
    ? displayName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "M";

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="rounded-2xl border-none"
      style={{ background: "linear-gradient(to bottom, #FDFDFD, #F8F9FD)" }}
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Logo */}
        <div className={`pt-6 pb-2 flex items-center ${collapsed ? "justify-center px-2" : "px-5 gap-2"}`}>
          <img src={logoImg} alt="miiles" className={collapsed ? "h-6 w-6" : "h-7 w-7"} />
          {!collapsed && <span className="text-xl font-normal tracking-tight">miiles</span>}
        </div>

        {/* Main navigation */}
        <SidebarGroup className="mt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 rounded-sm"
                      activeClassName="bg-muted text-foreground"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span className="font-light">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Chat history (Hidden temporarily) */}
        {/*
        {!collapsed && (
          <SidebarGroup className="mt-2 min-h-0 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 pr-2">
              <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                Historial IA
              </SidebarGroupLabel>
              <button
                onClick={() => navigate("/search")}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Nuevo chat"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <SidebarGroupContent className="overflow-y-auto">
              <SidebarMenu>
                {conversations.length === 0 && (
                  <p className="px-3 py-2 text-xs font-light text-muted-foreground/60">Sin conversaciones</p>
                )}
                {conversations.map((c) => {
                  const active = location.pathname === `/search/${c.id}`;
                  return (
                    <SidebarMenuItem key={c.id}>
                      <SidebarMenuButton asChild>
                        <button
                          onClick={() => navigate(`/search/${c.id}`)}
                          className={`w-full group flex items-center gap-2 text-left rounded-sm transition-all duration-200 ${
                            active
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="font-light text-xs truncate flex-1">{c.title}</span>
                          <Trash2
                            onClick={(e) => handleDeleteConversation(e, c.id)}
                            className="h-3 w-3 opacity-0 group-hover:opacity-60 hover:!opacity-100 flex-shrink-0"
                          />
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        */}

        <div className="flex-1" />


        {/* User profile card at bottom */}
        {!collapsed && (
          <>
            <div className="mx-5 border-t border-muted-foreground/10" />
            <div
              className="mx-3 mb-4 mt-3 px-4 py-3 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/profile")}
            >
              <div className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName || "Usuario"} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-background text-sm font-normal">{initials}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-normal truncate">{displayName || "Usuario"}</p>
                <p className="text-xs text-muted-foreground font-light">Plan Gratis</p>
              </div>
            </div>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SidebarBody />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center px-4 sticky top-0 z-10 bg-background">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
