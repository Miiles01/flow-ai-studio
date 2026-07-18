import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(password);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message ?? "Contraseña incorrecta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f11] p-6">
      <form onSubmit={handle} className="w-full max-w-sm space-y-6 p-8 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-normal text-white">Miiles Admin</h1>
          <p className="text-xs text-white/60 font-light">Acceso restringido</p>
        </div>
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
          className="bg-[hsl(222,20%,14%)] text-white"
        />
        <Button type="submit" disabled={loading || !password} className="w-full bg-white text-black hover:bg-white/90">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
