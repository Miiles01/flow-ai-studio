import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  ConnectionMode,
  useViewport,
  ReactFlowProvider,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Loader2, Check, Cloud, CloudOff, Settings2, EyeOff, Eye, Trash2, Undo2, Redo2, Palette, Square, Type, Baseline, Sparkles, PanelRight, ListChecks, Plus } from "lucide-react";
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

const RAINBOW_COLORS = [
  { name: "Transparente", value: "transparent" },
  { name: "Rojo", value: "#EF4444" },
  { name: "Naranja", value: "#F97316" },
  { name: "Amarillo", value: "#FACC15" },
  { name: "Verde", value: "#22C55E" },
  { name: "Azul", value: "#3B82F6" },
  { name: "Morado", value: "#A855F7" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Blanco", value: "#FFFFFF" },
  { name: "Negro", value: "#1F2937" },
];

const TEXT_COLOR_PALETTE = [
  { name: "Negro", value: "#111827" },
  { name: "Gris", value: "#6B7280" },
  { name: "Azul", value: "#2563EB" },
  { name: "Verde", value: "#059669" },
  { name: "Rojo", value: "#DC2626" },
  { name: "Púrpura", value: "#7C3AED" },
  { name: "Blanco", value: "#FFFFFF" },
];

const IndexContent = () => {
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
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);
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

  const connectingNodeRef = useRef<{
    nodeId: string;
    handleId: string | null;
    handleType: "source" | "target";
  } | null>(null);

  // ── Multi-Selection Transform Calculations ──────────────────
  const selectedNodes = useMemo(() => nodes.filter(n => n.selected), [nodes]);
  const isMultiSelection = selectedNodes.length > 1;

  // Viewport for screen-space coordinate transformations
  const { x: vpX, y: vpY, zoom: vpZoom } = useViewport();

  // Resize Drag State
  const [resizing, setResizing] = useState<string | null>(null);
  const resizeStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    bounds: { x: number; y: number; w: number; h: number };
    nodeStates: Array<{ id: string; x: number; y: number; w: number; h: number; fontSize: number }>;
  } | null>(null);

  // Compute bounding box around all selected nodes in canvas coordinates
  const selectionBounds = useMemo(() => {
    if (selectedNodes.length <= 1) return null;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedNodes.forEach((node) => {
      const x = node.position.x;
      const y = node.position.y;
      const w = (node.style?.width as number) || (node.measured?.width) || 100;
      const h = (node.style?.height as number) || (node.measured?.height) || 100;

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + w > maxX) maxX = x + w;
      if (y + h > maxY) maxY = y + h;
    });

    return {
      x: minX,
      y: minY,
      w: maxX - minX,
      h: maxY - minY,
    };
  }, [selectedNodes]);

  // Handle pointer down on transform handles
  const handleTransformStart = useCallback((e: React.PointerEvent, handle: string) => {
    if (!selectionBounds || selectedNodes.length <= 1) return;
    e.preventDefault();
    e.stopPropagation();

    // Capture initial states
    const nodeStates = selectedNodes.map((n) => ({
      id: n.id,
      x: n.position.x,
      y: n.position.y,
      w: (n.style?.width as number) || (n.measured?.width) || 100,
      h: (n.style?.height as number) || (n.measured?.height) || 100,
      fontSize: n.data?.fontSize || 14,
    }));

    resizeStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      bounds: { ...selectionBounds },
      nodeStates,
    };

    setResizing(handle);
  }, [selectionBounds, selectedNodes]);

  // Pointer Move Listener (window-level)
  useEffect(() => {
    if (!resizing || !resizeStartRef.current || !selectionBounds) return;

    const handlePointerMove = (e: PointerEvent) => {
      const start = resizeStartRef.current;
      if (!start) return;

      // Delta in canvas flow space (scaled by zoom)
      const dx = (e.clientX - start.pointerX) / vpZoom;
      const dy = (e.clientY - start.pointerY) / vpZoom;

      // Compute new bounds
      let nextX = start.bounds.x;
      let nextY = start.bounds.y;
      let nextW = start.bounds.w;
      let nextH = start.bounds.h;

      const handle = resizing;
      const isCorner = ["nw", "ne", "se", "sw"].includes(handle);

      if (isCorner) {
        let scaleX = 1;
        let scaleY = 1;

        if (handle === "se") {
          scaleX = (start.bounds.w + dx) / start.bounds.w;
          scaleY = (start.bounds.h + dy) / start.bounds.h;
          const minScale = 30 / Math.min(start.bounds.w, start.bounds.h);
          const scale = Math.max(minScale, Math.abs(dx) > Math.abs(dy) ? scaleX : scaleY);
          nextW = start.bounds.w * scale;
          nextH = start.bounds.h * scale;
          nextX = start.bounds.x;
          nextY = start.bounds.y;
        } else if (handle === "sw") {
          scaleX = (start.bounds.w - dx) / start.bounds.w;
          scaleY = (start.bounds.h + dy) / start.bounds.h;
          const minScale = 30 / Math.min(start.bounds.w, start.bounds.h);
          const scale = Math.max(minScale, Math.abs(dx) > Math.abs(dy) ? scaleX : scaleY);
          nextW = start.bounds.w * scale;
          nextH = start.bounds.h * scale;
          nextX = start.bounds.x + start.bounds.w - nextW;
          nextY = start.bounds.y;
        } else if (handle === "ne") {
          scaleX = (start.bounds.w + dx) / start.bounds.w;
          scaleY = (start.bounds.h - dy) / start.bounds.h;
          const minScale = 30 / Math.min(start.bounds.w, start.bounds.h);
          const scale = Math.max(minScale, Math.abs(dx) > Math.abs(dy) ? scaleX : scaleY);
          nextW = start.bounds.w * scale;
          nextH = start.bounds.h * scale;
          nextX = start.bounds.x;
          nextY = start.bounds.y + start.bounds.h - nextH;
        } else if (handle === "nw") {
          scaleX = (start.bounds.w - dx) / start.bounds.w;
          scaleY = (start.bounds.h - dy) / start.bounds.h;
          const minScale = 30 / Math.min(start.bounds.w, start.bounds.h);
          const scale = Math.max(minScale, Math.abs(dx) > Math.abs(dy) ? scaleX : scaleY);
          nextW = start.bounds.w * scale;
          nextH = start.bounds.h * scale;
          nextX = start.bounds.x + start.bounds.w - nextW;
          nextY = start.bounds.y + start.bounds.h - nextH;
        }
      } else {
        // Axial (side) resize
        if (handle.includes("e")) {
          nextW = Math.max(30, start.bounds.w + dx);
        }
        if (handle.includes("s")) {
          nextH = Math.max(30, start.bounds.h + dy);
        }
        if (handle.includes("w")) {
          const potentialW = Math.max(30, start.bounds.w - dx);
          nextX = start.bounds.x + (start.bounds.w - potentialW);
          nextW = potentialW;
        }
        if (handle.includes("n")) {
          const potentialH = Math.max(30, start.bounds.h - dy);
          nextY = start.bounds.y + (start.bounds.h - potentialH);
          nextH = potentialH;
        }
      }

      setNodes((nds) =>
        nds.map((node) => {
          const startState = start.nodeStates.find((s) => s.id === node.id);
          if (!startState) return node;

          // Compute initial relative positions in the bounds
          const relX = (startState.x - start.bounds.x) / start.bounds.w;
          const relY = (startState.y - start.bounds.y) / start.bounds.h;
          const relW = startState.w / start.bounds.w;
          const relH = startState.h / start.bounds.h;

          const scaledW = relW * nextW;
          const nodeScale = scaledW / startState.w;
          const nextFontSize = Math.max(6, Math.round(startState.fontSize * nodeScale));

          return {
            ...node,
            position: {
              x: nextX + relX * nextW,
              y: nextY + relY * nextH,
            },
            style: {
              ...node.style,
              width: scaledW,
              height: relH * nextH,
            },
            data: {
              ...node.data,
              fontSize: nextFontSize,
            },
          };
        })
      );
    };

    const handlePointerUp = () => {
      setResizing(null);
      resizeStartRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [resizing, vpZoom, selectionBounds, setNodes]);

  // Group Toolbar Colors Picker helper
  const [groupPicker, setGroupPicker] = useState<"fill" | "border" | "text" | null>(null);

  const applyGroupStyle = useCallback((type: "fill" | "border" | "text", color: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (!node.selected) return node;
        const data = { ...node.data };

        if (type === "fill") {
          if (node.type === "shapeNode") data.fillColor = color;
          else if (node.type === "todoNode") data.backgroundColor = color;
          else if (node.type === "frameNode") data.fillColor = color;
        } else if (type === "border") {
          if (node.type === "shapeNode") data.strokeColor = color;
          else if (node.type === "todoNode") data.accentColor = color;
          else if (node.type === "frameNode") data.strokeColor = color;
        } else if (type === "text") {
          if (node.type === "textNode") data.textColor = color;
          else if (node.type === "todoNode") data.textColor = color;
        }

        return { ...node, data };
      })
    );
    setGroupPicker(null);
    toast.success("Estilo de grupo aplicado");
  }, [setNodes]);

  const handleGroupDelete = useCallback(() => {
    const selectedIds = selectedNodes.map((n) => n.id);
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !selectedIds.includes(e.source) && !selectedIds.includes(e.target)));
    toast.success("Elementos eliminados");
  }, [selectedNodes, setNodes, setEdges]);

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

  const onConnectStart = useCallback(
    (event: any, { nodeId, handleId, handleType }: any) => {
      connectingNodeRef.current = { nodeId, handleId, handleType };
    },
    []
  );

  const onConnectEnd = useCallback(
    (event: any) => {
      if (!connectingNodeRef.current || !reactFlowInstance) return;

      const target = event.target as HTMLElement;
      const isPane = target.classList.contains("react-flow__pane");
      const isInsideInteractive =
        target.closest(".react-flow__node") !== null ||
        target.closest(".react-flow__handle") !== null ||
        target.closest(".react-flow__controls") !== null ||
        target.closest(".react-flow__minimap") !== null ||
        target.closest("button") !== null ||
        target.closest("input") !== null;

      if (isPane || !isInsideInteractive) {
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const position = reactFlowInstance.screenToFlowPosition({
          x: clientX,
          y: clientY,
        });

        const originNodeId = connectingNodeRef.current.nodeId;
        const originNode = nodes.find((n) => n.id === originNodeId);

        if (originNode) {
          if (originNode.type === "frameNode") {
            connectingNodeRef.current = null;
            return;
          }

          let newNodeType = "shapeNode";
          let newNodeData: any = { shape: "square", label: "" };
          let newWidth = 100;
          let newHeight = 100;

          if (originNode.type === "shapeNode") {
            newNodeType = "shapeNode";
            newNodeData = {
              shape: originNode.data?.shape || "square",
              label: "",
              backgroundColor: originNode.data?.backgroundColor || "#FFFFFF",
              borderColor: originNode.data?.borderColor || "#000000",
            };
            newWidth = (originNode.style?.width as number) || 100;
            newHeight = (originNode.style?.height as number) || 100;
          } else {
            newNodeType = "shapeNode";
            newNodeData = {
              shape: "square",
              label: "",
              backgroundColor: "#FFFFFF",
              borderColor: "#1F2937",
            };
          }

          const newNodeId = `node-${Date.now()}`;
          const newNode: Node = {
            id: newNodeId,
            type: newNodeType,
            position: {
              x: position.x - newWidth / 2,
              y: position.y - newHeight / 2,
            },
            style: { width: newWidth, height: newHeight },
            data: newNodeData,
            selected: true,
          };

          const isSource = connectingNodeRef.current.handleType === "source";
          const originHandleId = connectingNodeRef.current.handleId;

          // Dynamically map to the opposite compatible handle on the new shapeNode
          let oppositeHandle = "top";
          if (originHandleId) {
            const lower = originHandleId.toLowerCase();
            if (lower === "top" || lower === "t") oppositeHandle = "bottom";
            else if (lower === "bottom" || lower === "b") oppositeHandle = "top";
            else if (lower === "left" || lower === "l") oppositeHandle = "right";
            else if (lower === "right" || lower === "r") oppositeHandle = "left";
          }

          const edgeSource = isSource ? originNodeId : newNodeId;
          const edgeTarget = isSource ? newNodeId : originNodeId;
          const sourceHandle = isSource ? originHandleId : oppositeHandle;
          const targetHandle = isSource ? oppositeHandle : originHandleId;

          const newEdge: Edge = {
            id: `edge-${Date.now()}`,
            source: edgeSource,
            target: edgeTarget,
            sourceHandle: sourceHandle || undefined,
            targetHandle: targetHandle || undefined,
            animated: true,
          };

          setNodes((nds) => nds.map((n) => ({ ...n, selected: false })).concat(newNode));
          setEdges((eds) => eds.concat(newEdge));

          toast.success(
            originNode.type === "shapeNode"
              ? "Figura clonada y conectada"
              : "Figura conectada creada"
          );
        }
      }

      connectingNodeRef.current = null;
    },
    [reactFlowInstance, nodes, setNodes, setEdges]
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

  // Keep a ref to latest persist so handlers always call the freshest version
  const persistRef = useRef(persist);
  useEffect(() => {
    persistRef.current = persist;
  }, [persist]);

  const flushSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    persistRef.current();
  }, []);

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
    }, 800);
  }, [nodes, edges, name, loading, persist]);

  // Flush pending save on unload, tab hide, or unmount
  useEffect(() => {
    const onBeforeUnload = () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        persistRef.current();
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && saveTimerRef.current) {
        flushSave();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibility);
      // Flush any pending changes when navigating away within the SPA
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        persistRef.current();
      }
    };
  }, [flushSave]);


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

        {/* Right: history controls + task panel toggle */}
        {!hideTools && (
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

            {/* Divider */}
            <div className="w-[1px] h-4 bg-[#E5E7EB] mx-0.5" />

            {/* Task Panel Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setTaskPanelOpen((v) => !v)}
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                    taskPanelOpen
                      ? "bg-[#F3F4F6] text-black"
                      : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                  }`}
                  aria-label="Panel de tareas"
                >
                  <PanelRight size={16} strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8} className="text-[12px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
                Lista de tareas
              </TooltipContent>
            </Tooltip>
          </div>
        )}

      </header>

      <div className="flex-1 relative" onPointerDown={handlePointerDown}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
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
          className={`bg-white ${interactionMode === "pan" ? "pan-mode" : "edit-mode"} ${isMultiSelection ? "multi-select-active" : ""}`}
          style={{ cursor: activeDrawShape ? "crosshair" : "inherit" }}
        >
          <Background variant={BackgroundVariant.Dots} gap={32} size={1} color="#E5E7EB" />
          {!hideTools && <Controls position="bottom-left" showInteractive={false} />}
        </ReactFlow>

        {/* Unified Multi-Selection Bounding Box & Transform Handles */}
        {selectionBounds && (
          <>
            <div
              style={{
                position: "absolute",
                left: selectionBounds.x * vpZoom + vpX,
                top: selectionBounds.y * vpZoom + vpY,
                width: selectionBounds.w * vpZoom,
                height: selectionBounds.h * vpZoom,
                border: "1.5px solid #4059F1",
                pointerEvents: "none",
                zIndex: 9000,
                boxShadow: "0 0 0 1px rgba(64, 89, 241, 0.15)",
              }}
            >
              {/* Handles wrapper to get hover & pointer events */}
              <div className="absolute inset-0 pointer-events-auto">
                {/* Corner Handles */}
                {/* Top Left (nw) */}
                <div
                  onPointerDown={(e) => handleTransformStart(e, "nw")}
                  style={{
                    position: "absolute",
                    top: -5,
                    left: -5,
                    width: 10,
                    height: 10,
                    backgroundColor: "#FFF",
                    border: "1.5px solid #4059F1",
                    borderRadius: "2px",
                    cursor: "nwse-resize",
                  }}
                />
                {/* Top Right (ne) */}
                <div
                  onPointerDown={(e) => handleTransformStart(e, "ne")}
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    width: 10,
                    height: 10,
                    backgroundColor: "#FFF",
                    border: "1.5px solid #4059F1",
                    borderRadius: "2px",
                    cursor: "nesw-resize",
                  }}
                />
                {/* Bottom Right (se) */}
                <div
                  onPointerDown={(e) => handleTransformStart(e, "se")}
                  style={{
                    position: "absolute",
                    bottom: -5,
                    right: -5,
                    width: 10,
                    height: 10,
                    backgroundColor: "#FFF",
                    border: "1.5px solid #4059F1",
                    borderRadius: "2px",
                    cursor: "nwse-resize",
                  }}
                />
                {/* Bottom Left (sw) */}
                <div
                  onPointerDown={(e) => handleTransformStart(e, "sw")}
                  style={{
                    position: "absolute",
                    bottom: -5,
                    left: -5,
                    width: 10,
                    height: 10,
                    backgroundColor: "#FFF",
                    border: "1.5px solid #4059F1",
                    borderRadius: "2px",
                    cursor: "nesw-resize",
                  }}
                />

                {/* Side Handles */}
                {/* Top (n) */}
                <div
                  onPointerDown={(e) => handleTransformStart(e, "n")}
                  style={{
                    position: "absolute",
                    top: -4,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 8,
                    height: 8,
                    backgroundColor: "#FFF",
                    border: "1.5px solid #4059F1",
                    borderRadius: "2px",
                    cursor: "ns-resize",
                  }}
                />
                {/* Right (e) */}
                <div
                  onPointerDown={(e) => handleTransformStart(e, "e")}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: -4,
                    transform: "translateY(-50%)",
                    width: 8,
                    height: 8,
                    backgroundColor: "#FFF",
                    border: "1.5px solid #4059F1",
                    borderRadius: "2px",
                    cursor: "ew-resize",
                  }}
                />
                {/* Bottom (s) */}
                <div
                  onPointerDown={(e) => handleTransformStart(e, "s")}
                  style={{
                    position: "absolute",
                    bottom: -4,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 8,
                    height: 8,
                    backgroundColor: "#FFF",
                    border: "1.5px solid #4059F1",
                    borderRadius: "2px",
                    cursor: "ns-resize",
                  }}
                />
                {/* Left (w) */}
                <div
                  onPointerDown={(e) => handleTransformStart(e, "w")}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: -4,
                    transform: "translateY(-50%)",
                    width: 8,
                    height: 8,
                    backgroundColor: "#FFF",
                    border: "1.5px solid #4059F1",
                    borderRadius: "2px",
                    cursor: "ew-resize",
                  }}
                />
              </div>
            </div>

            {/* Floating Group Selection Toolbar */}
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: 10, x: "-50%" }}
                style={{
                  position: "absolute",
                  left: selectionBounds.x * vpZoom + vpX + (selectionBounds.w * vpZoom) / 2,
                  top: (() => {
                    const topPos = selectionBounds.y * vpZoom + vpY;
                    return topPos > 96
                      ? topPos - 56
                      : Math.min(topPos + selectionBounds.h * vpZoom + 16, window.innerHeight - 80);
                  })(),
                  transform: "translateX(-50%)",
                  zIndex: 9999,
                }}
                className="flex items-center gap-1 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-2 py-1.5 border border-gray-100/50 pointer-events-auto"
              >
                <span className="text-[11px] font-medium text-gray-400 px-1.5 border-r border-gray-100 mr-1 select-none">
                  {selectedNodes.length} seleccionados
                </span>

                {/* Group Style Fill */}
                <div className="relative">
                  <button
                    onClick={() => setGroupPicker(groupPicker === "fill" ? null : "fill")}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black transition-colors relative"
                    title="Color de Relleno del Grupo"
                  >
                    <Palette size={13} />
                  </button>
                  {groupPicker === "fill" && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-2 grid grid-cols-5 gap-1 z-[10000] w-[140px]">
                      {RAINBOW_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => applyGroupStyle("fill", c.value)}
                          className="w-5 h-5 rounded-full border border-gray-200 transition-transform hover:scale-110 flex items-center justify-center overflow-hidden relative cursor-pointer"
                          style={{ backgroundColor: c.value === "transparent" ? "white" : c.value }}
                          title={c.name}
                        >
                          {c.value === "transparent" && (
                            <div className="absolute w-full h-[1.5px] bg-red-500 rotate-45" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Group Style Border */}
                <div className="relative">
                  <button
                    onClick={() => setGroupPicker(groupPicker === "border" ? null : "border")}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black transition-colors relative"
                    title="Color de Borde del Grupo"
                  >
                    <Square size={12} />
                  </button>
                  {groupPicker === "border" && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-2 grid grid-cols-5 gap-1 z-[10000] w-[140px]">
                      {RAINBOW_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => applyGroupStyle("border", c.value)}
                          className="w-5 h-5 rounded-full border border-gray-200 transition-transform hover:scale-110 flex items-center justify-center overflow-hidden relative cursor-pointer"
                          style={{ backgroundColor: c.value === "transparent" ? "white" : c.value }}
                          title={c.name}
                        >
                          {c.value === "transparent" && (
                            <div className="absolute w-full h-[1.5px] bg-red-500 rotate-45" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Group Style Text */}
                <div className="relative">
                  <button
                    onClick={() => setGroupPicker(groupPicker === "text" ? null : "text")}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black transition-colors relative"
                    title="Color del Texto del Grupo"
                  >
                    <Baseline size={13} />
                  </button>
                  {groupPicker === "text" && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-2 grid grid-cols-4 gap-1 z-[10000] w-[120px]">
                      {TEXT_COLOR_PALETTE.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => applyGroupStyle("text", c.value)}
                          className="w-5 h-5 rounded-full border border-gray-200 transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-[1px] h-4 bg-[#E5E7EB] mx-1" />

                {/* Group Delete */}
                <button
                  onClick={handleGroupDelete}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  title="Eliminar Selección"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            </AnimatePresence>
          </>
        )}

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

      {/* ─── Task List Side Panel ─── */}
      <AnimatePresence>
        {taskPanelOpen && (
          <motion.aside
            key="task-panel"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="absolute top-0 right-0 h-full w-72 lg:w-96 bg-white z-50 flex flex-col"
            style={{ borderLeft: "1px solid #F3F4F6" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F3F4F6]">
              <div className="flex items-center gap-2">
                <ListChecks size={16} strokeWidth={1.5} className="text-[#6B7280]" />
                <span className="text-[13px] font-medium text-black">Lista de tareas</span>
              </div>
              <button
                onClick={() => setTaskPanelOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-black transition-colors"
              >
                <PanelRight size={14} strokeWidth={1.5} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {(() => {
                const todoNodes = nodes.filter((n) => n.type === "todoNode");
                if (todoNodes.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center pt-16">
                      <div className="w-10 h-10 rounded-full bg-[#F9FAFB] flex items-center justify-center">
                        <ListChecks size={18} strokeWidth={1.5} className="text-[#D1D5DB]" />
                      </div>
                      <p className="text-[12px] text-[#9CA3AF] font-light leading-relaxed">
                        No hay listas de tareas<br />en el tablero todavía.
                      </p>
                    </div>
                  );
                }
                return todoNodes.map((node) => {
                  const d = node.data as any;
                  const tasks: { id: string; text: string; completed: boolean }[] = d.tasks ?? [];
                  const title: string = d.title || "Lista de Tareas";
                  const subtitle: string = d.subtitle || "";
                  const done = tasks.filter((t) => t.completed).length;

                  const toggleTask = (taskId: string) => {
                    setNodes((nds) =>
                      nds.map((n) => {
                        if (n.id !== node.id) return n;
                        const updated = ((n.data as any).tasks ?? []).map((t: any) =>
                          t.id === taskId ? { ...t, completed: !t.completed } : t
                        );
                        return { ...n, data: { ...n.data, tasks: updated } };
                      })
                    );
                  };

                  const addTask = () => {
                    const newTask = { id: `task-${Date.now()}`, text: "", completed: false };
                    setNodes((nds) =>
                      nds.map((n) => {
                        if (n.id !== node.id) return n;
                        return { ...n, data: { ...n.data, tasks: [...((n.data as any).tasks ?? []), newTask] } };
                      })
                    );
                  };

                  const updateTaskText = (taskId: string, text: string) => {
                    setNodes((nds) =>
                      nds.map((n) => {
                        if (n.id !== node.id) return n;
                        const updated = ((n.data as any).tasks ?? []).map((t: any) =>
                          t.id === taskId ? { ...t, text } : t
                        );
                        return { ...n, data: { ...n.data, tasks: updated } };
                      })
                    );
                  };

                  return (
                    <div
                      key={node.id}
                      className="rounded-2xl border border-[#F3F4F6] bg-[#FAFAFA] p-4 space-y-3"
                    >
                      {/* Card header */}
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-semibold text-black truncate max-w-[180px]">{title}</span>
                          <span className="text-[11px] text-[#9CA3AF] shrink-0 ml-2 tabular-nums">{done}/{tasks.length}</span>
                        </div>
                        {subtitle && (
                          <p className="text-[11px] text-[#9CA3AF] font-light leading-snug">{subtitle}</p>
                        )}
                      </div>

                      {/* Progress bar */}
                      {tasks.length > 0 && (
                        <div className="h-[3px] rounded-full bg-[#EBEBEB] overflow-hidden">
                          <motion.div
                            className="h-full bg-[#111827] rounded-full"
                            animate={{ width: `${(done / tasks.length) * 100}%` }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                          />
                        </div>
                      )}

                      {/* Tasks */}
                      <div className="space-y-1">
                        {tasks.length === 0 && (
                          <p className="text-[11px] text-[#D1D5DB] font-light py-1">Sin tareas aún.</p>
                        )}
                        {tasks.map((task) => (
                          <div key={task.id} className="flex items-start gap-2.5 py-1">
                            {/* Interactive checkbox */}
                            <button
                              onClick={() => toggleTask(task.id)}
                              className="w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 mt-px transition-all"
                              style={{
                                borderColor: task.completed ? "#111827" : "#D1D5DB",
                                backgroundColor: task.completed ? "#111827" : "transparent",
                              }}
                            >
                              {task.completed && <Check size={8} className="text-white" strokeWidth={3} />}
                            </button>
                            {/* Editable task text */}
                            <input
                              value={task.text}
                              onChange={(e) => updateTaskText(task.id, e.target.value)}
                              placeholder="Nueva tarea..."
                              className="flex-1 bg-transparent border-none outline-none text-[12px] font-light leading-snug placeholder-[#D1D5DB] min-w-0"
                              style={{
                                color: task.completed ? "#9CA3AF" : "#374151",
                                textDecoration: task.completed ? "line-through" : "none",
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Add task */}
                      <button
                        onClick={addTask}
                        className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF] hover:text-black transition-colors pt-0.5"
                      >
                        <Plus size={12} strokeWidth={2} />
                        <span>Nueva tarea</span>
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

const Index = () => {
  return (
    <ReactFlowProvider>
      <IndexContent />
    </ReactFlowProvider>
  );
};

export default Index;
