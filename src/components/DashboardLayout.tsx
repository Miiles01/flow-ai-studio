import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ShoppingBag, Search, Workflow, User, LogOut, Settings } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

const mainNav = [
  { title: "Inicio", url: "/", icon: Home },
  { title: "Programas", url: "/programs", icon: ShoppingBag },
  { title: "Búsqueda IA", url: "/search", icon: Search },
  { title: "Flujos", url: "/flows", icon: Workflow },
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
    <Sidebar collapsible="icon" className="border-r border-miiles-gray-100">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-4 py-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-accent flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">M</span>
          </div>
          {!collapsed && <span className="text-lg font-semibold tracking-tight">Miiles</span>}
        </div>

        {/* Main navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-[11px] uppercase tracking-wider">
            {!collapsed && "Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-muted/50 text-muted-foreground"
                      activeClassName="bg-muted text-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
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
          <Separator className="mb-2 bg-miiles-gray-100" />
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-muted/50 text-muted-foreground"
                      activeClassName="bg-muted text-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  className="hover:bg-muted/50 text-muted-foreground cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {!collapsed && <span>Cerrar sesión</span>}
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
          <header className="h-12 flex items-center border-b border-miiles-gray-100 px-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
