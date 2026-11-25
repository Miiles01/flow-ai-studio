import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLogin from "./AdminLogin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import TemplatesTab from "@/components/admin/TemplatesTab";
import BusinessInquiriesTab from "@/components/admin/BusinessInquiriesTab";
import InstructionsTab from "@/components/admin/InstructionsTab";
import CouponsTab from "@/components/admin/CouponsTab";
import StudioTab from "@/components/admin/StudioTab";
import SuggestionsTab from "@/components/admin/SuggestionsTab";
import { LogOut, FileCode, Loader2, Briefcase, Brain, Ticket, Lightbulb, Palette, Users, Sun, Moon } from "lucide-react";
import CustomersTab from "@/components/admin/CustomersTab";

export default function Admin() {
  const { valid, checking, logout } = useAdminAuth();
  const [light, setLight] = useState(() => localStorage.getItem("miiles-admin-theme") === "light");
  useEffect(() => { localStorage.setItem("miiles-admin-theme", light ? "light" : "dark"); }, [light]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
      </div>
    );
  }

  if (!valid) return <AdminLogin onSuccess={() => window.location.reload()} />;

  return (
    <div className={`min-h-screen bg-[#0f0f11] text-white ${light ? "admin-light" : "dark"}`}>
      <header className="border-b border-white/10 px-6 md:px-10 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-normal text-white">Miiles Admin</h1>
          <p className="text-xs text-white/50 font-light">Cerebro de datos e instrucciones</p>
        </div>
        <div className="flex items-center gap-1">
        <Button onClick={() => setLight((v) => !v)} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10" aria-label="Cambiar tema">
          {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} {light ? "Modo oscuro" : "Modo claro"}
        </Button>
        <Button onClick={logout} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
          <LogOut className="h-4 w-4" /> Salir
        </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <Tabs defaultValue="customers">
          <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto">
            <TabsTrigger value="customers" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <Users className="h-4 w-4" /> Clientes
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <FileCode className="h-4 w-4" /> Plantillas
            </TabsTrigger>
            <TabsTrigger value="studio" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <Palette className="h-4 w-4" /> Estudio
            </TabsTrigger>
            <TabsTrigger value="business" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <Briefcase className="h-4 w-4" /> Negocios
            </TabsTrigger>
            <TabsTrigger value="instructions" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <Brain className="h-4 w-4" /> Instrucciones IA
            </TabsTrigger>
            <TabsTrigger value="coupons" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <Ticket className="h-4 w-4" /> Cupones
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <Lightbulb className="h-4 w-4" /> Sugerencias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="mt-6">
            <CustomersTab />
          </TabsContent>
          <TabsContent value="templates" className="mt-6">
            <TemplatesTab />
          </TabsContent>
          <TabsContent value="studio" className="mt-6">
            <StudioTab />
          </TabsContent>
          <TabsContent value="business" className="mt-6">
            <BusinessInquiriesTab />
          </TabsContent>
          <TabsContent value="instructions" className="mt-6">
            <InstructionsTab />
          </TabsContent>
          <TabsContent value="coupons" className="mt-6">
            <CouponsTab />
          </TabsContent>
          <TabsContent value="suggestions" className="mt-6">
            <SuggestionsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
