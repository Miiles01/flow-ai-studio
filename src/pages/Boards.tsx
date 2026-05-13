import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Plus, LayoutDashboard, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type FlowRow = { id: string; name: string; updated_at: string };

export default function Boards() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [flows, setFlows] = useState<FlowRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlows = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("flows")
      .select("id, name, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (error) toast.error("Error al cargar tableros");
    setFlows((data as FlowRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFlows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCreate = async () => {
    if (!user) return;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 size={24} className="animate-spin text-miiles-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-normal">Mis Tableros</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-light hover:bg-miiles-pink transition-colors"
          onClick={handleCreate}
        >
          <Plus size={16} />
          Nuevo tablero
        </button>
      </div>

      {flows.length === 0 ? (
        <div className="text-center py-20 bg-miiles-gray-50 rounded-2xl">
          <LayoutDashboard size={48} className="mx-auto text-miiles-gray-200 mb-4" />
          <h2 className="text-lg font-normal mb-2">No tienes tableros</h2>
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
              className="bg-background rounded-xl border border-muted overflow-hidden cursor-pointer hover:shadow-md transition-shadow group relative"
              onClick={() => navigate(`/boards/${flow.id}`)}
            >
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                <img
                  src="/miro_placeholder.png"
                  alt="Board preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="font-normal text-sm truncate">{flow.name}</h3>
                  <p className="text-xs font-light text-muted-foreground mt-1">
                    Actualizado: {new Date(flow.updated_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, flow.id)}
                  className="p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-miiles-pink-light text-miiles-pink transition-all"
                  aria-label="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
