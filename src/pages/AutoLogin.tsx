import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AutoLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    async function login() {
      const email = "test+1786307678693@miiles.app";
      const password = "Miiles.Supabase.2026!";
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Auto-login error:", error);
        alert("Error auto-login: " + error.message);
      } else {
        // Redirigir al dashboard
        navigate("/dashboard");
      }
    }
    
    login();
  }, [navigate]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Iniciando sesión automáticamente...</p>
      </div>
    </div>
  );
}
