import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLogin from "./AdminLogin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ProspectsTab from "@/components/admin/ProspectsTab";
import TemplatesTab from "@/components/admin/TemplatesTab";
import { LogOut, Database, FileCode, Loader2 } from "lucide-react";

export default function Admin() {
  const { valid, checking, logout } = useAdminAuth();

  if (checking) {
    return (
      <div className="min-h-screen bg-[hsl(222,20%,8%)] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
      </div>
    );
  }

  if (!valid) return <AdminLogin onSuccess={() => window.location.reload()} />;

  return (
    <div className="min-h-screen bg-[hsl(222,20%,8%)] text-white">
      <header className="border-b border-white/10 px-6 md:px-10 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-normal text-white">Miiles Admin</h1>
          <p className="text-xs text-white/50 font-light">Cerebro de datos e instrucciones</p>
        </div>
        <Button onClick={logout} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
          <LogOut className="h-4 w-4" /> Salir
        </Button>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <Tabs defaultValue="prospects">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="prospects" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <Database className="h-4 w-4" /> Prospectos
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <FileCode className="h-4 w-4" /> Plantillas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prospects" className="mt-6">
            <ProspectsTab />
          </TabsContent>
          <TabsContent value="templates" className="mt-6">
            <TemplatesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
