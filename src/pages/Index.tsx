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
import { ArrowLeft, Loader2, Check, Cloud, CloudOff, Settings2, EyeOff, Eye, Trash2, Undo2, Redo2 } from "lucide-react";
import { useHistory } from "@/hooks/useHistory";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";

import FlowNode from "@/components/nodes/FlowNode";
import ShapeNode from "@/components/nodes/ShapeNode";
import TextNode from "@/components/nodes/TextNode";
import TodoNode from "@/components/nodes/TodoNode";
import ImageNode from "@/components/nodes/ImageNode";
import FrameNode from "@/components/nodes/FrameNode";
import Toolbar from "@/components/Toolbar";
import AIPromptBar from "@/components/AIPromptBar";
import { generateFlowFromPrompt } from "@/lib/generateFlow";

const SHAPE_TYPES = ["square", "circle", "diamond", "triangle", "hexagon", "star"];
const nodeTypes = { flowNode: FlowNode, shapeNode: ShapeNode, textNode: TextNode, todoNode: TodoNode, imageNode: ImageNode, frameNode: FrameNode };

const Index = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [name, setName] = useState("Tablero sin título");
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "dirty" | "saving" | "saved" | "error">("idle");
  const [interactionMode, setInteractionMode] = useState<"edit" | "pan">("edit");
  const [hideTools, setHideTools] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const nodeCounter = useRef(0);
  const lastSavedRef = useRef<string>("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCreatingRef = useRef(false);
  const skipNextDirtyRef = useRef(true);

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
      const loadedNodes = ((data.nodes as unknown) as Node[]) || [];
      const loadedEdges = ((data.edges as unknown) as Edge[]) || [];
      setNodes(loadedNodes);
      setEdges(loadedEdges);
      lastSavedRef.current = JSON.stringify({ name: data.name, nodes: loadedNodes, edges: loadedEdges });
      skipNextDirtyRef.current = true;
      setSaveState("saved");
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  // History (undo/redo)
  const { undo, redo, canUndo, canRedo } = useHistory(
    nodes,
    edges,
    (n) => setNodes(n),
    (e) => setEdges(e),
    !loading,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isEditable =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (target && (target as HTMLElement).isContentEditable);
      if (isEditable) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const isValidConnection = useCallback(
    (connection: Connection) => connection.source !== connection.target,
    []
  );

  // ── Frame parent-child: attach/detach nodes on drag stop ──────────────────
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, draggedNode: Node) => {
      // Frames don't attach to other frames
      if (draggedNode.type === "frameNode") return;

      const allNodes = nodes;
      const frames = allNodes.filter((n) => n.type === "frameNode");
      if (frames.length === 0 && !draggedNode.parentId) return;

      // Resolve absolute position (child positions are relative to parent)
      let absX = draggedNode.position.x;
      let absY = draggedNode.position.y;
      if (draggedNode.parentId) {
        const parent = allNodes.find((n) => n.id === draggedNode.parentId);
        if (parent) { absX += parent.position.x; absY += parent.position.y; }
      }

      const nW = (draggedNode.measured?.width ?? (draggedNode.style?.width as number)) || 100;
      const nH = (draggedNode.measured?.height ?? (draggedNode.style?.height as number)) || 100;
      const cx = absX + nW / 2;
      const cy = absY + nH / 2;

      // Find first frame whose bounds contain the node center
      let targetFrame: Node | null = null;
      for (const frame of frames) {
        const fw = (frame.measured?.width ?? (frame.style?.width as number)) || 300;
        const fh = (frame.measured?.height ?? (frame.style?.height as number)) || 200;
        if (cx >= frame.position.x && cx <= frame.position.x + fw &&
            cy >= frame.position.y && cy <= frame.position.y + fh) {
          targetFrame = frame;
          break;
        }
      }

      // No change needed if already in the correct frame (or still outside all frames)
      const alreadyCorrect = targetFrame
        ? draggedNode.parentId === targetFrame.id
        : !draggedNode.parentId;
      if (alreadyCorrect) return;

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== draggedNode.id) return n;
          if (targetFrame) {
            return {
              ...n,
              parentId: targetFrame.id,
              position: { x: absX - targetFrame.position.x, y: absY - targetFrame.position.y },
            };
          }
          // Detach
          return { ...n, parentId: undefined, extent: undefined, position: { x: absX, y: absY } };
        })
      );
    },
    [nodes, setNodes]
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

  // Debounced autosave: only after id exists (not "new"). For "new", first manual save creates the row.
  const persist = useCallback(async () => {
    if (!user) return;
    // Strip volatile runtime fields React Flow adds
    const sanitizedNodes = nodes.map((n) => {
      const { selected, dragging, resizing, ...rest } = n as Node & { resizing?: boolean };
      return rest;
    });
    const sanitizedEdges = edges.map((e) => {
      const { selected, ...rest } = e as Edge;
      return rest;
    });
    const payload = {
      name,
      nodes: JSON.parse(JSON.stringify(sanitizedNodes)),
      edges: JSON.parse(JSON.stringify(sanitizedEdges)),
    };
    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedRef.current) {
      setSaveState("saved");
      return;
    }
    setSaveState("saving");

    if (!id || id === "new") {
      if (isCreatingRef.current) return;
      isCreatingRef.current = true;
      const { data, error } = await supabase
        .from("flows")
        .insert([{ user_id: user.id, ...payload }])
        .select()
        .single();
      isCreatingRef.current = false;
      if (error || !data) {
        setSaveState("error");
        toast.error("Error al crear el tablero");
        return;
      }
      lastSavedRef.current = serialized;
      setSaveState("saved");
      navigate(`/boards/${data.id}`, { replace: true });
    } else {
      const { error } = await supabase.from("flows").update(payload).eq("id", id);
      if (error) {
        setSaveState("error");
        return;
      }
      lastSavedRef.current = serialized;
      setSaveState("saved");
    }
  }, [user, id, name, nodes, edges, navigate]);

  // Mark dirty + schedule autosave on changes
  useEffect(() => {
    if (loading) return;
    if (skipNextDirtyRef.current) {
      skipNextDirtyRef.current = false;
      return;
    }
    setSaveState("dirty");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persist();
    }, 1200);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [nodes, edges, name, loading, persist]);

  // Flush pending save before unload
  useEffect(() => {
    const handler = () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        persist();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [persist]);

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
    // ── Determine node type + data for ALL drawable elements ──────────────
    let nodeType = "shapeNode";
    let nodeData: Record<string, unknown> = { shape: activeDrawShape, label: "" };
    let minW = 60;
    let minH = 60;
    let successMsg = "Figura creada";

    if (activeDrawShape === "frame") {
      nodeType = "frameNode";
      nodeData = { label: "Sección" };
      minW = 200; minH = 120;
      successMsg = "Sección creada";
    } else if (activeDrawShape === "text") {
      nodeType = "textNode";
      nodeData = { text: "Texto", fontSize: 16, bold: false, italic: false, underline: false };
      minW = 140; minH = 50;
      successMsg = "Texto creado";
    } else if (activeDrawShape === "image") {
      nodeType = "imageNode";
      nodeData = { imageUrl: "", objectFit: "cover" };
      minW = 120; minH = 80;
      successMsg = "Image Block creado";
    } else if (activeDrawShape === "todo") {
      nodeType = "todoNode";
      nodeData = {
        title: "Lista de Tareas",
        showTitle: true,
        subtitle: "Organiza tus actividades diarias",
        showSubtitle: true,
        tasks: [
          { id: "t1", text: "Definir objetivos de diseño", completed: false },
          { id: "t2", text: "Diseñar wireframes responsivos", completed: false },
          { id: "t3", text: "Validar prototipos con usuarios", completed: false },
        ],
        fontSize: 14,
        backgroundColor: "#FFFFFF",
        accentColor: "#4059F1",
      };
      minW = 280; minH = 200;
      successMsg = "Todo List creado";
    }

    // ── Create node at cursor position, small seed size ────────────────────
    const newNodeId = `node-${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: nodeType,
      position: { x: flowStart.x, y: flowStart.y },
      style: { width: minW, height: minH },
      data: nodeData,
    };

    // Frames prepend so they render BELOW everything else
    if (nodeType === "frameNode") {
      setNodes((nds) => [{ ...newNode, zIndex: -1 }, ...nds]);
    } else {
      setNodes((nds) => [...nds, newNode]);
    }

    drawingNodeRef.current = {
      id: newNodeId,
      startX: flowStart.x,
      startY: flowStart.y,
    };

    // ── Shared drag handler — resizes node as user drags ──────────────────
    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!drawingNodeRef.current || !reactFlowInstance) return;

      const currentFlowPos = reactFlowInstance.screenToFlowPosition({
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      });

      const dx = currentFlowPos.x - drawingNodeRef.current.startX;
      const dy = currentFlowPos.y - drawingNodeRef.current.startY;

      const width  = Math.max(minW, Math.abs(dx));
      const height = Math.max(minH, Math.abs(dy));

      // Figma-style: support dragging in any direction
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

        setNodes((nds) => {
          const createdNode = nds.find((n) => n.id === finalId);
          if (!createdNode || createdNode.type === "frameNode") {
            return nds.map((n) =>
              n.id === finalId ? { ...n, selected: true } : { ...n, selected: false }
            );
          }

          const sections = nds.filter((n) => n.type === "frameNode" && n.id !== finalId);
          if (sections.length === 0) {
            return nds.map((n) =>
              n.id === finalId ? { ...n, selected: true } : { ...n, selected: false }
            );
          }

          const nW = (createdNode.style?.width as number) || 100;
          const nH = (createdNode.style?.height as number) || 100;
          const cx = createdNode.position.x + nW / 2;
          const cy = createdNode.position.y + nH / 2;

          let targetSection: Node | null = null;
          for (const sec of sections) {
            const sw = (sec.measured?.width ?? (sec.style?.width as number)) || 300;
            const sh = (sec.measured?.height ?? (sec.style?.height as number)) || 200;
            if (cx >= sec.position.x && cx <= sec.position.x + sw &&
                cy >= sec.position.y && cy <= sec.position.y + sh) {
              targetSection = sec;
              break;
            }
          }

          return nds.map((n) => {
            if (n.id === finalId) {
              if (targetSection) {
                return {
                  ...n,
                  parentId: targetSection.id,
                  position: {
                    x: createdNode.position.x - targetSection.position.x,
                    y: createdNode.position.y - targetSection.position.y,
                  },
                  selected: true,
                };
              }
              return { ...n, selected: true };
            }
            return { ...n, selected: false };
          });
        });
      }

      drawingNodeRef.current = null;
      setActiveDrawShape(null);
      setInteractionMode("edit");
      toast.success(successMsg);
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
                    <p className="text-[10px] text-[#9CA3AF] font-light uppercase tracking-widest mb-1 px-2">Ajustes</p>
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

                    <button
                      onClick={() => {
                        setNodes([]);
                        setEdges([]);
                        setSettingsOpen(false);
                        toast.success("Lienzo limpiado correctamente");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FEE2E2] hover:text-[#EF4444] transition-colors text-left group"
                    >
                      <Trash2 size={15} strokeWidth={1.5} className="text-[#6B7280] group-hover:text-[#EF4444] shrink-0 transition-colors" />
                      <span className="text-[13px] font-normal text-black group-hover:text-[#EF4444] transition-colors">
                        Limpiar lienzo
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: history controls */}
        <div className="flex items-center gap-1 pointer-events-auto px-1.5 py-1.5 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                  canUndo
                    ? "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                    : "text-[#D1D5DB] cursor-not-allowed"
                }`}
                aria-label="Deshacer"
              >
                <Undo2 size={16} strokeWidth={1.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-[12px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
              Deshacer (⌘Z)
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={redo}
                disabled={!canRedo}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                  canRedo
                    ? "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                    : "text-[#D1D5DB] cursor-not-allowed"
                }`}
                aria-label="Rehacer"
              >
                <Redo2 size={16} strokeWidth={1.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-[12px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
              Rehacer (⌘⇧Z)
            </TooltipContent>
          </Tooltip>
        </div>

      </header>

      <div className="flex-1 relative" onPointerDown={handlePointerDown}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeDragStop={onNodeDragStop}
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
