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
      className="m-4 md:m-6 border-none shadow-none rounded-[50px] overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #FDFDFD, #F8F9FD)" }}
    >
      <SidebarContent className="flex flex-col h-full py-4">
        {/* Logo */}
        <div className={`pt-6 pb-8 flex flex-col ${collapsed ? "items-center px-2" : "px-8"}`}>
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
        {!collapsed && (
          <div className="px-6 mb-8">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-full py-3.5 text-sm font-light hover:bg-black/90 transition-all hover:scale-[1.02]"
            >
              <Plus size={16} />
              Nuevo tablero
            </button>
          </div>
        )}

        {/* Main navigation */}
        <SidebarGroup className="px-6">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto p-0 hover:bg-transparent">
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={`flex items-center w-full gap-3 px-5 py-4 text-black transition-all duration-300 rounded-[25px] border border-[#F3F4F6] hover:bg-black/5 ${
                        location.pathname.startsWith(item.url) && item.url !== "/" || (item.url === "/" && location.pathname === "/")
                          ? "bg-transparent font-normal"
                          : "bg-transparent font-light"
                      }`}
                      activeClassName=""
                    >
                      <item.icon className="h-[22px] w-[22px]" strokeWidth={1.5} />
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
        {!collapsed && (
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
              <p className="text-[15px] font-normal truncate">{displayName || "Usuario"}</p>
              <p className="text-[13px] text-muted-foreground font-light">Plan Gratis</p>
            </div>
          </div>
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
