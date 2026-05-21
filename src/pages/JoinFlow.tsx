import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ArrowRight, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import logotipoSvg from "@/assets/miiles/logotipo.svg";

type PublicFlow = {
  id: string;
  name: string;
  public_role: "viewer" | "editor";
};

const JoinFlow = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [flow, setFlow] = useState<PublicFlow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Load public flow
  useEffect(() => {
    if (!token) return;
    supabase
      .rpc("get_public_flow", { p_token: token })
      .then(({ data, error }) => {
        if (error || !data || (data as any[]).length === 0) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const f = (data as any[])[0];
        setFlow({ id: f.id, name: f.name, public_role: f.public_role });
        setLoading(false);
      });
  }, [token]);

  // Auto-join when logged in
  useEffect(() => {
    if (authLoading || loading || !flow || !user) return;
    supabase
      .rpc("join_flow_by_token", { p_token: token })
      .then(({ data, error }) => {
        if (error) {
          toast.error("No se pudo agregar el tablero");
          navigate("/boards");
          return;
        }
        toast.success("Tablero agregado a tu cuenta");
        navigate(`/boards/${data as string}`, { replace: true });
      });
  }, [authLoading, loading, flow, user, token, navigate]);

  if (loading || authLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-[#9CA3AF]" size={24} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center">
          <h1 className="text-2xl font-normal mb-2">Tablero no disponible</h1>
          <p className="text-sm font-light text-miiles-gray-400 mb-6">
            Este enlace ya no es válido o el tablero fue marcado como privado.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 rounded-full bg-black text-white text-sm font-light hover:bg-miiles-pink transition-colors"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  // Anonymous preview (logged-in path navigates away in the effect above)
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center">
        <img src={logotipoSvg} alt="miiles" className="h-6 mx-auto mb-10 opacity-80" />
        <h1 className="text-[26px] font-normal tracking-tight mb-2">
          {flow?.name || "Tablero compartido"}
        </h1>
        <p className="text-[13px] font-light text-miiles-gray-400 mb-8">
          Te invitaron a colaborar en este tablero como{" "}
          {flow?.public_role === "editor" ? "editor" : "lector"}.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() =>
              navigate(`/boards/${flow!.id}?guest_token=${token}`)
            }
            className="w-full h-12 rounded-full bg-black text-white text-sm font-normal hover:bg-[#1F2937] transition-colors flex items-center justify-center gap-2"
          >
            Entrar como invitado
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() =>
              navigate(`/login?next=${encodeURIComponent(`/boards/join/${token}`)}`)
            }
            className="w-full h-12 rounded-full bg-[#F3F4F6] text-black text-sm font-light hover:bg-[#E5E7EB] transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus size={16} />
            Iniciar sesión y guardar en mis tableros
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinFlow;
