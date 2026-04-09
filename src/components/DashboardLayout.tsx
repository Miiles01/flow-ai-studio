import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ShoppingBag, Search, Workflow, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
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
  { title: "Inicio", url: "/", icon: Home },
  { title: "Programas", url: "/programs", icon: ShoppingBag },
];

const bottomNav = [
  { title: "Mi Perfil", url: "/profile", icon: User },
];

function SidebarBody() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" variant="floating" className="rounded-lg" style={{ background: 'linear-gradient(to bottom, #FDFDFD, #F8F9FD)' }}>
      <SidebarContent className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-4 py-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-foreground flex items-center justify-center flex-shrink-0">
            <span className="text-background font-normal text-sm">M</span>
          </div>
          {!collapsed && <span className="text-base font-normal tracking-tight">Miiles</span>}
        </div>

        {/* Main navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="text-miiles-gray-400 hover:text-foreground hover:bg-muted transition-all duration-200 rounded-sm"
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

        {/* Bottom nav */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="text-miiles-gray-400 hover:text-foreground hover:bg-muted transition-all duration-200 rounded-sm"
                      activeClassName="bg-muted text-foreground"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span className="font-light">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  className="text-miiles-gray-400 hover:text-foreground hover:bg-muted transition-all duration-200 rounded-sm cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {!collapsed && <span className="font-light">Cerrar sesión</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
