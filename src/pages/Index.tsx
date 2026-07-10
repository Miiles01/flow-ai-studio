import { useCallback, useState, useRef, useEffect, useMemo, forwardRef } from "react";
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
  useReactFlow,
  useUpdateNodeInternals,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Loader2, Check, Cloud, CloudOff, Settings2, EyeOff, Eye, Trash2, Undo2, Redo2, Palette, Square, Type, Baseline, Sparkles, PanelRight, ListChecks, Plus, Share2, Sun, Moon, EyeIcon, Copy, Download, ArrowUp, ArrowDown } from "lucide-react";
import { buildTasksInstructions, downloadTextFile, type TodoListLike } from "@/lib/todoInstructions";
import ShareDialog from "@/components/ShareDialog";
import PresenceStack from "@/components/PresenceStack";
import { useFlowRealtime, type PresenceUser } from "@/hooks/useFlowRealtime";
import { usePlan } from "@/hooks/usePlan";
import { useHistory } from "@/hooks/useHistory";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, ThemeContext } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";

import FlowNode from "@/components/nodes/FlowNode";
import ShapeNode from "@/components/nodes/ShapeNode";
import TextNode from "@/components/nodes/TextNode";
import TodoNode from "@/components/nodes/TodoNode";
import ImageNode from "@/components/nodes/ImageNode";
import FrameNode from "@/components/nodes/FrameNode";
import SkeletonNode from "@/components/nodes/SkeletonNode";
import Toolbar from "@/components/Toolbar";
import AIPromptBar from "@/components/AIPromptBar";
import ClarifyPanel from "@/components/ClarifyPanel";
import PlanPanel from "@/components/PlanPanel";
import EditableEdge from "@/components/EditableEdge";
import EmbedNode from "@/components/nodes/EmbedNode";

import { generateFlowFromPrompt, type ExtendContext } from "@/lib/generateFlow";
import { clarifyPrompt, buildEnrichedPrompt, type ClarifyResult } from "@/lib/clarifyFlow";
import { planFlow, buildPlanContext, type PlanResult } from "@/lib/planFlow";
import { FlowExtendContext, type ExtendSide, type FlowExtendTarget } from "@/contexts/FlowExtendContext";

const SHAPE_TYPES = ["square", "circle", "diamond", "hexagon", "star", "document", "cloud", "database", "cylinder", "callout", "speech", "heart"];
const nodeTypes = { flowNode: FlowNode, shapeNode: ShapeNode, textNode: TextNode, todoNode: TodoNode, imageNode: ImageNode, embedNode: EmbedNode, frameNode: FrameNode, skeletonNode: SkeletonNode };
const edgeTypes = {
  default: EditableEdge,
};

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

type Rect = { x: number; y: number; w: number; h: number };

const DEFAULT_NODE_W = 160;
const DEFAULT_NODE_H = 80;

// Bounding rect of a node taking style/measured size into account.
const getNodeRect = (n: Node): Rect => {
  const w = (n.style?.width as number) || (n.width as number) || DEFAULT_NODE_W;
  const h = (n.style?.height as number) || (n.height as number) || DEFAULT_NODE_H;
  return { x: n.position.x, y: n.position.y, w, h };
};

const rectsOverlap = (a: Rect, b: Rect, pad = 0): boolean =>
  a.x < b.x + b.w + pad &&
  a.x + a.w + pad > b.x &&
  a.y < b.y + b.h + pad &&
  a.y + a.h + pad > b.y;

// Find a free top-left position for a group of size (w,h), starting at `start`.
// Scans outward (right, then down rows) until it stops colliding with `obstacles`.
const findFreePosition = (
  start: { x: number; y: number },
  w: number,
  h: number,
  obstacles: Rect[],
  pad = 80
): { x: number; y: number } => {
  if (obstacles.length === 0) return start;
  const stepX = w + pad;
  const stepY = h + pad;
  const maxCols = 12;
  const maxRows = 12;
  for (let row = 0; row < maxRows; row++) {
    for (let col = 0; col < maxCols; col++) {
      const candidate: Rect = { x: start.x + col * stepX, y: start.y + row * stepY, w, h };
      if (!obstacles.some((o) => rectsOverlap(candidate, o, pad))) {
        return { x: candidate.x, y: candidate.y };
      }
    }
  }
  // Fallback: drop it below everything.
  const maxBottom = Math.max(...obstacles.map((o) => o.y + o.h));
  return { x: start.x, y: maxBottom + pad };
};

// Remap node ids to be globally unique, rewriting edge endpoints to match.
// Pass `existingIds` to also avoid colliding with nodes already on the canvas.
const uniquifyFlow = (
  newNodes: Node[],
  newEdges: Edge[],
  existingIds?: Set<string>
): { nodes: Node[]; edges: Edge[] } => {
  const idMap = new Map<string, string>();
  const used = new Set<string>(existingIds ? Array.from(existingIds) : []);
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  const nodes = newNodes.map((n, i) => {
    const oldId = String(n.id);
    let newId = oldId;
    if (used.has(newId)) newId = `${oldId}-${suffix}-${i}`;
    used.add(newId);
    idMap.set(oldId, newId);
    return { ...n, id: newId };
  });

  // Fix parentId references that point to remapped nodes.
  const fixedNodes = nodes.map((n) =>
    n.parentId && idMap.has(n.parentId) ? { ...n, parentId: idMap.get(n.parentId) } : n
  );

  const edges = newEdges.map((e) => ({
    ...e,
    source: idMap.get(String(e.source)) ?? e.source,
    target: idMap.get(String(e.target)) ?? e.target,
  }));

  return { nodes: fixedNodes, edges };
};

// Remove nodes/edges with duplicate ids that may have been persisted previously.
const dedupeFlow = (
  loadedNodes: Node[],
  loadedEdges: Edge[]
): { nodes: Node[]; edges: Edge[] } => {
  const seen = new Set<string>();
  const nodes = loadedNodes.filter((n) => {
    const key = String(n.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const seenEdges = new Set<string>();
  const edges = loadedEdges.filter((e) => {
    const key = String(e.id ?? `${e.source}-${e.target}`);
    if (seenEdges.has(key)) return false;
    seenEdges.add(key);
    return true;
  });
  return { nodes, edges };
};

const isWhiteColor = (color: string | undefined): boolean => {
  if (!color) return false;
  const cleaned = color.trim().toLowerCase();
  return cleaned === "#ffffff" || cleaned === "white" || cleaned === "#fff" || cleaned === "#fafafa" || cleaned === "#f3f4f6";
};

const isBlackColor = (color: string | undefined): boolean => {
  if (!color) return false;
  const cleaned = color.trim().toLowerCase();
  return cleaned === "#000000" || cleaned === "black" || cleaned === "#000" || cleaned === "#111827" || cleaned === "#1f2937" || cleaned === "#1c1c1e";
};

const isColorDark = (colorHex: string): boolean => {
  if (!colorHex || colorHex === "transparent") return false;
  const hex = colorHex.replace("#", "").trim();
  if (hex.toLowerCase() === "white") return false;
  if (hex.toLowerCase() === "black") return true;
  
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  }
  return false;
};

interface AutoResizingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
}

const AutoResizingTextarea = forwardRef<HTMLTextAreaElement, AutoResizingTextareaProps>(
  ({ value, onChange, className, style, rows = 1, ...props }, ref) => {
    const localRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref || localRef) as React.MutableRefObject<HTMLTextAreaElement | null>;

    const adjustHeight = () => {
      const el = textareaRef.current;
      if (el) {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }
    };

    useEffect(() => {
      adjustHeight();
    }, [value]);

    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange?.(e);
          adjustHeight();
        }}
        className={`${className} resize-none overflow-hidden`}
        rows={rows}
        style={style}
        {...props}
      />
    );
  }
);
AutoResizingTextarea.displayName = "AutoResizingTextarea";

const IndexContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { setCenter, getNodes } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const isMobile = useIsMobile();
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setShowMobileWarning(true);
      const timer = setTimeout(() => setShowMobileWarning(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  const [nodes, setNodes, onNodesChangeRaw] = useNodesState([]);
  const onNodesChange = useCallback(
    (changes: any[]) => {
      onNodesChangeRaw(changes);
      
      // Force-update internal coordinates for modified nodes and their children
      changes.forEach((change) => {
        if (change.type === "position" || change.type === "dimensions") {
          updateNodeInternals(change.id);
          
          // Update any child nodes
          const currentNodes = getNodes();
          currentNodes.forEach((n) => {
            if (n.parentId === change.id) {
              updateNodeInternals(n.id);
            }
          });
        }
      });
    },
    [onNodesChangeRaw, updateNodeInternals, getNodes]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClarifying, setIsClarifying] = useState(false);
  const [clarifyResult, setClarifyResult] = useState<ClarifyResult | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);
  const [planPrompt, setPlanPrompt] = useState("");
  const [extendTarget, setExtendTarget] = useState<FlowExtendTarget | null>(null);
  const [name, setName] = useState("Tablero sin título");
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "dirty" | "saving" | "saved" | "error">("idle");
  const [interactionMode, setInteractionMode] = useState<"edit" | "pan">("edit");
  const [hideTools, setHideTools] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { isPro } = usePlan();
  const [panelWidth, setPanelWidth] = useState(288);
  const panelMinWidth = 288;
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const isDraggingPanel = useRef(false);
  const [panelCardPicker, setPanelCardPicker] = useState<{ nodeId: string; type: "bg" | "text" } | null>(null);
  const [panelCardHover, setPanelCardHover] = useState<string | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [downloadedAll, setDownloadedAll] = useState(false);

  const copyTextToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };
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

  // Compute bounding box around all selected nodes in canvas coordinates (absolute space)
  const selectionBounds = useMemo(() => {
    if (selectedNodes.length <= 1) return null;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedNodes.forEach((node) => {
      // Resolve absolute coordinates by accumulating parent positions
      let absX = node.position.x;
      let absY = node.position.y;
      let pId = node.parentId;
      while (pId) {
        const parent = nodes.find((n) => n.id === pId);
        if (parent) {
          absX += parent.position.x;
          absY += parent.position.y;
          pId = parent.parentId;
        } else {
          break;
        }
      }

      const w = (node.style?.width as number) || (node.measured?.width) || 100;
      const h = (node.style?.height as number) || (node.measured?.height) || 100;

      if (absX < minX) minX = absX;
      if (absY < minY) minY = absY;
      if (absX + w > maxX) maxX = absX + w;
      if (absY + h > maxY) maxY = absY + h;
    });

    return {
      x: minX,
      y: minY,
      w: maxX - minX,
      h: maxY - minY,
    };
  }, [selectedNodes, nodes]);

  // Handle pointer down on transform handles
  const handleTransformStart = useCallback((e: React.PointerEvent, handle: string) => {
    if (!selectionBounds || selectedNodes.length <= 1) return;
    e.preventDefault();
    e.stopPropagation();

    // Capture initial absolute states
    const nodeStates = selectedNodes.map((n) => {
      let absX = n.position.x;
      let absY = n.position.y;
      let pId = n.parentId;
      while (pId) {
        const parent = nodes.find((p) => p.id === pId);
        if (parent) {
          absX += parent.position.x;
          absY += parent.position.y;
          pId = parent.parentId;
        } else {
          break;
        }
      }
      return {
        id: n.id,
        x: absX,
        y: absY,
        w: (n.style?.width as number) || (n.measured?.width) || 100,
        h: (n.style?.height as number) || (n.measured?.height) || 100,
        fontSize: n.data?.fontSize || 14,
      };
    });

    resizeStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      bounds: { ...selectionBounds },
      nodeStates,
    };

    setResizing(handle);
  }, [selectionBounds, selectedNodes, nodes]);

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

      setNodes((nds) => {
        // Pre-calculate absolute positions for all nodes in the next frame
        const nextAbsolutePositions: Record<string, { x: number; y: number }> = {};

        nds.forEach((n) => {
          const startState = start.nodeStates.find((s) => s.id === n.id);
          if (startState) {
            // Selected node gets scaled inside the new bounds
            const relX = (startState.x - start.bounds.x) / start.bounds.w;
            const relY = (startState.y - start.bounds.y) / start.bounds.h;
            nextAbsolutePositions[n.id] = {
              x: nextX + relX * nextW,
              y: nextY + relY * nextH,
            };
          } else {
            // Unselected node position is stationary, resolve its absolute position
            let absX = n.position.x;
            let absY = n.position.y;
            let pId = n.parentId;
            while (pId) {
              const parent = nds.find((p) => p.id === pId);
              if (parent) {
                absX += parent.position.x;
                absY += parent.position.y;
                pId = parent.parentId;
              } else {
                break;
              }
            }
            nextAbsolutePositions[n.id] = { x: absX, y: absY };
          }
        });

        return nds.map((node) => {
          const startState = start.nodeStates.find((s) => s.id === node.id);
          if (!startState) return node;

          const relW = startState.w / start.bounds.w;
          const relH = startState.h / start.bounds.h;

          const scaledW = relW * nextW;
          const nodeScale = scaledW / startState.w;
          const nextFontSize = Math.max(6, Math.round(startState.fontSize * nodeScale));

          // Convert computed absolute position back to relative if it has a parent
          const myAbs = nextAbsolutePositions[node.id];
          let relativeX = myAbs.x;
          let relativeY = myAbs.y;

          if (node.parentId) {
            const parentAbs = nextAbsolutePositions[node.parentId];
            if (parentAbs) {
              relativeX = myAbs.x - parentAbs.x;
              relativeY = myAbs.y - parentAbs.y;
            }
          }

          return {
            ...node,
            position: {
              x: relativeX,
              y: relativeY,
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
        });
      });
    };

    const handlePointerUp = () => {
      setResizing(null);
      resizeStartRef.current = null;

      // Defer to ensure React has finished rendering/updating the DOM layout for the resized nodes
      setTimeout(() => {
        const currentNodes = getNodes();
        const activeSelectedNodes = currentNodes.filter((n) => n.selected);
        activeSelectedNodes.forEach((node) => {
          updateNodeInternals(node.id);
          currentNodes.forEach((n) => {
            if (n.parentId === node.id) {
              updateNodeInternals(n.id);
            }
          });
        });
      }, 0);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [resizing, vpZoom, selectionBounds, setNodes, updateNodeInternals, getNodes]);

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

  // Guest (anonymous public) access via ?guest_token=
  const guestToken = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("guest_token")
    : null;
  const isGuest = !user && !!guestToken;

  // Ownership state: owner | collaborator | guest
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [collabRole, setCollabRole] = useState<"editor" | "viewer" | null>(null);
  const [publicRole, setPublicRole] = useState<"editor" | "viewer">("editor");
  const isOwner = !!user && !!ownerId && ownerId === user.id;
  const canEdit = isOwner
    || (!!user && collabRole === "editor")
    || (isGuest && publicRole === "editor");
  const isApplyingRemoteRef = useRef(false);
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [identityProfile, setIdentityProfile] = useState<{ display_name: string; avatar_url: string | null } | null>(null);

  // Load flow by id
  useEffect(() => {
    const load = async () => {
      if (!id || id === "new") {
        setLoading(false);
        return;
      }

      // Anonymous guest path
      if (!user && guestToken) {
        const { data, error } = await supabase.rpc("get_public_flow", { p_token: guestToken });
        const f = (data as any[])?.[0];
        if (error || !f) {
          toast.error("Tablero no disponible");
          navigate("/");
          return;
        }
        setName(f.name || "Tablero");
        {
          const { nodes: dn, edges: de } = dedupeFlow((f.nodes as Node[]) || [], (f.edges as Edge[]) || []);
          setNodes(dn);
          setEdges(de);
        }
        setOwnerId(f.user_id);
        setPublicRole((f.public_role as "editor" | "viewer") || "viewer");
        lastSavedRef.current = JSON.stringify({ name: f.name, nodes: f.nodes, edges: f.edges });
        skipNextDirtyRef.current = true;
        setSaveState("saved");
        setLoading(false);
        return;
      }

      if (!user) {
        navigate("/login");
        return;
      }

      // Authenticated path — RLS allows owners + collaborators
      const { data, error } = await supabase
        .from("flows")
        .select("name, nodes, edges, user_id")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        toast.error("Tablero no encontrado");
        navigate("/boards");
        return;
      }
      setName(data.name || "Tablero");
      const rawNodes = ((data.nodes as unknown) as Node[]) || [];
      const rawEdges = ((data.edges as unknown) as Edge[]) || [];
      const { nodes: loadedNodes, edges: loadedEdges } = dedupeFlow(rawNodes, rawEdges);
      setNodes(loadedNodes);
      setEdges(loadedEdges);
      setOwnerId((data as any).user_id);


      // If not owner, look up collaborator role
      if ((data as any).user_id !== user.id) {
        const { data: collab } = await supabase
          .from("flow_collaborators")
          .select("role")
          .eq("flow_id", id)
          .eq("user_id", user.id)
          .maybeSingle();
        setCollabRole(((collab as any)?.role as "editor" | "viewer") ?? "viewer");
      } else {
        setCollabRole(null);
      }

      lastSavedRef.current = JSON.stringify({ name: data.name, nodes: loadedNodes, edges: loadedEdges });
      skipNextDirtyRef.current = true;
      setSaveState("saved");
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  // Load identity (for presence)
  useEffect(() => {
    if (!user) {
      setIdentityProfile({ display_name: "Invitado", avatar_url: null });
      return;
    }
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIdentityProfile({
          display_name: (data as any)?.display_name || user.email?.split("@")[0] || "Usuario",
          avatar_url: (data as any)?.avatar_url ?? null,
        });
      });
  }, [user]);

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
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
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
              fillColor: originNode.data?.fillColor,
              strokeColor: originNode.data?.strokeColor,
            };
            newWidth = (originNode.style?.width as number) || 100;
            newHeight = (originNode.style?.height as number) || 100;
          } else {
            newNodeType = "shapeNode";
            newNodeData = {
              shape: "square",
              label: "",
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

  // Moving a node must NEVER remove its connections — keep edges intact while dragging.
  const onNodeDragStart = useCallback(
    (_event: any, _node: Node) => {
      // intentionally left empty: dragging should not disconnect nodes
    },
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

  const runGenerate = useCallback(
    async (prompt: string) => {
      setIsGenerating(true);
      const skeletonId = `ai-skeleton-${Date.now()}`;

      // Posición inicial (centro de la pantalla)
      const centerPos = reactFlowInstance
        ? reactFlowInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
        : { x: 400, y: 200 };

      const skeletonNode: Node = {
        id: skeletonId,
        type: "skeletonNode",
        position: { x: centerPos.x - 140, y: centerPos.y - 80 },
        data: {},
      };

      setNodes((prev) => [...prev, skeletonNode]);

      try {
        const raw = await generateFlowFromPrompt(prompt);
        const existingIds = new Set(nodes.map((n) => String(n.id)));
        const { nodes: newNodes, edges: newEdges } = uniquifyFlow(raw.nodes, raw.edges, existingIds);

        const generatedIds: string[] = [];

        // ── Step 1: calculate real bounding box and grow skeleton to match ──
        if (newNodes.length > 0) {
          const NODE_W = 160; // typical node width used by the generator
          const NODE_H = 80;  // typical node height

          const minX = Math.min(...newNodes.map((n) => n.position.x));
          const minY = Math.min(...newNodes.map((n) => n.position.y));
          const maxX = Math.max(...newNodes.map((n) => n.position.x + ((n.style?.width as number) || NODE_W)));
          const maxY = Math.max(...newNodes.map((n) => n.position.y + ((n.style?.height as number) || NODE_H)));

          const bboxW = Math.max(400, maxX - minX + 80);  // +80 padding
          const bboxH = Math.max(200, maxY - minY + 80);

          // Inject dimensions into skeleton so it animates to exact flow size
          setNodes((prev) =>
            prev.map((n) =>
              n.id === skeletonId
                ? { ...n, data: { ...n.data, targetWidth: bboxW, targetHeight: bboxH } }
                : n
            )
          );

          // Wait for the skeleton spring animation to reach its target
          await new Promise((res) => setTimeout(res, 380));
        }

        // ── Step 2: replace skeleton with real nodes ─────────────────────────
        setNodes((prev) => {
          const skeleton = prev.find((n) => n.id === skeletonId);
          const filteredNodes = prev.filter((n) => n.id !== skeletonId);

          if (newNodes.length > 0) {
            const minX = Math.min(...newNodes.map((n) => n.position.x));
            const minY = Math.min(...newNodes.map((n) => n.position.y));
            const maxX = Math.max(...newNodes.map((n) => n.position.x + ((n.style?.width as number) || DEFAULT_NODE_W)));
            const maxY = Math.max(...newNodes.map((n) => n.position.y + ((n.style?.height as number) || DEFAULT_NODE_H)));
            const groupW = maxX - minX;
            const groupH = maxY - minY;

            // Independent flow: find a free area so it never overlaps existing flows.
            const desired = {
              x: skeleton ? skeleton.position.x : centerPos.x - 140,
              y: skeleton ? skeleton.position.y : centerPos.y - 80,
            };
            const obstacles = filteredNodes.map(getNodeRect);
            const free = findFreePosition(desired, groupW, groupH, obstacles);

            const offsetNodes = newNodes.map((n) => ({
              ...n,
              position: {
                x: free.x + (n.position.x - minX),
                y: free.y + (n.position.y - minY),
              },
            }));
            offsetNodes.forEach((n) => generatedIds.push(String(n.id)));
            return [...filteredNodes, ...offsetNodes];
          }

          return filteredNodes;
        });


        setEdges((prev) => [...prev, ...newEdges]);

        // Fit view to newly generated nodes
        if (generatedIds.length > 0 && reactFlowInstance) {
          setTimeout(() => {
            reactFlowInstance.fitView({
              nodes: generatedIds.map((id) => ({ id })),
              padding: 0.25,
              duration: 600,
            });
          }, 100);
        }

        toast.success(`Diagrama generado con ${newNodes.length} nodos`);
      } catch (err) {
        setNodes((prev) => prev.filter((n) => n.id !== skeletonId));
        const message = err instanceof Error ? err.message : "Error desconocido";
        toast.error(message);
      } finally {
        setIsGenerating(false);
      }
    },
    [nodes, setNodes, setEdges, reactFlowInstance]
  );

  // Resumen legible del contenido de un nodo, para que la IA entienda de dónde parte.
  const summarizeNode = useCallback((node: Node): string => {
    const d = (node.data || {}) as Record<string, any>;
    const clean = (s: any) => String(s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    switch (node.type) {
      case "shapeNode":
        return `Forma (${d.shape || "square"}) con el texto: "${clean(d.label)}"`;
      case "textNode":
        return `Bloque de texto: "${clean(d.html)}"`;
      case "todoNode": {
        const tasks = Array.isArray(d.tasks) ? d.tasks.map((t: any) => `- ${clean(t.text)}`).join("\n") : "";
        return `Lista de tareas "${clean(d.title)}"${d.subtitle ? ` (${clean(d.subtitle)})` : ""}:\n${tasks}`;
      }
      case "imageNode":
        return `Imagen${d.url ? ` (${d.url})` : ""}`;
      case "embedNode":
        return `Sitio web embebido: ${d.url || ""}`;
      case "frameNode":
        return `Sección titulada: "${clean(d.label) || "Sección"}"`;
      default:
        return clean(d.label || d.title || d.html) || "Elemento del flujo";
    }
  }, []);

  // Amplía el flujo a partir de un elemento existente, en la dirección elegida.
  const runExtendGenerate = useCallback(
    async (prompt: string, target: FlowExtendTarget) => {
      const sourceNode = nodes.find((n) => n.id === target.nodeId);
      if (!sourceNode) {
        toast.error("No se encontró el elemento de origen");
        return;
      }

      setIsGenerating(true);
      const skeletonId = `ai-skeleton-${Date.now()}`;

      const srcW = (sourceNode.style?.width as number) || (sourceNode.width as number) || 160;
      const srcH = (sourceNode.style?.height as number) || (sourceNode.height as number) || 100;
      const GAP = 140;

      // Posición aproximada del skeleton según la dirección
      const skeletonPos = { x: sourceNode.position.x, y: sourceNode.position.y };
      if (target.side === "right") skeletonPos.x = sourceNode.position.x + srcW + GAP;
      if (target.side === "left") skeletonPos.x = sourceNode.position.x - GAP - 320;
      if (target.side === "bottom") skeletonPos.y = sourceNode.position.y + srcH + GAP;
      if (target.side === "top") skeletonPos.y = sourceNode.position.y - GAP - 220;

      const skeletonNode: Node = {
        id: skeletonId,
        type: "skeletonNode",
        position: skeletonPos,
        data: {},
      };
      setNodes((prev) => [...prev, skeletonNode]);

      try {
        const extendContext: ExtendContext = {
          side: target.side,
          summary: summarizeNode(sourceNode),
        };
        const rawExtend = await generateFlowFromPrompt(prompt, extendContext);
        const existingExtendIds = new Set(nodes.map((n) => String(n.id)));
        const { nodes: newNodes, edges: newEdges } = uniquifyFlow(rawExtend.nodes, rawExtend.edges, existingExtendIds);

        if (newNodes.length === 0) {
          setNodes((prev) => prev.filter((n) => n.id !== skeletonId));
          toast.error("La IA no generó nodos nuevos");
          return;
        }

        const minX = Math.min(...newNodes.map((n) => n.position.x));
        const minY = Math.min(...newNodes.map((n) => n.position.y));
        const NODE_W = 160;
        const NODE_H = 80;
        const maxX = Math.max(...newNodes.map((n) => n.position.x + ((n.style?.width as number) || NODE_W)));
        const maxY = Math.max(...newNodes.map((n) => n.position.y + ((n.style?.height as number) || NODE_H)));
        const groupW = maxX - minX;
        const groupH = maxY - minY;

        // Punto de anclaje (esquina superior izquierda del grupo generado)
        let baseX = sourceNode.position.x;
        let baseY = sourceNode.position.y;
        if (target.side === "right") { baseX = sourceNode.position.x + srcW + GAP; baseY = sourceNode.position.y; }
        if (target.side === "left") { baseX = sourceNode.position.x - GAP - groupW; baseY = sourceNode.position.y; }
        if (target.side === "bottom") { baseX = sourceNode.position.x; baseY = sourceNode.position.y + srcH + GAP; }
        if (target.side === "top") { baseX = sourceNode.position.x; baseY = sourceNode.position.y - GAP - groupH; }

        // Evita colisiones con otros flujos existentes (excluyendo el nodo de origen),
        // empujando el grupo en la dirección de expansión hasta encontrar espacio libre.
        const obstacles = nodes
          .filter((n) => n.id !== sourceNode.id && n.id !== skeletonId)
          .map(getNodeRect);
        if (obstacles.length > 0) {
          const PAD = 60;
          const stepX = target.side === "left" ? -(groupW + PAD) : (groupW + PAD);
          const stepY = target.side === "top" ? -(groupH + PAD) : (groupH + PAD);
          const horizontal = target.side === "left" || target.side === "right";
          for (let i = 0; i < 20; i++) {
            const candidate: Rect = { x: baseX, y: baseY, w: groupW, h: groupH };
            if (!obstacles.some((o) => rectsOverlap(candidate, o, PAD))) break;
            if (horizontal) baseX += stepX;
            else baseY += stepY;
          }
        }

        const offsetNodes = newNodes.map((n) => ({
          ...n,
          position: {
            x: baseX + (n.position.x - minX),
            y: baseY + (n.position.y - minY),
          },
        }));
        const generatedIds = offsetNodes.map((n) => String(n.id));


        setNodes((prev) => [...prev.filter((n) => n.id !== skeletonId), ...offsetNodes]);

        // Conecta el elemento de origen con el primer nodo generado
        const oppositeHandle: Record<ExtendSide, string> = { top: "bottom", bottom: "top", left: "right", right: "left" };
        const connectingEdge: Edge = {
          id: `e-extend-${sourceNode.id}-${generatedIds[0]}-${Date.now()}`,
          source: sourceNode.id,
          sourceHandle: target.side,
          target: generatedIds[0],
          targetHandle: oppositeHandle[target.side],
          animated: false,
          style: { stroke: "#4059F1", strokeWidth: 2 },
        };
        setEdges((prev) => [...prev, connectingEdge, ...newEdges]);

        if (reactFlowInstance) {
          setTimeout(() => {
            reactFlowInstance.fitView({
              nodes: [{ id: sourceNode.id }, ...generatedIds.map((id) => ({ id }))],
              padding: 0.25,
              duration: 600,
            });
          }, 100);
        }

        toast.success(`Flujo ampliado con ${newNodes.length} nodos`);
      } catch (err) {
        setNodes((prev) => prev.filter((n) => n.id !== skeletonId));
        const message = err instanceof Error ? err.message : "Error desconocido";
        toast.error(message);
      } finally {
        setIsGenerating(false);
      }
    },
    [nodes, setNodes, setEdges, reactFlowInstance, summarizeNode]
  );

  const requestExtend = useCallback((nodeId: string, side: ExtendSide) => {
    setExtendTarget({ nodeId, side });
  }, []);

  const flowExtendValue = useMemo(
    () => ({ active: extendTarget, requestExtend }),
    [extendTarget, requestExtend]
  );

  // Genera un plan estratégico interno y lo muestra para aprobación antes de construir el flujo.
  const proceedToPlanning = useCallback(
    async (prompt: string) => {
      setIsPlanning(true);
      try {
        const plan = await planFlow(prompt);
        if (plan && (plan.phases.length > 0 || plan.summary)) {
          setPlanPrompt(prompt);
          setPlanResult(plan);
          return;
        }
        // Si el plan falla, no bloquees: genera directo.
        await runGenerate(prompt);
      } finally {
        setIsPlanning(false);
      }
    },
    [runGenerate]
  );

  // Primero entiende la intención: si el prompt es muy general, abre el panel de preguntas.
  const handleAIGenerate = useCallback(
    async (prompt: string) => {
      // Modo ampliación: generar a partir del elemento seleccionado (sin clarify/plan).
      if (extendTarget) {
        const target = extendTarget;
        setExtendTarget(null);
        await runExtendGenerate(prompt, target);
        return;
      }
      setIsClarifying(true);
      try {
        const result = await clarifyPrompt(prompt);
        if (result.needs_clarification) {
          setPendingPrompt(prompt);
          setClarifyResult(result);
          return;
        }
        await proceedToPlanning(result.refined_prompt || prompt);
      } finally {
        setIsClarifying(false);
      }
    },
    [proceedToPlanning, extendTarget, runExtendGenerate]
  );

  const handleClarifyConfirm = useCallback(
    async (answers: Record<string, string[]>) => {
      if (!clarifyResult) return;
      const enriched = buildEnrichedPrompt(pendingPrompt, clarifyResult, answers);
      setClarifyResult(null);
      await proceedToPlanning(enriched);
    },
    [clarifyResult, pendingPrompt, proceedToPlanning]
  );

  const handleClarifySkip = useCallback(async () => {
    const base = pendingPrompt;
    setClarifyResult(null);
    await proceedToPlanning(base);
  }, [pendingPrompt, proceedToPlanning]);

  const handlePlanApprove = useCallback(async () => {
    if (!planResult) return;
    const enriched = buildPlanContext(planPrompt, planResult);
    setPlanResult(null);
    await runGenerate(enriched);
  }, [planResult, planPrompt, runGenerate]);




  // Debounced autosave: only after id exists (not "new"). For "new", first manual save creates the row.
  const persist = useCallback(async () => {
    if (!user) return;
    // Viewers / non-editor collaborators don't save
    if (!isOwner && collabRole !== "editor") return;
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

  const [duplicating, setDuplicating] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateName, setDuplicateName] = useState("");

  const openDuplicateDialog = useCallback(() => {
    setDuplicateName(`${name} copia`);
    setDuplicateDialogOpen(true);
  }, [name]);

  const duplicateBoard = useCallback(async () => {
    if (!user || duplicating) return;
    const finalName = duplicateName.trim() || `${name} copia`;
    setDuplicating(true);
    try {
      const sanitizedNodes = nodes.map((n) => {
        const { selected, dragging, resizing, ...rest } = n as Node & { resizing?: boolean };
        return rest;
      });
      const sanitizedEdges = edges.map((e) => {
        const { selected, ...rest } = e as Edge;
        return rest;
      });
      const { error } = await supabase
        .from("flows")
        .insert([{
          user_id: user.id,
          name: finalName,
          nodes: JSON.parse(JSON.stringify(sanitizedNodes)),
          edges: JSON.parse(JSON.stringify(sanitizedEdges)),
        }])
        .select()
        .single();
      if (error) {
        toast.error("No se pudo duplicar el tablero");
        return;
      }
      toast.success("Copia creada en tus tableros");
      setDuplicateDialogOpen(false);
    } finally {
      setDuplicating(false);
    }
  }, [user, duplicating, duplicateName, nodes, edges, name]);


  // Mark dirty + schedule autosave on changes
  useEffect(() => {
    if (loading) return;
    if (skipNextDirtyRef.current) {
      skipNextDirtyRef.current = false;
      return;
    }
    // Don't mark dirty for remote-applied changes
    if (isApplyingRemoteRef.current) return;
    // Viewers / guests don't autosave
    if (!isOwner && collabRole !== "editor") return;
    setSaveState("dirty");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persist();
    }, 800);
  }, [nodes, edges, name, loading, persist, isOwner, collabRole]);

  // Realtime collaboration + presence
  const identityForPresence: PresenceUser = useMemo(() => {
    const palette = ["#4059F1", "#FCB5B9", "#34D399", "#F59E0B", "#A855F7", "#06B6D4", "#EF4444"];
    const key = (user?.id || guestToken || "anon") as string;
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
    const color = palette[Math.abs(hash) % palette.length];
    return {
      id: user?.id || `guest-${key.slice(0, 8)}`,
      display_name: identityProfile?.display_name || (isGuest ? "Invitado" : "Tú"),
      avatar_url: identityProfile?.avatar_url ?? null,
      color,
      is_anon: !user,
    };
  }, [user, guestToken, identityProfile, isGuest]);

  useFlowRealtime({
    flowId: id && id !== "new" ? id : null,
    enabled: !loading && !!id && id !== "new",
    identity: identityForPresence,
    nodes,
    edges,
    setNodes,
    setEdges,
    isApplyingRemoteRef,
    onPresenceChange: setPresenceUsers,
  });

  const activeUsersForPresence = useMemo(() => {
    if (!identityForPresence) return presenceUsers;
    if (presenceUsers.length === 0) {
      return [identityForPresence];
    }
    if (!presenceUsers.some((u) => u.id === identityForPresence.id)) {
      return [identityForPresence, ...presenceUsers];
    }
    return presenceUsers;
  }, [presenceUsers, identityForPresence]);


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
          if (!createdNode) {
            return nds.map((n) =>
              n.id === finalId ? { ...n, selected: true } : { ...n, selected: false }
            );
          }

          // ── When a SECTION is created, adopt all elements under its bounds ──
          if (createdNode.type === "frameNode") {
            const fx = createdNode.position.x;
            const fy = createdNode.position.y;
            const fw = (createdNode.style?.width as number) || 300;
            const fh = (createdNode.style?.height as number) || 200;

            return nds.map((n) => {
              if (n.id === finalId) return { ...n, selected: true };
              // Skip other frames and nodes that already belong to a parent
              if (n.type === "frameNode" || n.parentId) return { ...n, selected: false };

              const nW = (n.measured?.width ?? (n.style?.width as number)) || 100;
              const nH = (n.measured?.height ?? (n.style?.height as number)) || 100;
              const ncx = n.position.x + nW / 2;
              const ncy = n.position.y + nH / 2;

              if (ncx >= fx && ncx <= fx + fw && ncy >= fy && ncy <= fy + fh) {
                return {
                  ...n,
                  parentId: finalId,
                  position: { x: n.position.x - fx, y: n.position.y - fy },
                  selected: false,
                };
              }
              return { ...n, selected: false };
            });
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
    <FlowExtendContext.Provider value={flowExtendValue}>
    <div className={`w-screen h-screen overflow-hidden relative flex flex-col transition-colors duration-300 ${isDark ? 'dark bg-[#0f0f11]' : 'bg-background'}`}>
      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-6 z-20 pointer-events-none">

        {/* Left: back + name + settings */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className={`flex items-center gap-1 pl-2 pr-4 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] min-w-0 ${isDark ? 'bg-black text-white ring-1 ring-white/10' : 'bg-white text-black'}`}>
            <button
              onClick={() => navigate("/boards")}
              className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-[#9CA3AF] hover:text-white' : 'hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black'}`}
              aria-label="Volver"
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
            </button>
            <div className={`w-[1px] h-5 mx-1 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`bg-transparent text-[14px] font-normal tracking-tight outline-none focus:ring-0 px-2 py-1 rounded transition-colors min-w-0 max-w-[40vw] ${isDark ? 'hover:bg-white/10' : 'hover:bg-[#F3F4F6]'}`}
            />
          </div>

          {/* Settings icon + dropdown */}
          <div ref={settingsRef} className="relative pointer-events-auto hidden md:block">
            <button
              ref={settingsButtonRef}
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`w-9 h-9 flex items-center justify-center rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all ${isDark ? 'bg-black text-white ring-1 ring-white/10 hover:bg-white/10' : 'bg-white hover:bg-[#F3F4F6]'} ${settingsOpen ? (isDark ? "bg-white/10" : "bg-[#F3F4F6]") : ""}`}
              aria-label="Configuración del tablero"
            >
              <Settings2 size={16} strokeWidth={1.5} className={isDark ? 'text-[#9CA3AF]' : 'text-[#6B7280]'} />
            </button>

            <AnimatePresence>
              {settingsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`absolute top-[calc(100%+8px)] left-0 w-52 rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.10)] overflow-hidden z-50 ${isDark ? 'bg-[#1C1C1E] border border-white/10 text-white' : 'bg-white text-black'}`}
                >
                  <div className="px-3 py-2.5">
                    <p className="text-[10px] text-[#9CA3AF] font-light tracking-widest mb-1 px-2">Ajustes</p>
                    <button
                      onClick={() => { setHideTools((v) => !v); setSettingsOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${isDark ? 'hover:bg-white/10' : 'hover:bg-[#F3F4F6]'}`}
                    >
                      {hideTools
                        ? <Eye size={15} strokeWidth={1.5} className={isDark ? 'text-[#9CA3AF] shrink-0' : 'text-[#6B7280] shrink-0'} />
                        : <EyeOff size={15} strokeWidth={1.5} className={isDark ? 'text-[#9CA3AF] shrink-0' : 'text-[#6B7280] shrink-0'} />
                      }
                      <span className={`text-[13px] font-normal ${isDark ? 'text-white' : 'text-black'}`}>
                        {hideTools ? "Mostrar herramientas" : "Ocultar herramientas"}
                      </span>
                    </button>

                    {isOwner && (
                      <button
                        onClick={() => { setSettingsOpen(false); openDuplicateDialog(); }}
                        disabled={duplicating}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left disabled:opacity-50 ${isDark ? 'hover:bg-white/10' : 'hover:bg-[#F3F4F6]'}`}
                      >
                        {duplicating
                          ? <Loader2 size={15} strokeWidth={1.5} className="animate-spin shrink-0 text-[#9CA3AF]" />
                          : <Copy size={15} strokeWidth={1.5} className={isDark ? 'text-[#9CA3AF] shrink-0' : 'text-[#6B7280] shrink-0'} />
                        }
                        <span className={`text-[13px] font-normal ${isDark ? 'text-white' : 'text-black'}`}>
                          Duplicar tablero
                        </span>
                      </button>
                    )}


                    <button
                      onClick={() => {
                        setNodes([]);
                        setEdges([]);
                        setSettingsOpen(false);
                        toast.success("Lienzo limpiado correctamente");
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left group ${isDark ? 'hover:bg-[#EF4444]/20 hover:text-[#EF4444]' : 'hover:bg-[#FEE2E2] hover:text-[#EF4444]'}`}
                    >
                      <Trash2 size={15} strokeWidth={1.5} className={`shrink-0 transition-colors ${isDark ? 'text-[#9CA3AF] group-hover:text-[#EF4444]' : 'text-[#6B7280] group-hover:text-[#EF4444]'}`} />
                      <span className={`text-[13px] font-normal transition-colors ${isDark ? 'text-white group-hover:text-[#EF4444]' : 'text-black group-hover:text-[#EF4444]'}`}>
                        Limpiar lienzo
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pointer-events-auto">

          </div>

          {/* Share button (owner only) */}
          {!hideTools && isOwner && id && id !== "new" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    if (!isPro) {
                      toast.info("Compartir tableros está disponible en el plan Pro");
                      navigate("/precios");
                      return;
                    }
                    setShareOpen(true);
                  }}
                  className={`w-9 h-9 flex items-center justify-center rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all ${isDark ? 'bg-black text-white ring-1 ring-white/10 hover:bg-white/10' : 'bg-white hover:bg-[#F3F4F6]'}`}
                  aria-label="Compartir tablero"
                >
                  <Share2 size={16} strokeWidth={1.5} className={isDark ? 'text-[#9CA3AF]' : 'text-[#6B7280]'} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8} className="text-[12px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
                Invitar colaboradores
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Share dialog */}
        {isOwner && id && id !== "new" && (
          <ShareDialog open={shareOpen} onOpenChange={setShareOpen} flowId={id} />
        )}

        <AnimatePresence>
          {duplicateDialogOpen && (
            <motion.div
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => !duplicating && setDuplicateDialogOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className={`relative z-10 w-full max-w-sm rounded-3xl shadow-2xl p-6 ${isDark ? 'bg-[#1C1C1E] border border-white/10 text-white' : 'bg-white text-black'}`}
              >
                <h3 className={`text-base font-normal ${isDark ? 'text-white' : 'text-black'}`}>
                  ¿Cómo quieres llamar a este nuevo tablero?
                </h3>
                <p className={`mt-1 text-[13px] font-light ${isDark ? 'text-white/50' : 'text-[#6B7280]'}`}>
                  Se creará una copia en tus tableros. Tú seguirás en el tablero actual.
                </p>
                <input
                  autoFocus
                  value={duplicateName}
                  onChange={(e) => setDuplicateName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !duplicating) duplicateBoard(); }}
                  maxLength={120}
                  className={`mt-4 w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-white/25' : 'bg-[#F7F7F8] border border-[#E5E7EB] text-black placeholder:text-[#9CA3AF] focus:border-[#9CA3AF]'}`}
                  placeholder="Nombre del tablero"
                />
                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setDuplicateDialogOpen(false)}
                    disabled={duplicating}
                    className={`rounded-full px-4 py-2.5 text-[13px] font-normal transition-colors disabled:opacity-50 ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-[#F3F4F6] text-black'}`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={duplicateBoard}
                    disabled={duplicating}
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-colors disabled:opacity-50 ${isDark ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-miiles-pink'}`}
                  >
                    {duplicating ? <Loader2 size={15} className="animate-spin" /> : <Copy size={15} strokeWidth={1.5} />}
                    Duplicar tablero
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>






        {/* Right Area: Avatars + Controls */}
        <div className="hidden md:flex items-center gap-4 pointer-events-none">
          {/* Desktop Avatars */}
          {!hideTools && (
            <div className="flex items-center gap-2 z-50">
              {!canEdit && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-light pointer-events-auto ${isDark ? 'bg-black text-white/80 ring-1 ring-white/10' : 'bg-white text-[#6B7280] shadow-[0_8px_30px_rgb(0,0,0,0.06)]'}`}>
                  <EyeIcon size={12} strokeWidth={1.5} />
                  Solo lectura
                </div>
              )}
              <div className="pointer-events-auto">
                <PresenceStack users={activeUsersForPresence} localUserId={identityForPresence.id} />
              </div>
            </div>
          )}

          {/* History controls + task panel toggle */}
          {!hideTools && (
            <div className={`flex items-center gap-1 pointer-events-auto px-1.5 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] ${isDark ? 'bg-black text-white ring-1 ring-white/10' : 'bg-white'}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                      canUndo
                        ? isDark ? "hover:bg-white/10 text-[#9CA3AF] hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                        : isDark ? "text-white/20 cursor-not-allowed" : "text-[#D1D5DB] cursor-not-allowed"
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
                        ? isDark ? "hover:bg-white/10 text-[#9CA3AF] hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                        : isDark ? "text-white/20 cursor-not-allowed" : "text-[#D1D5DB] cursor-not-allowed"
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
              <div className={`w-[1px] h-4 mx-0.5 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />

              {/* Task Panel Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setTaskPanelOpen((v) => !v)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                      taskPanelOpen
                        ? isDark ? "bg-white/10 text-white" : "bg-[#F3F4F6] text-black"
                        : isDark ? "hover:bg-white/10 text-[#9CA3AF] hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
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
        </div>

      </header>



      {/* Avatars: Bottom Right (Mobile) */}
      {!hideTools && (
        <div className="md:hidden absolute bottom-5 right-4 flex flex-col items-end gap-2 pointer-events-none z-50">
          {!canEdit && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-light pointer-events-auto ${isDark ? 'bg-black text-white/80 ring-1 ring-white/10' : 'bg-white text-[#6B7280] shadow-[0_8px_30px_rgb(0,0,0,0.06)]'}`}>
              <EyeIcon size={12} strokeWidth={1.5} />
              Lectura
            </div>
          )}
          <div className="pointer-events-auto">
            <PresenceStack users={activeUsersForPresence} localUserId={identityForPresence.id} />
          </div>
        </div>
      )}

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
          edgeTypes={edgeTypes}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          connectionMode={ConnectionMode.Loose}
          isValidConnection={isValidConnection}
          panOnDrag={isMobile ? true : activeDrawShape ? false : interactionMode === "pan" ? true : [1, 2]}
          selectionOnDrag={isMobile ? false : activeDrawShape ? false : interactionMode === "edit"}
          nodesDraggable={canEdit && (isMobile ? false : activeDrawShape ? false : interactionMode === "edit")}
          nodesConnectable={canEdit && (isMobile ? false : activeDrawShape ? false : interactionMode === "edit")}
          elementsSelectable={isMobile ? false : activeDrawShape ? false : interactionMode === "edit"}
          panOnScroll={true}
          selectionMode={"partial" as any}
          fitView
          minZoom={0.05}
          maxZoom={4}
          onInit={setReactFlowInstance}
          proOptions={{ hideAttribution: true }}
          colorMode={isDark ? "dark" : "light"}
          className={`${isDark ? 'bg-[#0f0f11]' : 'bg-white'} ${interactionMode === "pan" ? "pan-mode" : "edit-mode"} ${isMultiSelection ? "multi-select-active" : ""}`}
          style={{ cursor: activeDrawShape ? "crosshair" : "inherit" }}
        >
          <Background variant={BackgroundVariant.Dots} gap={32} size={1} color={isDark ? "#333333" : "#E5E7EB"} />
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
                pointerEvents: "none",
                zIndex: 9000,
              }}
            >
              {/* Same Figma-style corner guides used by single elements */}
              <div className="absolute inset-0 pointer-events-none">
                <div
                  onPointerDown={(e) => handleTransformStart(e, "nw")}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 12,
                    height: 12,
                    transform: "translate(-50%, -50%)",
                    background: "transparent",
                    borderTop: "2.5px solid #4059F1",
                    borderLeft: "2.5px solid #4059F1",
                    borderRadius: 0,
                    boxShadow: "none",
                    boxSizing: "border-box",
                    cursor: "nwse-resize",
                    pointerEvents: "auto",
                  }}
                />
                <div
                  onPointerDown={(e) => handleTransformStart(e, "ne")}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    transform: "translate(50%, -50%)",
                    background: "transparent",
                    borderTop: "2.5px solid #4059F1",
                    borderRight: "2.5px solid #4059F1",
                    borderRadius: 0,
                    boxShadow: "none",
                    boxSizing: "border-box",
                    cursor: "nesw-resize",
                    pointerEvents: "auto",
                  }}
                />
                <div
                  onPointerDown={(e) => handleTransformStart(e, "se")}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    transform: "translate(50%, 50%)",
                    background: "transparent",
                    borderBottom: "2.5px solid #4059F1",
                    borderRight: "2.5px solid #4059F1",
                    borderRadius: 0,
                    boxShadow: "none",
                    boxSizing: "border-box",
                    cursor: "nwse-resize",
                    pointerEvents: "auto",
                  }}
                />
                <div
                  onPointerDown={(e) => handleTransformStart(e, "sw")}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: 12,
                    height: 12,
                    transform: "translate(-50%, 50%)",
                    background: "transparent",
                    borderBottom: "2.5px solid #4059F1",
                    borderLeft: "2.5px solid #4059F1",
                    borderRadius: 0,
                    boxShadow: "none",
                    boxSizing: "border-box",
                    cursor: "nesw-resize",
                    pointerEvents: "auto",
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
                className={`flex items-center gap-1 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-2 py-1.5 pointer-events-auto ${isDark ? 'bg-[#1C1C1E] border border-white/10 text-white' : 'bg-white border border-gray-100/50 text-black'}`}
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
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-2 grid grid-cols-5 gap-1 z-[10000] w-[140px]">
                      {RAINBOW_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => applyGroupStyle("text", c.value)}
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
          {!hideTools && !isMobile && canEdit && (
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
          {!hideTools && !isMobile && canEdit && (
            <motion.div
              key="prompt-bar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <AIPromptBar
                onGenerate={handleAIGenerate}
                isGenerating={isGenerating || isClarifying || isPlanning}
                forceOpen={!!extendTarget}
                extendLabel={extendTarget ? "Ampliando desde este elemento" : null}
                onCancelExtend={() => setExtendTarget(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {clarifyResult && (
          <ClarifyPanel
            result={clarifyResult}
            isDark={isDark}
            isGenerating={isGenerating}
            onConfirm={handleClarifyConfirm}
            onSkip={handleClarifySkip}
            onClose={() => setClarifyResult(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {planResult && (
          <PlanPanel
            plan={planResult}
            isDark={isDark}
            isGenerating={isGenerating}
            onApprove={handlePlanApprove}
            onClose={() => setPlanResult(null)}
          />
        )}
      </AnimatePresence>


      {/* ─── Mobile View Warning Toast ─── */}
      <AnimatePresence>
        {isMobile && showMobileWarning && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-6 left-4 right-4 z-[9999] flex justify-center pointer-events-none"
          >
            <div className="bg-black text-white text-[13px] font-normal px-5 py-3 rounded-2xl shadow-xl max-w-sm text-center pointer-events-auto">
              Te recomendamos usar Miiles desde un ordenador o tablet para una mejor experiencia.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Task List Side Panel ─── */}
      <AnimatePresence>
        {taskPanelOpen && (
          <motion.aside
            key="task-panel"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className={`absolute top-0 right-0 h-full z-50 flex flex-col select-none pointer-events-auto ${isDark ? 'bg-black border-l border-white/30 text-white' : 'bg-white border-l border-black text-black'}`}
            style={{ width: panelWidth }}
          >
            {/* Drag-resize handle */}
            <div
              className="absolute top-0 left-0 w-2 h-full cursor-col-resize z-10 group"
              onPointerDown={(e) => {
                e.preventDefault();
                isDraggingPanel.current = true;
                const startX = e.clientX;
                const startWidth = panelWidth;

                const onMove = (ev: PointerEvent) => {
                  if (!isDraggingPanel.current) return;
                  const delta = startX - ev.clientX;
                  const settingsRight = settingsButtonRef.current
                    ? settingsButtonRef.current.getBoundingClientRect().right + 16
                    : 220;
                  const maxWidth = window.innerWidth - settingsRight;
                  const next = Math.min(maxWidth, Math.max(panelMinWidth, startWidth + delta));
                  setPanelWidth(next);
                };

                const onUp = () => {
                  isDraggingPanel.current = false;
                  window.removeEventListener("pointermove", onMove);
                  window.removeEventListener("pointerup", onUp);
                };

                window.addEventListener("pointermove", onMove);
                window.addEventListener("pointerup", onUp);
              }}
            >
              {/* Línea indicadora de agarre siempre visible */}
              <div className={`absolute left-0 top-0 w-[1px] h-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              {/* Indicador de hover azul suave */}
              <div className="absolute left-0 top-0 w-[4px] h-full opacity-0 group-hover:opacity-100 bg-[#4059F1]/40 transition-opacity" />
            </div>
            {/* Header */}
            <div className={`flex items-center justify-between px-5 pt-5 pb-4 border-b ${isDark ? 'border-white/10' : 'border-[#F3F4F6]'}`}>
              <div className="flex items-center gap-2">
                <ListChecks size={16} strokeWidth={1.5} className="text-[#6B7280]" />
                <span className={`text-[13px] font-medium ${isDark ? 'text-white' : 'text-black'}`}>Lista de tareas</span>
              </div>
              <button
                onClick={() => setTaskPanelOpen(false)}
                className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                  isDark
                    ? 'hover:bg-white/10 text-[#9CA3AF] hover:text-white'
                    : 'hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-black'
                }`}
              >
                <PanelRight size={14} strokeWidth={1.5} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
              {(() => {
                const todoNodes = nodes.filter((n) => n.type === "todoNode");
                if (todoNodes.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center pt-16">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-[#F9FAFB]'}`}>
                        <ListChecks size={18} strokeWidth={1.5} className="text-[#D1D5DB]" />
                      </div>
                      <p className="text-[12px] text-[#9CA3AF] font-light leading-relaxed">
                        No hay listas de tareas<br />en el tablero todavía.
                      </p>
                    </div>
                  );
                }

                // Responsive columns based on panel width
                const cols = panelWidth >= 720 ? 3 : panelWidth >= 480 ? 2 : 1;
                const gridClass = cols === 3
                  ? "grid grid-cols-3 gap-3"
                  : cols === 2
                  ? "grid grid-cols-2 gap-3"
                  : "flex flex-col gap-3";

                return (
                  <div className={gridClass}>
                    {todoNodes.map((node) => {
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

                      const deleteTask = (taskId: string) => {
                        setNodes((nds) =>
                          nds.map((n) => {
                            if (n.id !== node.id) return n;
                            return { ...n, data: { ...n.data, tasks: ((n.data as any).tasks ?? []).filter((t: any) => t.id !== taskId) } };
                          })
                        );
                      };

                      const moveTask = (taskId: string, direction: "up" | "down") => {
                        setNodes((nds) =>
                          nds.map((n) => {
                            if (n.id !== node.id) return n;
                            const t = [...((n.data as any).tasks ?? [])];
                            const idx = t.findIndex((tk: any) => tk.id === taskId);
                            if (direction === "up" && idx === 0) return n;
                            if (direction === "down" && idx === t.length - 1) return n;
                            const target = direction === "up" ? idx - 1 : idx + 1;
                            const [moved] = t.splice(idx, 1);
                            t.splice(target, 0, moved);
                            return { ...n, data: { ...n.data, tasks: t } };
                          })
                        );
                      };

                      // Reacción dinámica en modo oscuro: si tiene fondo blanco, se pone oscuro.
                      const rawBg = d.backgroundColor ?? (isDark ? "#1F2937" : "#FFFFFF");
                      const isWhiteBg = isWhiteColor(rawBg);
                      const backgroundColor = isDark && isWhiteBg ? "#1F2937" : rawBg;

                      const isCardDark = backgroundColor === "transparent" || !d.backgroundColor
                        ? isDark
                        : isColorDark(backgroundColor);

                      // Reacción dinámica en modo oscuro: si tiene texto negro o fondo blanco, se pone blanco.
                      const rawTextColor = d.textColor ?? (isCardDark ? "#FFFFFF" : "#1F2937");
                      const isBlackText = isBlackColor(rawTextColor);
                      const effectiveTextColor = isDark && (isBlackText || isWhiteBg) ? "#FFFFFF" : rawTextColor;

                      return (
                        <div
                          key={node.id}
                          tabIndex={-1}
                          className="rounded-2xl border p-5 space-y-3 relative group/card transition-all duration-300 cursor-pointer outline-none"
                          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setActiveCardId(null); }}
                          style={{
                            backgroundColor: backgroundColor || (isDark ? "#1C1C1E" : "#FAFAFA"),
                            borderColor: isCardDark ? "rgba(255,255,255,0.1)" : "#E5E7EB",
                            boxShadow: panelCardHover === node.id
                              ? "0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04)"
                              : "0 4px 12px -1px rgba(0,0,0,0.015), 0 2px 4px -1px rgba(0,0,0,0.01)"
                          }}
                          onMouseEnter={() => setPanelCardHover(node.id)}
                          onMouseLeave={() => { setPanelCardHover(null); }}
                          onClick={() => {
                            const foundNode = nodes.find(n => n.id === node.id);
                            if (foundNode) {
                              setCenter(
                                foundNode.position.x + 150, 
                                foundNode.position.y + 100, 
                                { zoom: 1.2, duration: 800 }
                              );
                            }
                          }}
                        >
                          {/* Quick copy (hover) */}
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const text = buildTasksInstructions({ title, subtitle, tasks } as TodoListLike);
                              await copyTextToClipboard(text);
                              setCopiedCardId(node.id);
                              setTimeout(() => setCopiedCardId((c) => (c === node.id ? null : c)), 1600);
                            }}
                            title={copiedCardId === node.id ? "¡Copiado!" : "Copiar esta lista como instrucciones para IA"}
                            className={`absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-lg border transition-all duration-200 ${
                              copiedCardId === node.id
                                ? "bg-black text-white border-black opacity-100"
                                : `opacity-0 group-hover/card:opacity-100 ${isCardDark ? "bg-white/10 text-white/80 border-white/10 hover:bg-white/20" : "bg-white text-[#6B7280] border-[#E5E7EB] hover:text-black hover:bg-[#F3F4F6]"}`
                            }`}
                          >
                            {copiedCardId === node.id ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
                          </button>

                          {/* Card header */}

                          <div className="space-y-1">
                            {title && (
                              <div className="text-[16px] font-semibold truncate" style={{ color: effectiveTextColor }}>
                                {title}
                              </div>
                            )}
                            {subtitle && (
                              <p className="text-[13px] font-light leading-snug" style={{
                                color: effectiveTextColor === "#1F2937" || effectiveTextColor === "#111827"
                                  ? (isCardDark ? "#9CA3AF" : "#6B7280")
                                  : `${effectiveTextColor}cc`
                              }}>
                                {subtitle}
                              </p>
                            )}
                          </div>

                          {/* Tasks */}
                          <div className="space-y-2 pt-1">
                            {tasks.length === 0 && (
                              <p className="text-[12px] font-light py-1" style={{ color: isCardDark ? "#6B7280" : "#9CA3AF" }}>Sin tareas aún.</p>
                            )}
                            {tasks.map((task) => (
                              <div key={task.id} className="group/ptask flex items-center gap-3 py-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                                  className="w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200"
                                  style={{
                                    borderColor: task.completed ? effectiveTextColor : (isCardDark ? "#6B7280" : "#9CA3AF"),
                                    backgroundColor: task.completed ? effectiveTextColor : "transparent",
                                  }}
                                >
                                  {task.completed && <Check size={12} className={effectiveTextColor === "#FFFFFF" ? "text-gray-900" : "text-white"} strokeWidth={3} />}
                                </button>
                                <AutoResizingTextarea
                                  value={task.text}
                                  onChange={(e) => updateTaskText(task.id, e.target.value)}
                                  onFocus={() => setActiveCardId(node.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      addTask();
                                    }
                                  }}
                                  placeholder="Nueva tarea..."
                                  className="flex-1 bg-transparent border-none outline-none text-[13px] font-light leading-snug min-w-0 placeholder-gray-400 p-0"
                                  style={{
                                    color: task.completed ? (isCardDark ? "#6B7280" : "#9CA3AF") : effectiveTextColor,
                                    textDecoration: task.completed ? "line-through" : "none",
                                    opacity: task.completed ? 0.7 : 1,
                                  }}
                                />
                                <div className="flex items-center gap-0.5 shrink-0 opacity-0 pointer-events-none group-hover/ptask:opacity-100 group-hover/ptask:pointer-events-auto transition-opacity duration-100">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); moveTask(task.id, "up"); }}
                                    className="p-1 rounded-md hover:bg-black/10 text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Subir"
                                  >
                                    <ArrowUp size={11} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); moveTask(task.id, "down"); }}
                                    className="p-1 rounded-md hover:bg-black/10 text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Bajar"
                                  >
                                    <ArrowDown size={11} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                                    className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Eliminar"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Add task button — solo visible cuando la card está activa */}
                          {activeCardId === node.id && (
                            <button
                              onClick={(e) => { e.stopPropagation(); addTask(); }}
                              className="flex items-center gap-2 py-2 px-3 rounded-xl border border-dashed transition-all text-left mt-2 shrink-0 w-full"
                              style={{
                                borderColor: isCardDark ? "rgba(255,255,255,0.1)" : "#D1D5DB",
                                color: isCardDark ? "#9CA3AF" : "#9CA3AF",
                                backgroundColor: isCardDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"
                              }}
                            >
                              <Plus size={13} />
                              <span className="text-[13px]">+ Nueva Tarea</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Footer: copy / download all tasks */}
            {(() => {
              const todoNodes = nodes.filter((n) => n.type === "todoNode");
              if (todoNodes.length === 0) return null;

              const buildAll = () => {
                const blocks = todoNodes.map((n) => {
                  const d = n.data as any;
                  return buildTasksInstructions({
                    title: d.title || "Lista de Tareas",
                    subtitle: d.subtitle || "",
                    tasks: d.tasks ?? [],
                  } as TodoListLike);
                });
                return blocks.join("\n\n---\n\n");
              };

              return (
                <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className="pointer-events-auto flex items-center gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={async () => {
                            await copyTextToClipboard(buildAll());
                            setCopiedAll(true);
                            setTimeout(() => setCopiedAll(false), 1600);
                          }}
                          className={`w-fit h-11 flex items-center justify-center gap-3 px-4 rounded-full transition-all duration-200 shrink-0 shadow-lg border ${
                            copiedAll
                              ? (isDark ? "bg-white text-black border-white" : "bg-black text-white border-black")
                              : isDark
                              ? "bg-black text-white border-white/20 hover:bg-neutral-900"
                              : "bg-white text-[#4B4F63] border-gray-200 hover:bg-[#F9FAFB]"
                          }`}
                        >
                          {copiedAll ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2} />}
                          
                          <div className={`w-px h-4 shrink-0 ${copiedAll ? (isDark ? 'bg-black/20' : 'bg-white/20') : (isDark ? 'bg-white/20' : 'bg-gray-300')}`} />
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* ChatGPT Logo */}
                            <svg xmlns="http://www.w3.org/2000/svg" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 509.639" className="w-[16px] h-[16px] shrink-0 rounded-[4px] overflow-hidden">
                              <path fill="#fff" d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.613-115.613 115.613H115.612C52.026 509.64 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z"/>
                              <path fill="#000" fillRule="nonzero" d="M412.037 221.764a90.834 90.834 0 004.648-28.67 90.79 90.79 0 00-12.443-45.87c-16.37-28.496-46.738-46.089-79.605-46.089-6.466 0-12.943.683-19.264 2.04a90.765 90.765 0 00-67.881-30.515h-.576c-.059.002-.149.002-.216.002-39.807 0-75.108 25.686-87.346 63.554-25.626 5.239-47.748 21.31-60.682 44.03a91.873 91.873 0 00-12.407 46.077 91.833 91.833 0 0023.694 61.553 90.802 90.802 0 00-4.649 28.67 90.804 90.804 0 0012.442 45.87c16.369 28.504 46.74 46.087 79.61 46.087a91.81 91.81 0 0019.253-2.04 90.783 90.783 0 0067.887 30.516h.576l.234-.001c39.829 0 75.119-25.686 87.357-63.588 25.626-5.242 47.748-21.312 60.682-44.033a91.718 91.718 0 0012.383-46.035 91.83 91.83 0 00-23.693-61.553l-.004-.005zM275.102 413.161h-.094a68.146 68.146 0 01-43.611-15.8 56.936 56.936 0 002.155-1.221l72.54-41.901a11.799 11.799 0 005.962-10.251V241.651l30.661 17.704c.326.163.55.479.596.84v84.693c-.042 37.653-30.554 68.198-68.21 68.273h.001zm-146.689-62.649a68.128 68.128 0 01-9.152-34.085c0-3.904.341-7.817 1.005-11.663.539.323 1.48.897 2.155 1.285l72.54 41.901a11.832 11.832 0 0011.918-.002l88.563-51.137v35.408a1.1 1.1 0 01-.438.94l-73.33 42.339a68.43 68.43 0 01-34.11 9.12 68.359 68.359 0 01-59.15-34.11l-.001.004zm-19.083-158.36a68.044 68.044 0 0135.538-29.934c0 .625-.036 1.731-.036 2.5v83.801l-.001.07a11.79 11.79 0 005.954 10.242l88.564 51.13-30.661 17.704a1.096 1.096 0 01-1.034.093l-73.337-42.375a68.36 68.36 0 01-34.095-59.143 68.412 68.412 0 019.112-34.085l-.004-.003zm251.907 58.621l-88.563-51.137 30.661-17.697a1.097 1.097 0 011.034-.094l73.337 42.339c21.109 12.195 34.132 34.746 34.132 59.132 0 28.604-17.849 54.199-44.686 64.078v-86.308c.004-.032.004-.065.004-.096 0-4.219-2.261-8.119-5.919-10.217zm30.518-45.93c-.539-.331-1.48-.898-2.155-1.286l-72.54-41.901a11.842 11.842 0 00-5.958-1.611c-2.092 0-4.15.558-5.957 1.611l-88.564 51.137v-35.408l-.001-.061a1.1 1.1 0 01.44-.88l73.33-42.303a68.301 68.301 0 0134.108-9.129c37.704 0 68.281 30.577 68.281 68.281a68.69 68.69 0 01-.984 11.545v.005zm-191.843 63.109l-30.668-17.704a1.09 1.09 0 01-.596-.84v-84.692c.016-37.685 30.593-68.236 68.281-68.236a68.332 68.332 0 0143.689 15.804 63.09 63.09 0 00-2.155 1.222l-72.54 41.9a11.794 11.794 0 00-5.961 10.248v.068l-.05 102.23zm16.655-35.91l39.445-22.782 39.444 22.767v45.55l-39.444 22.767-39.445-22.767v-45.535z" />
                            </svg>
                            {/* Claude Logo */}
                            <svg xmlns="http://www.w3.org/2000/svg" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 509.64" className="w-[16px] h-[16px] shrink-0 rounded-[4px] overflow-hidden">
                              <path fill="#D77655" d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.612-115.613 115.612H115.612C52.026 509.639 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z"/>
                              <path fill="#FCF2EE" fillRule="nonzero" d="M142.27 316.619l73.655-41.326 1.238-3.589-1.238-1.996-3.589-.001-12.31-.759-42.084-1.138-36.498-1.516-35.361-1.896-8.897-1.895-8.34-10.995.859-5.484 7.482-5.03 10.717.935 23.683 1.617 35.537 2.452 25.782 1.517 38.193 3.968h6.064l.86-2.451-2.073-1.517-1.618-1.517-36.776-24.922-39.81-26.338-20.852-15.166-11.273-7.683-5.687-7.204-2.451-15.721 10.237-11.273 13.75.935 3.513.936 13.928 10.716 29.749 23.027 38.848 28.612 5.687 4.727 2.275-1.617.278-1.138-2.553-4.271-21.13-38.193-22.546-38.848-10.035-16.101-2.654-9.655c-.935-3.968-1.617-7.304-1.617-11.374l11.652-15.823 6.445-2.073 15.545 2.073 6.547 5.687 9.655 22.092 15.646 34.78 24.265 47.291 7.103 14.028 3.791 12.992 1.416 3.968 2.449-.001v-2.275l1.997-2.641 3.69-32.707 3.589-42.084 1.239-11.854 5.863-14.206 11.652-7.683 9.099 4.348 7.482 10.716-1.036 6.926-4.449 28.915-8.72 45.294-5.687 30.331h3.313l3.792-3.791 15.342-20.372 25.782-32.227 11.374-12.789 13.27-14.129 8.517-6.724 16.1-.001 11.854 17.617-5.307 18.199-16.581 21.029-13.75 17.819-19.716 26.54-12.309 21.231 1.138 1.694 2.932-.278 44.536-9.479 24.062-4.347 28.714-4.928 12.992 6.066 1.416 6.167-5.106 12.613-30.71 7.583-36.018 7.204-53.636 12.689-.657.48.758.935 24.164 2.275 10.337.556h25.301l47.114 3.514 12.309 8.139 7.381 9.959-1.238 7.583-18.957 9.655-25.579-6.066-59.702-14.205-20.474-5.106-2.83-.001v1.694l17.061 16.682 31.266 28.233 39.152 36.397 1.997 8.999-5.03 7.102-5.307-.758-34.401-25.883-13.27-11.651-30.053-25.302-1.996-.001v2.654l6.926 10.136 36.574 54.975 1.895 16.859-2.653 5.485-9.479 3.311-10.414-1.895-21.408-30.054-22.092-33.844-17.819-30.331-2.173 1.238-10.515 113.261-4.929 5.788-11.374 4.348-9.478-7.204-5.03-11.652 5.03-23.027 6.066-30.052 4.928-23.886 4.449-29.674 2.654-9.858-.177-.657-2.173.278-22.37 30.71-34.021 45.977-26.919 28.815-6.445 2.553-11.173-5.789 1.037-10.337 6.243-9.2 37.257-47.392 22.47-29.371 14.508-16.961-.101-2.451h-.859l-98.954 64.251-17.618 2.275-7.583-7.103.936-11.652 3.589-3.791 29.749-20.474-.101.102.024.101z"/>
                            </svg>
                            
                            {/* Gemini Sparkle Logo */}
                            <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 65" className="w-[16px] h-[16px] shrink-0">
                              <mask id="maskme" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="65" height="65">
                                <path d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z" fill="#000" />
                                <path d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z" fill="url(#prefix__paint0_linear_2001_67)" />
                              </mask>
                              <g mask="url(#maskme)">
                                <g filter="url(#prefix__filter0_f_2001_67)">
                                  <path d="M-5.859 50.734c7.498 2.663 16.116-2.33 19.249-11.152 3.133-8.821-.406-18.131-7.904-20.794-7.498-2.663-16.116 2.33-19.25 11.151-3.132 8.822.407 18.132 7.905 20.795z" fill="#FFE432" />
                                </g>
                                <g filter="url(#prefix__filter1_f_2001_67)">
                                  <path d="M27.433 21.649c10.3 0 18.651-8.535 18.651-19.062 0-10.528-8.35-19.062-18.651-19.062S8.78-7.94 8.78 2.587c0 10.527 8.35 19.062 18.652 19.062z" fill="#FC413D" />
                                </g>
                                <g filter="url(#prefix__filter2_f_2001_67)">
                                  <path d="M20.184 82.608c10.753-.525 18.918-12.244 18.237-26.174-.68-13.93-9.95-24.797-20.703-24.271C6.965 32.689-1.2 44.407-.519 58.337c.681 13.93 9.95 24.797 20.703 24.271z" fill="#00B95C" />
                                </g>
                                <g filter="url(#prefix__filter3_f_2001_67)">
                                  <path d="M20.184 82.608c10.753-.525 18.918-12.244 18.237-26.174-.68-13.93-9.95-24.797-20.703-24.271C6.965 32.689-1.2 44.407-.519 58.337c.681 13.93 9.95 24.797 20.703 24.271z" fill="#00B95C" />
                                </g>
                                <g filter="url(#prefix__filter4_f_2001_67)">
                                  <path d="M30.954 74.181c9.014-5.485 11.427-17.976 5.389-27.9-6.038-9.925-18.241-13.524-27.256-8.04-9.015 5.486-11.428 17.977-5.39 27.902 6.04 9.924 18.242 13.523 27.257 8.038z" fill="#00B95C" />
                                </g>
                                <g filter="url(#prefix__filter5_f_2001_67)">
                                  <path d="M67.391 42.993c10.132 0 18.346-7.91 18.346-17.666 0-9.757-8.214-17.667-18.346-17.667s-18.346 7.91-18.346 17.667c0 9.757 8.214 17.666 18.346 17.666z" fill="#3186FF" />
                                </g>
                                <g filter="url(#prefix__filter6_f_2001_67)">
                                  <path d="M-13.065 40.944c9.33 7.094 22.959 4.869 30.442-4.972 7.483-9.84 5.987-23.569-3.343-30.663C4.704-1.786-8.924.439-16.408 10.28c-7.483 9.84-5.986 23.57 3.343 30.664z" fill="#FBBC04" />
                                </g>
                                <g filter="url(#prefix__filter7_f_2001_67)">
                                  <path d="M34.74 51.43c11.135 7.656 25.896 5.524 32.968-4.764 7.073-10.287 3.779-24.832-7.357-32.488C49.215 6.52 34.455 8.654 27.382 18.94c-7.072 10.288-3.779 24.833 7.357 32.49z" fill="#3186FF" />
                                </g>
                                <g filter="url(#prefix__filter8_f_2001_67)">
                                  <path d="M54.984-2.336c2.833 3.852-.808 11.34-8.131 16.727-7.324 5.387-15.557 6.631-18.39 2.78-2.833-3.853.807-11.342 8.13-16.728 7.324-5.387 15.558-6.631 18.39-2.78z" fill="#749BFF" />
                                </g>
                                <g filter="url(#prefix__filter9_f_2001_67)">
                                  <path d="M31.727 16.104C43.053 5.598 46.94-8.626 40.41-15.666c-6.53-7.04-21.006-4.232-32.332 6.274s-15.214 24.73-8.683 31.77c6.53 7.04 21.006 4.232 32.332-6.274z" fill="#FC413D" />
                                </g>
                                <g filter="url(#prefix__filter10_f_2001_67)">
                                  <path d="M8.51 53.838c6.732 4.818 14.46 5.55 17.262 1.636 2.802-3.915-.384-10.994-7.116-15.812-6.731-4.818-14.46-5.55-17.261-1.636-2.802 3.915.383 10.994 7.115 15.812z" fill="#FFEE48" />
                                </g>
                              </g>
                              <defs>
                                <filter id="prefix__filter0_f_2001_67" x="-19.824" y="13.152" width="39.274" height="43.217" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                  <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                  <feGaussianBlur stdDeviation="2.46" result="effect1_foregroundBlur_2001_67" />
                                </filter>
                                <filter id="prefix__filter1_f_2001_67" x="-15.001" y="-40.257" width="84.868" height="85.688" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                  <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                  <feGaussianBlur stdDeviation="11.891" result="effect1_foregroundBlur_2001_67" />
                                </filter>
                                <filter id="prefix__filter2_f_2001_67" x="-20.776" y="11.927" width="79.454" height="90.916" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                  <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                  <feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67" />
                                </filter>
                                <filter id="prefix__filter3_f_2001_67" x="-20.776" y="11.927" width="79.454" height="90.916" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                  <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                  <feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67" />
                                </filter>
                                <filter id="prefix__filter4_f_2001_67" x="-19.845" y="15.459" width="79.731" height="81.505" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                  <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                  <feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67" />
                                </filter>
                                <filter id="prefix__filter5_f_2001_67" x="29.832" y="-11.552" width="75.117" height="73.758" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                  <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                  <feGaussianBlur stdDeviation="9.606" result="effect1_foregroundBlur_2001_67" />
                                </filter>
                                <filter id="prefix__filter6_f_2001_67" x="-38.583" y="-16.253" width="78.135" height="78.758" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                  <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                  <feGaussianBlur stdDeviation="8.706" result="effect1_foregroundBlur_2001_67" />
                                </filter>
                                <filter id="prefix__filter7_f_2001_67" x="8.107" y="-5.966" width="78.877" height="77.539" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                  <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                  <feGaussianBlur stdDeviation="7.775" result="effect1_foregroundBlur_2001_67" />
                                </filter>
                                <filter id="prefix__filter8_f_2001_67" x="13.587" y="-18.488" width="56.272" height="51.81" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                  <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                  <feGaussianBlur stdDeviation="6.957" result="effect1_foregroundBlur_2001_67" />
                                </filter>
                                <filter id="prefix__filter9_f_2001_67" x="-15.526" y="-31.297" width="70.856" height="69.306" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                  <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                  <feGaussianBlur stdDeviation="5.876" result="effect1_foregroundBlur_2001_67" />
                                </filter>
                                <filter id="prefix__filter10_f_2001_67" x="-14.168" y="20.964" width="55.501" height="51.571" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                  <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                  <feGaussianBlur stdDeviation="7.273" result="effect1_foregroundBlur_2001_67" />
                                </filter>
                              </defs>
                            </svg>
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center" sideOffset={8} className="text-[12px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
                        Copiar instrucciones
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            downloadTextFile("tareas.md", buildAll());
                            setDownloadedAll(true);
                            setTimeout(() => setDownloadedAll(false), 1600);
                          }}
                          className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 shrink-0 shadow-lg border ${
                            downloadedAll
                              ? "bg-black text-white border-black"
                              : isDark
                              ? "bg-black text-white border-white/20 hover:bg-neutral-900"
                              : "bg-white text-[#4B4F63] border-gray-200 hover:bg-[#F9FAFB]"
                          }`}
                        >
                          {downloadedAll ? <Check size={14} strokeWidth={2.5} /> : <Download size={14} strokeWidth={2} />}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center" sideOffset={8} className="text-[12px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
                        Descargar instrucciones
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })()}
          </motion.aside>

        )}
      </AnimatePresence>
    </div>
    </FlowExtendContext.Provider>
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
