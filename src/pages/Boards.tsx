import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Loader2, Plus, LayoutDashboard, Trash2, Users, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type FlowRow = { id: string; name: string; updated_at: string };
type SharedFlow = FlowRow & { role: "editor" | "viewer" };

const FREE_BOARD_LIMIT = 10;

export default function Boards() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [flows, setFlows] = useState<FlowRow[]>([]);
  const [shared, setShared] = useState<SharedFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<"free" | "pro">("free");

  const fetchData = async () => {
    if (!user) return;
    const [{ data: flowsData, error: flowsErr }, { data: profileData }, { data: collabRows }] = await Promise.all([
      supabase
        .from("flows")
        .select("id, name, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("flow_collaborators")
        .select("flow_id, role")
        .eq("user_id", user.id),
    ]);
    if (flowsErr) toast.error("Error al cargar tableros");
    setFlows((flowsData as FlowRow[]) || []);
    setPlan(((profileData?.plan as "free" | "pro") || "free"));

    const collabList = (collabRows as { flow_id: string; role: "editor" | "viewer" }[]) || [];
    if (collabList.length > 0) {
      const ids = collabList.map((c) => c.flow_id);
      const { data: sharedFlows } = await supabase
        .from("flows")
        .select("id, name, updated_at")
        .in("id", ids)
        .order("updated_at", { ascending: false });
      const roleById = new Map(collabList.map((c) => [c.flow_id, c.role] as const));
      setShared(
        ((sharedFlows as FlowRow[]) || []).map((f) => ({ ...f, role: roleById.get(f.id) || "viewer" }))
      );
    } else {
      setShared([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Realtime: refresh when collaborators change
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`boards-collab:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "flow_collaborators", filter: `user_id=eq.${user.id}` },
        () => fetchData(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const isPro = plan === "pro";
  const atLimit = !isPro && flows.length >= FREE_BOARD_LIMIT;

  const handleCreate = async () => {
    if (!user) return;
    if (atLimit) {
      toast.error(`Has alcanzado el límite de ${FREE_BOARD_LIMIT} tableros del plan gratuito. Actualiza a Pro para tableros ilimitados.`);
      return;
    }
    const { data, error } = await supabase
      .from("flows")
      .insert([{ user_id: user.id, name: `Tablero ${new Date().toLocaleDateString("es")}`, nodes: [], edges: [] }])
      .select()
      .single();
    if (error || !data) {
      toast.error("No se pudo crear el tablero");
      return;
    }
    navigate(`/boards/${data.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const { error } = await supabase.from("flows").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar");
      return;
    }
    toast.success("Tablero eliminado");
    setFlows((prev) => prev.filter((f) => f.id !== id));
  };

  const handleLeave = async (e: React.MouseEvent, flowId: string) => {
    e.stopPropagation();
    if (!user) return;
    const { error } = await supabase
      .from("flow_collaborators")
      .delete()
      .eq("flow_id", flowId)
      .eq("user_id", user.id);
    if (error) {
      toast.error("No se pudo salir del tablero");
      return;
    }
    toast.success("Saliste del tablero");
    setShared((prev) => prev.filter((f) => f.id !== flowId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 size={24} className="animate-spin text-miiles-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-8 md:px-12 md:pb-12 md:pt-48 max-w-5xl mx-auto space-y-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className={`text-2xl md:text-3xl font-normal ${isDark ? 'text-white' : 'text-black'}`}>Mis Tableros</h1>
        <button
          disabled={atLimit}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-light transition-colors ${
            atLimit
              ? "bg-miiles-gray-100 text-miiles-gray-400 cursor-not-allowed"
              : isDark
              ? "bg-black text-white border border-white/10 hover:bg-zinc-900"
              : "bg-black text-white hover:bg-miiles-pink"
          }`}
          onClick={handleCreate}
        >
          <Plus size={16} />
          Nuevo tablero
        </button>
      </div>

      {atLimit && (
        <div className="rounded-2xl bg-[#FFF8E6] border border-[#FDE68A] px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <p className="text-[13px] font-light text-[#92400E]">
            Has alcanzado el límite de {FREE_BOARD_LIMIT} tableros del plan gratuito. Actualiza a Pro para crear tableros ilimitados.
          </p>
          <button
            onClick={() => navigate("/precios")}
            className="text-[13px] font-normal px-4 py-2 rounded-full bg-black text-white hover:bg-miiles-pink transition-colors"
          >
            Ver planes Pro
          </button>
        </div>
      )}

      {flows.length === 0 ? (
        <div className={`text-center py-20 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-miiles-gray-50'}`}>
          <LayoutDashboard size={48} className="mx-auto text-miiles-gray-200 mb-4" />
          <h2 className={`text-lg font-normal mb-2 ${isDark ? 'text-white' : 'text-black'}`}>No tienes tableros</h2>
          <p className="text-sm font-light text-miiles-gray-400">Crea tu primer tablero para organizar tus ideas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flows.map((flow, i) => (
            <motion.div
              key={flow.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`aspect-[4/3] rounded-[24px] overflow-hidden cursor-pointer transition-colors group relative flex flex-col justify-end p-6 ${isDark ? 'bg-black hover:bg-zinc-900 ring-1 ring-white/10' : 'bg-white hover:bg-miiles-gray-50 shadow-md'}`}
              onClick={() => navigate(`/boards/${flow.id}`)}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`flex items-center gap-3 min-w-0 ${isDark ? 'text-white' : 'text-black'}`}>
                  <LayoutDashboard className="w-[22px] h-[22px] shrink-0" strokeWidth={1.5} />
                  <span className="font-normal text-[16px] truncate">{flow.name}</span>
                </div>
                <button
                  onClick={(e) => handleDelete(e, flow.id)}
                  className={`p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all ${isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/30 hover:text-black'}`}
                  aria-label="Eliminar"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Compartidos conmigo */}
      {shared.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Users size={20} strokeWidth={1.5} className={isDark ? 'text-white/70' : 'text-miiles-gray-600'} />
            <h2 className={`text-lg font-normal ${isDark ? 'text-white' : 'text-black'}`}>Compartidos conmigo</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shared.map((flow, i) => (
              <motion.div
                key={flow.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`aspect-[4/3] rounded-[24px] overflow-hidden cursor-pointer transition-colors group relative flex flex-col justify-between p-6 ${isDark ? 'bg-black hover:bg-zinc-900 ring-1 ring-white/10' : 'bg-white hover:bg-miiles-gray-50 shadow-md'}`}
                onClick={() => navigate(`/boards/${flow.id}`)}
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-light uppercase tracking-wider ${
                    flow.role === "editor"
                      ? isDark ? "bg-white/10 text-white/80" : "bg-miiles-blue-light text-miiles-blue"
                      : isDark ? "bg-white/5 text-white/50" : "bg-miiles-gray-100 text-miiles-gray-600"
                  }`}>
                    {flow.role === "editor" ? "Editor" : "Solo lectura"}
                  </span>
                  <button
                    onClick={(e) => handleLeave(e, flow.id)}
                    className={`p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all ${isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/30 hover:text-black'}`}
                    aria-label="Salir del tablero"
                    title="Salir del tablero"
                  >
                    <LogOut size={16} strokeWidth={1.5} />
                  </button>
                </div>
                <div className={`flex items-center gap-3 min-w-0 ${isDark ? 'text-white' : 'text-black'}`}>
                  <LayoutDashboard className="w-[22px] h-[22px] shrink-0" strokeWidth={1.5} />
                  <span className="font-normal text-[16px] truncate">{flow.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
