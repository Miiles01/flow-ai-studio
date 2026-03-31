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
        className="absolute top-4 right-4 z-20 p-2.5 rounded-xl bg-card/90 backdrop-blur-xl border border-border shadow-xl shadow-black/30 text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
      </motion.button>

      {/* Sidebar panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-0 right-0 z-10 w-80 h-full bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl shadow-black/50 flex flex-col"
          >
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Mis flujos</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {flows.length} diagrama{flows.length !== 1 ? "s" : ""} guardado{flows.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Actions */}
            <div className="p-3 flex gap-2">
              <button
                onClick={handleNew}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80 transition-colors"
              >
                <Plus size={14} /> Nuevo
              </button>
              <button
                onClick={handleSave}
                disabled={saving || currentNodes.length === 0}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                {activeFlowId ? "Guardar" : "Crear"}
              </button>
            </div>

            {/* Flow list */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-muted-foreground" />
                </div>
              ) : flows.length === 0 ? (
                <div className="text-center py-8">
                  <FileText size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">Sin flujos aún</p>
                </div>
              ) : (
                flows.map((flow) => (
                  <motion.div
                    key={flow.id}
                    layout
                    className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                      activeFlowId === flow.id
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-secondary/50 hover:bg-secondary border border-transparent"
                    }`}
                    onClick={() => handleLoad(flow)}
                  >
                    <FileText size={14} className="shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">{flow.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={10} className="text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(flow.updated_at).toLocaleDateString("es")}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1">
                          · {(flow.nodes || []).length} nodos
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(flow.id);
                      }}
                      className="shrink-0 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive transition-all"
                    >
                      <Trash2 size={13} />
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
