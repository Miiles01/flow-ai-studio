import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Plus, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import placeholderMiro from "@/assets/miro-placeholder.jpg"; // Wait, I need to know how to save the image.

// I will import the image directly or use an absolute path for now, but usually it's better to put the image in public or assets.
// Since the image was generated in the artifacts directory, I will copy it to src/assets later.
export default function Boards() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("flows")
      .select("id, name, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setFlows(data || []);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
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
          onClick={() => navigate("/")} // Assuming flow builder is at root
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
              className="bg-background rounded-xl border border-muted overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => navigate("/")} // Navigate to flow editor
            >
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                <img 
                  src="/miro_placeholder.png" 
                  alt="Board preview" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-normal text-sm">{flow.name}</h3>
                <p className="text-xs font-light text-muted-foreground mt-1">
                  Actualizado: {new Date(flow.updated_at).toLocaleDateString("es-ES")}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
