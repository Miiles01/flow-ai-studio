import { useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  ConnectionMode,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Loader2, Save, Settings2, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";

import FlowNode from "@/components/nodes/FlowNode";
import ShapeNode from "@/components/nodes/ShapeNode";
import TextNode from "@/components/nodes/TextNode";
import Toolbar from "@/components/Toolbar";
import AIPromptBar from "@/components/AIPromptBar";
import { generateFlowFromPrompt } from "@/lib/generateFlow";

const SHAPE_TYPES = ["square", "circle", "diamond", "triangle", "hexagon", "star"];
const nodeTypes = { flowNode: FlowNode, shapeNode: ShapeNode, textNode: TextNode };

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
  const [interactionMode, setInteractionMode] = useState<"edit" | "pan">("edit");
  const [hideTools, setHideTools] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const nodeCounter = useRef(0);

  const [activeDrawShape, setActiveDrawShape] = useState<string | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const drawingNodeRef = useRef<{
    id: string;
    startX: number;
    startY: number;
  } | null>(null);

  // Close settings dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as HTMLElement)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const isValidConnection = useCallback(
    (connection: Connection) => connection.source !== connection.target,
    []
  );

  const handleAddNode = useCallback(
    (type: string) => {
      nodeCounter.current += 1;
      const isShape = SHAPE_TYPES.includes(type);
      const isText = type === "text";
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: isShape ? "shapeNode" : isText ? "textNode" : "flowNode",
        position: {
          x: 200 + Math.random() * 300,
          y: 150 + nodeCounter.current * 80,
        },
        style: isShape ? { width: 120, height: 120 } : isText ? { width: 200, height: 80 } : undefined,
        data: isShape
          ? { shape: type, label: "" }
          : isText
          ? { text: "Texto", fontSize: 16, bold: false, italic: false, underline: false }
          : { label: `Nodo ${nodeCounter.current}`, type },
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

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!activeDrawShape || !reactFlowInstance) return;

    // Ensure we clicked on the empty canvas pane, not on interactive overlays, nodes, etc.
    const target = e.target as HTMLElement;
    const isInsideCanvas = target.closest(".react-flow__pane") !== null;
    const isInteractive = target.closest(".react-flow__node") !== null ||
                          target.closest(".react-flow__controls") !== null ||
                          target.closest(".react-flow__minimap") !== null ||
                          target.closest("button") !== null ||
                          target.closest("input") !== null;

    if (!isInsideCanvas || isInteractive) return;

    e.preventDefault();

    // Project starting page coordinates to canvas flow space
    const flowStart = reactFlowInstance.screenToFlowPosition({
      x: e.clientX,
      y: e.clientY,
    });

    if (activeDrawShape === "text") {
      const newNodeId = `node-${Date.now()}`;
      const newNode: Node = {
        id: newNodeId,
        type: "textNode",
        position: { x: flowStart.x, y: flowStart.y },
        style: { width: 200, height: 80 },
        data: { text: "Texto", fontSize: 16, bold: false, italic: false, underline: false },
      };

      setNodes((nds) =>
        nds.map((n) => ({ ...n, selected: false })).concat({ ...newNode, selected: true })
      );

      setActiveDrawShape(null);
      setInteractionMode("edit");
      toast.success("Texto creado");
      return;
    }

    const newNodeId = `node-${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: "shapeNode",
      position: { x: flowStart.x, y: flowStart.y },
      style: { width: 10, height: 10 },
      data: { shape: activeDrawShape, label: "" },
    };

    setNodes((nds) => [...nds, newNode]);

    drawingNodeRef.current = {
      id: newNodeId,
      startX: flowStart.x,
      startY: flowStart.y,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!drawingNodeRef.current || !reactFlowInstance) return;

      const currentFlowPos = reactFlowInstance.screenToFlowPosition({
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      });

      const dx = currentFlowPos.x - drawingNodeRef.current.startX;
      const dy = currentFlowPos.y - drawingNodeRef.current.startY;

      // Restrict minimum dimensions to prevent vanishing
      const width = Math.max(15, Math.abs(dx));
      const height = Math.max(15, Math.abs(dy));

      // Support multi-directional drag top-left calculations (Figma-style)
      const x = dx < 0 ? currentFlowPos.x : drawingNodeRef.current.startX;
      const y = dy < 0 ? currentFlowPos.y : drawingNodeRef.current.startY;

      setNodes((nds) =>
        nds.map((n) =>
          n.id === drawingNodeRef.current!.id
            ? { ...n, position: { x, y }, style: { width, height } }
            : n
        )
      );
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      if (drawingNodeRef.current) {
        const finalId = drawingNodeRef.current.id;
        // Auto-select the drawn shape node on drag finish
        setNodes((nds) =>
          nds.map((n) =>
            n.id === finalId ? { ...n, selected: true } : { ...n, selected: false }
          )
        );
      }

      drawingNodeRef.current = null;
      setActiveDrawShape(null);
      setInteractionMode("edit");
      toast.success("Figura creada");
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }, [activeDrawShape, reactFlowInstance, setNodes, setInteractionMode]);

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

        {/* Left: back + name + settings */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Name pill */}
          <div className="flex items-center gap-1 pl-2 pr-4 py-1.5 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] min-w-0">
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

          {/* Settings icon + dropdown */}
          <div ref={settingsRef} className="relative">
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              className={`w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:bg-[#F3F4F6] ${settingsOpen ? "bg-[#F3F4F6]" : ""}`}
              aria-label="Configuración del tablero"
            >
              <Settings2 size={16} strokeWidth={1.5} className="text-[#6B7280]" />
            </button>

            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-[calc(100%+8px)] left-0 w-52 bg-white rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.10)] overflow-hidden z-50"
                >
                  <div className="px-3 py-2.5">
                    <p className="text-[10px] text-[#9CA3AF] font-light uppercase tracking-widest mb-1 px-2">Vista</p>
                    <button
                      onClick={() => { setHideTools((v) => !v); setSettingsOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F3F4F6] transition-colors text-left"
                    >
                      {hideTools
                        ? <Eye size={15} strokeWidth={1.5} className="text-[#6B7280] shrink-0" />
                        : <EyeOff size={15} strokeWidth={1.5} className="text-[#6B7280] shrink-0" />
                      }
                      <span className="text-[13px] font-normal text-black">
                        {hideTools ? "Mostrar herramientas" : "Ocultar herramientas"}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Save button */}
        <AnimatePresence>
          {!hideTools && (
            <motion.button
              key="save-btn"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={handleSave}
              disabled={saving}
              className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black shadow-[0_8px_30px_rgb(0,0,0,0.06)] text-[13px] font-normal hover:bg-[#F3F4F6] transition-all hover:scale-[1.02] disabled:opacity-40"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} strokeWidth={1.5} />}
              Guardar
            </motion.button>
          )}
        </AnimatePresence>
      </header>

      <div className="flex-1 relative" onPointerDown={handlePointerDown}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          isValidConnection={isValidConnection}
          panOnDrag={activeDrawShape ? false : interactionMode === "pan" ? true : [1, 2]}
          selectionOnDrag={activeDrawShape ? false : interactionMode === "edit"}
          nodesDraggable={activeDrawShape ? false : interactionMode === "edit"}
          nodesConnectable={activeDrawShape ? false : interactionMode === "edit"}
          elementsSelectable={activeDrawShape ? false : interactionMode === "edit"}
          fitView
          onInit={setReactFlowInstance}
          proOptions={{ hideAttribution: true }}
          className={`bg-white ${interactionMode === "pan" ? "pan-mode" : "edit-mode"}`}
          style={{ cursor: activeDrawShape ? "crosshair" : "inherit" }}
        >
          <Background variant={BackgroundVariant.Dots} gap={32} size={1} color="#E5E7EB" />
          {!hideTools && <Controls position="bottom-left" showInteractive={false} />}
        </ReactFlow>

        <AnimatePresence>
          {!hideTools && (
            <motion.div
              key="toolbar"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-y-0 left-0 flex items-center"
            >
              <Toolbar
                onAddNode={handleAddNode}
                interactionMode={interactionMode}
                setInteractionMode={setInteractionMode}
                activeDrawShape={activeDrawShape}
                setActiveDrawShape={setActiveDrawShape}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!hideTools && (
            <motion.div
              key="prompt-bar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <AIPromptBar onGenerate={handleAIGenerate} isGenerating={isGenerating} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
