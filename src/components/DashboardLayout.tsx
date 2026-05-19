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

  const initials = displayName
    ? displayName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "M";

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className={`!py-[40px] border-none shadow-none !bg-transparent [&>div[data-sidebar=sidebar]]:bg-transparent [&>div[data-sidebar=sidebar]]:border-none [&>div[data-sidebar=sidebar]]:shadow-none ${collapsed ? "px-3" : "pl-6 pr-2"}`}
    >
      <div 
        className="flex flex-col h-full rounded-[50px] overflow-hidden w-full"
        style={{ background: "linear-gradient(to bottom, #FDFDFD, #F8F9FD)" }}
      >
        <SidebarContent className="flex flex-col h-full py-4 bg-transparent relative">
        {/* Toggle & Logo */}
        <div className={`pt-2 pb-8 flex flex-col ${collapsed ? "items-center px-2" : "px-8"}`}>
          <div className={`hidden md:flex w-full ${collapsed ? "justify-center" : "justify-start"} mb-4`}>
            <SidebarTrigger />
          </div>
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="miiles" className={collapsed ? "h-6 w-6" : "h-8 w-8"} />
            {!collapsed && <span className="text-3xl font-normal tracking-tight">miiles</span>}
          </div>
          {!collapsed && (
            <p className="text-[13px] text-black font-normal mt-2 ml-1 cursor-pointer hover:underline">
              Nueva conversación
            </p>
          )}
        </div>

        {/* Nuevo Tablero Button */}
        <div className={`mb-8 flex ${collapsed ? "justify-center px-2" : "px-6"}`}>
          <button
            onClick={() => navigate("/")}
            className={`flex items-center justify-center bg-black text-white hover:bg-black/90 transition-all hover:scale-[1.02] ${
              collapsed
                ? "w-10 h-10 rounded-full"
                : "w-full gap-2 rounded-full py-3.5 text-sm font-light"
            }`}
            title={collapsed ? "Nuevo tablero" : undefined}
          >
            <Plus size={16} />
            {!collapsed && "Nuevo tablero"}
          </button>
        </div>

        {/* Main navigation */}
        <SidebarGroup className={collapsed ? "px-2" : "px-6"}>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto p-0 hover:bg-transparent">
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={`flex items-center ${collapsed ? "justify-center w-11 h-11 mx-auto rounded-full" : "w-full gap-3 px-5 py-4 rounded-[25px]"} text-black transition-all duration-300 border border-[#F3F4F6] hover:bg-white ${
                        location.pathname.startsWith(item.url) && item.url !== "/" || (item.url === "/" && location.pathname === "/")
                          ? "bg-white font-normal shadow-sm"
                          : "bg-transparent font-light"
                      }`}
                      activeClassName=""
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-[22px] w-[22px] flex-shrink-0" strokeWidth={1.5} />
                      {!collapsed && <span className="text-[15px]">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="flex-1" />

        {/* User profile card at bottom */}
        {collapsed ? (
          <div 
            className="mb-6 mt-3 flex justify-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/profile")}
            title="Perfil"
          >
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName || "Usuario"} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-normal">{initials}</span>
              )}
            </div>
          </div>
        ) : (
          <div
            className="mx-6 mb-4 mt-3 px-2 py-2 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/profile")}
          >
            <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName || "Usuario"} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-normal">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-normal truncate">{displayName ? displayName.split(" ")[0] : "Usuario"}</p>
              <p className="text-[13px] text-muted-foreground font-light">Plan Gratis</p>
            </div>
          </div>
        )}
        </SidebarContent>
      </div>
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SidebarBody />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex md:hidden items-center px-4 sticky top-0 z-10 bg-background">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
