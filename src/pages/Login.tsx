import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logotipoSvg from "@/assets/miiles/logotipo.svg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("¡Bienvenido de vuelta!");
      navigate(next);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${next}`,
    });
    if (result.error) {
      toast.error("Error al iniciar sesión con Google");
    }
    if (result.redirected) return;
    navigate(next);
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white w-full lg:w-1/2 py-8 px-4 md:py-14 md:px-8 rounded-[32px] flex flex-col justify-center"
      style={{ minHeight: "680px" }}
    >
      <div className="text-center mb-10">
        <Link to="/" className="inline-block mb-8 hover:opacity-80 transition-opacity">
          <img src={logotipoSvg} alt="miiles" className="h-6 mx-auto" />
        </Link>
        <h1 className="text-[28px] font-medium text-foreground">Iniciar sesión</h1>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-miiles-gray-400" />
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-12 h-14 bg-transparent border-border rounded-full"
            required
          />
        </div>
        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-miiles-gray-400" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-12 pr-12 h-14 bg-transparent border-border rounded-full"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-miiles-gray-400 hover:text-black transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="w-auto px-12 min-w-[180px] h-12 rounded-full bg-black text-white font-medium hover:-translate-y-1 transition-transform disabled:opacity-50 disabled:pointer-events-none"
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Entrar"}
          </button>
        </div>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-4 text-muted-foreground">o</span>
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" className="w-auto px-10 rounded-full h-12 border-border hover:bg-gray-50" onClick={handleGoogleLogin}>
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </Button>
      </div>

      <p className="text-center text-sm text-miiles-gray-400 font-normal mt-10">
        ¿No tienes cuenta?{" "}
        <Link to={`/register${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-accent hover:underline font-medium">
          Regístrate
        </Link>
      </p>
    </motion.div>
  );
};

export default Login;
