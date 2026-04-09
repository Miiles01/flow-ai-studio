import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ShoppingBag, User, LogOut } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Inicio", url: "/", icon: Home },
  { title: "Programas", url: "/programs", icon: ShoppingBag },
];

function SidebarBody() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setDisplayName(data?.display_name || user.email?.split("@")[0] || "");
      });
  }, [user]);

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
        <div className="px-5 pt-6 pb-2">
          <h2 className="text-xl font-normal tracking-tight">{collapsed ? "m" : "miiles"}</h2>
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

        <div className="flex-1" />

        {/* Sign out */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 rounded-sm cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {!collapsed && <span className="font-light">Cerrar sesión</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User profile card at bottom */}
        {!collapsed && (
          <>
            <div className="mx-5 border-t border-muted-foreground/10" />
            <div
              className="mx-3 mb-4 mt-3 px-4 py-3 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/profile")}
            >
              <div className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                <span className="text-background text-sm font-normal">{initials}</span>
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
          <header className="h-12 flex items-center px-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
