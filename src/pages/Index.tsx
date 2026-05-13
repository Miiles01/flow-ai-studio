import { useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import FlowNode from "@/components/nodes/FlowNode";
import Toolbar from "@/components/Toolbar";
import AIPromptBar from "@/components/AIPromptBar";
import { generateFlowFromPrompt } from "@/lib/generateFlow";

const nodeTypes = { flowNode: FlowNode };

const Index = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [name, setName] = useState("Tablero sin título");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const nodeCounter = useRef(0);

  // Load flow by id
  useEffect(() => {
    const load = async () => {
      if (!user || !id || id === "new") {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("flows")
        .select("name, nodes, edges")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (error || !data) {
        toast.error("Tablero no encontrado");
        navigate("/boards");
        return;
      }
      setName(data.name || "Tablero");
      setNodes(((data.nodes as unknown) as Node[]) || []);
      setEdges(((data.edges as unknown) as Edge[]) || []);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const handleAddNode = useCallback(
    (type: string) => {
      nodeCounter.current += 1;
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: "flowNode",
        position: {
          x: 250 + Math.random() * 300,
          y: 150 + nodeCounter.current * 80,
        },
        data: { label: `Nuevo nodo ${nodeCounter.current}`, type },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleAIGenerate = useCallback(
    async (prompt: string) => {
      setIsGenerating(true);
      try {
        const { nodes: newNodes, edges: newEdges } = await generateFlowFromPrompt(prompt);
        setNodes((prev) => [...prev, ...newNodes]);
        setEdges((prev) => [...prev, ...newEdges]);
        toast.success(`Diagrama generado con ${newNodes.length} nodos`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        toast.error(message);
      } finally {
        setIsGenerating(false);
      }
    },
    [setNodes, setEdges]
  );

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const payload = {
      name,
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    if (!id || id === "new") {
      const { data, error } = await supabase
        .from("flows")
        .insert([{ user_id: user.id, ...payload }])
        .select()
        .single();
      setSaving(false);
      if (error || !data) {
        toast.error("Error al crear el tablero");
        return;
      }
      toast.success("Tablero creado");
      navigate(`/boards/${data.id}`, { replace: true });
    } else {
      const { error } = await supabase.from("flows").update(payload).eq("id", id);
      setSaving(false);
      if (error) toast.error("Error al guardar");
      else toast.success("Tablero guardado");
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-miiles-gray-400" size={24} />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-background overflow-hidden relative flex flex-col">
      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-6 z-20 pointer-events-none">
        <div className="flex items-center gap-1 pl-2 pr-4 py-1.5 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] min-w-0 pointer-events-auto">
          <button
            onClick={() => navigate("/boards")}
            className="p-2 rounded-full hover:bg-[#F3F4F6] transition-colors text-[#6B7280] hover:text-black"
            aria-label="Volver"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <div className="w-[1px] h-5 bg-[#E5E7EB] mx-1" />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent text-[14px] font-normal tracking-tight outline-none focus:ring-0 px-2 py-1 rounded hover:bg-[#F3F4F6] transition-colors min-w-0 max-w-[40vw]"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-light hover:bg-black/90 transition-all hover:scale-[1.02] disabled:opacity-40 shadow-sm"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} strokeWidth={1.5} />}
          Guardar
        </button>
      </header>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          className="bg-white"
        >
          <Background variant={BackgroundVariant.Dots} gap={32} size={1} color="#E5E7EB" />
          <Controls position="bottom-left" showInteractive={false} />
        </ReactFlow>

        <Toolbar onAddNode={handleAddNode} />
        <AIPromptBar onGenerate={handleAIGenerate} isGenerating={isGenerating} />
      </div>
    </div>
  );
};

export default Index;
