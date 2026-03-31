import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftOpen,
  PanelLeftClose,
  Plus,
  Trash2,
  FileText,
  Clock,
  Loader2,
} from "lucide-react";
import type { Node, Edge } from "@xyflow/react";

type Flow = {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  created_at: string;
  updated_at: string;
};

type FlowSidebarProps = {
  currentNodes: Node[];
  currentEdges: Edge[];
  onLoadFlow: (nodes: Node[], edges: Edge[]) => void;
  onNewFlow: () => void;
};

const FlowSidebar = ({ currentNodes, currentEdges, onLoadFlow, onNewFlow }: FlowSidebarProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);

  const fetchFlows = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("flows")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (error) {
      toast.error("Error al cargar flujos");
    } else {
      setFlows((data || []) as unknown as Flow[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (open && user) fetchFlows();
  }, [open, user, fetchFlows]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    if (activeFlowId) {
      const { error } = await supabase
        .from("flows")
        .update({
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          edges: JSON.parse(JSON.stringify(currentEdges)),
        })
        .eq("id", activeFlowId);
      if (error) toast.error("Error al guardar");
      else toast.success("Flujo guardado");
    } else {
      const name = `Flujo ${new Date().toLocaleDateString("es")}`;
      const { data, error } = await supabase
        .from("flows")
        .insert([{
          user_id: user.id,
          name,
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          edges: JSON.parse(JSON.stringify(currentEdges)),
        }])
        .select()
        .single();
      if (error) toast.error("Error al crear flujo");
      else {
        toast.success("Flujo creado");
        setActiveFlowId(data.id);
      }
    }

    fetchFlows();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("flows").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar");
    } else {
      toast.success("Flujo eliminado");
      if (activeFlowId === id) {
        setActiveFlowId(null);
        onNewFlow();
      }
      fetchFlows();
    }
  };

  const handleLoad = (flow: Flow) => {
    setActiveFlowId(flow.id);
    onLoadFlow(flow.nodes, flow.edges);
    toast.success(`Cargado: ${flow.name}`);
  };

  const handleNew = () => {
    setActiveFlowId(null);
    onNewFlow();
  };

  if (!user) return null;

  return (
    <>
      {/* Toggle button */}
      <motion.button
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => setOpen(!open)}
        className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm text-black hover:bg-black hover:text-white transition-all duration-200 btn-hover-float"
      >
        {open ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
      </motion.button>

      {/* Sidebar panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-0 right-0 z-10 w-80 h-full bg-white shadow-md flex flex-col font-sans"
          >
            <div className="p-8 pb-4">
              <h2 className="text-xl font-normal text-black tracking-tight">Mis flujos</h2>
              <p className="text-xs font-light text-miiles-gray-400 mt-1">
                {flows.length} diagrama{flows.length !== 1 ? "s" : ""} registrado{flows.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Actions */}
            <div className="p-8 pt-4 flex gap-3">
              <button
                onClick={handleNew}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white text-black text-xs shadow-sm transition-all btn-hover-float hover:bg-black hover:text-white"
              >
                <Plus size={14} /> Nuevo
              </button>
              <button
                onClick={handleSave}
                disabled={saving || currentNodes.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-black text-white text-xs transition-all btn-hover-float hover:bg-miiles-pink-light hover:text-miiles-pink disabled:opacity-20 disabled:transform-none"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                {activeFlowId ? "Guardar" : "Crear"}
              </button>
            </div>

            {/* Flow list */}
            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-3">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-miiles-blue" />
                </div>
              ) : flows.length === 0 ? (
                <div className="text-center py-12 bg-miiles-gray-50 rounded-lg">
                  <FileText size={40} className="mx-auto text-miiles-gray-200 mb-3" />
                  <p className="text-sm font-light text-miiles-gray-400">Sin flujos todavía</p>
                </div>
              ) : (
                flows.map((flow) => (
                  <motion.div
                    key={flow.id}
                    layout
                    className={`group relative flex items-center gap-4 p-4 rounded-md cursor-pointer transition-all duration-300 ${
                      activeFlowId === flow.id
                        ? "bg-miiles-gray-50"
                        : "hover:bg-miiles-gray-50"
                    }`}
                    onClick={() => handleLoad(flow)}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${activeFlowId === flow.id ? "bg-miiles-blue" : "bg-miiles-gray-100"}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm tracking-tight ${activeFlowId === flow.id ? "font-normal text-black" : "font-light text-miiles-gray-600"}`}>
                        {flow.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-light text-miiles-gray-400 uppercase tracking-wider">
                          {new Date(flow.updated_at).toLocaleDateString("es", { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-miiles-gray-200">/</span>
                        <span className="text-[10px] font-light text-miiles-gray-400">
                          {(flow.nodes || []).length} nodos
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(flow.id);
                      }}
                      className="shrink-0 p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-miiles-pink-light text-miiles-pink transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FlowSidebar;
