import { ReactNode, useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, ShoppingBag, User, Bot, Plus, MessageSquare, Trash2, LayoutDashboard, Gift } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { AffiliatePopup } from "@/components/AffiliatePopup";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { supabase } from "@/integrations/supabase/client";
import { NavLink } from "@/components/NavLink";
import { toast } from "sonner";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { QuickSettings } from "@/components/QuickSettings";
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
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const closeMobile = () => setOpenMobile(false);
  const { user, signOut } = useAuth();
  const { plan } = usePlan();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const location = useLocation();

  const planNames: Record<string, string> = {
    free: "Plan Gratis",
    pro: "Plan Pro",
    business: "Plan Negocios",
    negocios: "Plan Negocios"
  };
  const displayPlan = planNames[plan?.toLowerCase() || "free"] || `Plan ${plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "Gratis"}`;

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

  const sidebarBg = isDark
    ? "linear-gradient(to bottom, hsl(222 20% 11%), hsl(222 20% 9%))"
    : "linear-gradient(to bottom, #FDFDFD, #F8F9FD)";

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className={`!py-[40px] border-none shadow-none !bg-transparent [&>div[data-sidebar=sidebar]]:bg-transparent [&>div[data-sidebar=sidebar]]:border-none [&>div[data-sidebar=sidebar]]:shadow-none ${collapsed ? "px-3" : "pl-6 pr-2"}`}
    >
      <div
        className="flex flex-col h-full rounded-[50px] overflow-hidden w-full transition-colors duration-300"
        style={{ background: sidebarBg }}
      >
        <SidebarContent className="flex flex-col h-full py-4 bg-transparent relative">
        {/* Toggle & Logo */}
        <div className={`pt-2 pb-8 flex flex-col ${collapsed ? "items-center px-2" : "px-8"}`}>
          <div className={`hidden md:flex w-full ${collapsed ? "justify-center" : "justify-start"} mb-4`}>
            <SidebarTrigger className={isDark ? "text-white hover:bg-white/10" : ""} />
          </div>
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="miiles" className={collapsed ? "h-6 w-6" : "h-8 w-8"} />
            {!collapsed && (
              <span className={`text-3xl font-normal tracking-tight transition-colors duration-300 ${isDark ? "text-white" : "text-black"}`}>
                miiles
              </span>
            )}
          </div>
        </div>

        {/* Nuevo Tablero Button */}
        <div className={`mb-8 flex ${collapsed ? "justify-center px-2" : "px-6"}`}>
          <button
            onClick={() => { closeMobile(); navigate("/boards/new"); }}
            className={`flex items-center justify-center transition-all hover:scale-[1.02] ${
              isDark
                ? "bg-black text-white border border-white/10 hover:bg-zinc-900"
                : "bg-black text-white hover:bg-black/90"
            } ${
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
              {mainNav.map((item) => {
                const isActive =
                  location.pathname.startsWith(item.url) && item.url !== "/" ||
                  (item.url === "/" && location.pathname === "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-auto p-0 hover:bg-transparent">
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        onClick={closeMobile}
                        className={`flex items-center ${
                          collapsed ? "justify-center w-11 h-11 mx-auto rounded-full" : "w-full gap-3 px-5 py-4 rounded-[25px]"
                        } transition-all duration-300 border ${
                          isDark
                            ? `border-white/10 text-white ${isActive ? "bg-white/10 font-normal" : "bg-transparent font-light hover:bg-white/5"}`
                            : `border-[#F3F4F6] text-black ${isActive ? "bg-white font-normal shadow-sm" : "bg-transparent font-light hover:bg-white"}`
                        }`}
                        activeClassName=""
                        title={collapsed ? item.title : undefined}
                      >
                        <item.icon className="h-[22px] w-[22px] flex-shrink-0" strokeWidth={1.5} />
                        {!collapsed && <span className="text-[15px]">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="flex-1" />

        {/* Affiliate program card */}
        <AffiliatePopup>
          {collapsed ? (
            <button
              type="button"
              title="Afiliados"
              className={`mb-2 mx-auto w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-[1.04] ${
                isDark ? "bg-white/10 text-white hover:bg-white/15" : "bg-zinc-100 text-black hover:bg-zinc-200"
              }`}
            >
              <Gift size={18} strokeWidth={1.7} />
            </button>
          ) : (
            <button
              type="button"
              className={`mx-6 mb-3 px-3 py-3 rounded-[20px] flex items-center gap-3 text-left transition-all hover:scale-[1.01] ${
                isDark ? "bg-white/5 hover:bg-white/10 border border-white/10" : "bg-white hover:bg-miiles-gray-50 border border-[#F3F4F6] shadow-sm"
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/10" : "bg-zinc-100"}`}>
                <Gift size={17} className={isDark ? "text-white" : "text-black"} strokeWidth={1.7} />
              </div>
              <div className="min-w-0">
                <p className={`text-[13px] font-normal leading-tight ${isDark ? "text-white" : "text-black"}`}>
                  Afiliados
                </p>
                <p className="text-[11px] text-muted-foreground font-light leading-tight mt-0.5">
                  Comparte tu link y recibe comisiones
                </p>
              </div>
            </button>
          )}
        </AffiliatePopup>

        {/* User profile card at bottom */}

        {collapsed ? (
          <div
            className="mb-6 mt-3 flex justify-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => { closeMobile(); navigate("/profile"); }}
            title="Perfil"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm ${isDark ? "bg-white/20" : "bg-black"}`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName || "Usuario"} className="w-full h-full object-cover" />
              ) : (
                <span className={`text-sm font-normal ${isDark ? "text-white" : "text-white"}`}>{initials}</span>
              )}
            </div>
          </div>
        ) : (
          <div
            className="mx-6 mb-4 mt-3 px-2 py-2 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => { closeMobile(); navigate("/profile"); }}
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm ${isDark ? "bg-white/20" : "bg-black"}`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName || "Usuario"} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-normal">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className={`text-[15px] font-normal truncate ${isDark ? "text-white" : "text-black"}`}>
                {displayName ? displayName.split(" ")[0] : "Usuario"}
              </p>
              <p className="text-[13px] text-muted-foreground font-light">{displayPlan}</p>
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
    <DashboardContent>{children}</DashboardContent>
  );
}

function DashboardContent({ children }: { children: ReactNode }) {
  const { isDark } = useTheme();

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full transition-colors duration-300 ${isDark ? "dark bg-[hsl(222,20%,8%)]" : "bg-background"}`}>
        <SidebarBody />
        <div className="flex-1 flex flex-col min-w-0 relative">
          <header className="h-12 flex md:hidden items-center px-4 sticky top-0 z-10 bg-background">
            <SidebarTrigger className={isDark ? "text-white hover:bg-white/10" : ""} />
          </header>
          {/* Ajustes rápidos — fixed top-right of the page area */}
          <div className="fixed top-5 right-6 z-50">
            <QuickSettings />
          </div>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

