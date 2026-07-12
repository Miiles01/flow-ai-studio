import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import type { Trend } from "@/hooks/useTrends";
import { ReactFlow, BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type Node, type Edge, type EdgeProps, type ReactFlowInstance } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import TrendFlowNode from "@/components/TrendFlowNode";
import { TREND_FLOWS } from "@/data/trendFlows";
import { useTheme } from "@/contexts/ThemeContext";

const trendNodeTypes = { trendNode: TrendFlowNode };

// Edge con etiqueta tipo pill (contenedor súper redondo en medio de la línea)
const TrendEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label }: EdgeProps) => {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
    borderRadius: 14,
  });
  return (
    <>
      <BaseEdge id={id} path={path} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
            className="absolute pointer-events-none nodrag nopan px-3 py-1 rounded-full text-[10px] font-normal tracking-wide bg-white text-[#4B4F63] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:bg-[#1C1C1E] dark:text-white/80 dark:border-white/10"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

const trendEdgeTypes = { trendEdge: TrendEdge };

// Handles según el lado en que se despliegan las tarjetas de detalle
const DETAIL_HANDLES: Record<string, { source: string; target: string }> = {
  left: { source: "l-s", target: "r-t" },
  right: { source: "r-s", target: "l-t" },
  bottom: { source: "b", target: "t" },
};

type Props = {
  trends: Trend[];
  startIndex: number | null;
  onClose: () => void;
  onView?: (id: string) => void;
};

function getEmbedUrl(url: string | null, isActive: boolean) {
  if (!url) return "";
  try {
    const autoPlayParam = isActive ? "1" : "0";
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const v = new URL(url).searchParams.get("v") || url.split('/').pop();
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=${autoPlayParam}&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${v}&playsinline=1&iv_load_policy=3&fs=0&disablekb=1&cc_load_policy=0`;
    }
    if (url.includes("instagram.com")) {
      return url.replace(/\/$/, "") + "/embed/?hidecaption=true";
    }
    if (url.includes("tiktok.com")) {
      const match = url.match(/\/video\/(\d+)/);
      // Player oficial v1: permite apagar toda la UI (controles, música, descripción, botones)
      if (match) return `https://www.tiktok.com/player/v1/${match[1]}?autoplay=${autoPlayParam}&loop=1&controls=0&progress_bar=0&play_button=0&volume_control=0&fullscreen_button=0&timestamp=0&music_info=0&description=0&rel=0&native_context_menu=0&closed_caption=0`;
    }
    if (url.includes("facebook.com")) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=${isActive ? "true" : "false"}`;
    }
  } catch (e) {
    return url;
  }
  return url;
}

export function TrendStoryViewer({ trends, startIndex, onClose, onView }: Props) {
  const { isDark } = useTheme();
  const open = startIndex !== null && trends.length > 0;
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get all trends for the clicked network
  const targetNetwork = startIndex !== null && trends[startIndex] ? trends[startIndex].network : null;
  const filteredTrends = trends.filter(t => t.network === targetNetwork);
  
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (open && startIndex !== null) {
      // Find the index of the clicked item within the filtered array
      const clickedTrendId = trends[startIndex].id;
      const filteredIndex = filteredTrends.findIndex(t => t.id === clickedTrendId);
      setActiveIndex(filteredIndex >= 0 ? filteredIndex : 0);
      
      setTimeout(() => {
        const el = containerRef.current;
        if (!el) return;
        const items = el.querySelectorAll('.carousel-item');
        const target = items[filteredIndex >= 0 ? filteredIndex : 0] as HTMLElement;
        if (target) {
          el.scrollTo({
            top: target.offsetTop - el.clientHeight / 2 + target.clientHeight / 2,
            behavior: 'instant'
          });
        }
      }, 50);
    }
  }, [open, startIndex]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const center = el.scrollTop + el.clientHeight / 2;
    const items = el.querySelectorAll('.carousel-item');
    let closestIdx = 0;
    let minDistance = Infinity;

    items.forEach((item, idx) => {
      const itemEl = item as HTMLElement;
      const itemCenter = itemEl.offsetTop + itemEl.clientHeight / 2;
      const distance = Math.abs(center - itemCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });

    if (closestIdx !== activeIndex) {
      setActiveIndex(closestIdx);
      const trend = filteredTrends[closestIdx];
      if (trend && onView) onView(trend.id);
    }
  };

  const activeFlow = targetNetwork ? TREND_FLOWS[targetNetwork as string] : null;

  // ── Expansión de nodos (las "raíces" del diagrama) ──
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

  // Al cambiar de red, el diagrama vuelve a su vista genérica
  useEffect(() => {
    setExpandedIds(new Set());
  }, [targetNetwork]);

  const toggleNodeDetails = useCallback(
    (nodeId: string) => {
      const isExpanding = !expandedIds.has(nodeId);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (isExpanding) next.add(nodeId);
        else next.delete(nodeId);
        return next;
      });

      // Re-encuadre: al expandir enfoca el nodo + sus detalles; al colapsar vuelve a la vista general
      setTimeout(() => {
        const instance = rfInstanceRef.current;
        if (!instance || !activeFlow) return;
        if (isExpanding) {
          const parent = activeFlow.nodes.find((n) => n.id === nodeId);
          const detailIds = (parent?.data.details ?? []).map((det) => `${nodeId}-det-${det.id}`);
          instance.fitView({
            nodes: [{ id: nodeId }, ...detailIds.map((id) => ({ id }))],
            padding: 0.35,
            duration: 500,
          });
        } else {
          instance.fitView({ padding: 0.15, duration: 500 });
        }
      }, 80);
    },
    [activeFlow, expandedIds]
  );

  const { visibleNodes, visibleEdges } = useMemo(() => {
    if (!activeFlow) return { visibleNodes: [] as Node[], visibleEdges: [] as Edge[] };

    const nodes: Node[] = activeFlow.nodes.map((n) => ({
      id: n.id,
      type: "trendNode",
      position: n.position,
      draggable: false,
      data: {
        label: n.data.label,
        sublabel: n.data.sublabel,
        tag: n.data.tag,
        kind: n.data.kind,
        hasDetails: (n.data.details?.length ?? 0) > 0,
        expanded: expandedIds.has(n.id),
        onToggle: toggleNodeDetails,
      },
    }));

    const edges: Edge[] = activeFlow.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? "b",
      targetHandle: e.targetHandle ?? "t",
      type: "trendEdge",
      animated: false,
      label: e.label,
      className: e.dashed ? "trend-edge-dashed" : "trend-edge",
    }));

    // Nodos y aristas de detalle (solo de nodos expandidos)
    for (const n of activeFlow.nodes) {
      if (!n.data.details || !expandedIds.has(n.id)) continue;
      for (const det of n.data.details) {
        const detId = `${n.id}-det-${det.id}`;
        nodes.push({
          id: detId,
          type: "trendNode",
          position: { x: n.position.x + det.dx, y: n.position.y + det.dy },
          draggable: false,
          data: { label: det.label, sublabel: det.sublabel, tag: det.tag, kind: "detail" },
        });
        const handles = DETAIL_HANDLES[det.side ?? "bottom"];
        edges.push({
          id: `e-${detId}`,
          source: n.id,
          target: detId,
          sourceHandle: handles.source,
          targetHandle: handles.target,
          type: "trendEdge",
          animated: false,
          className: "trend-edge-detail",
        });
      }
    }

    return { visibleNodes: nodes, visibleEdges: edges };
  }, [activeFlow, expandedIds, toggleNodeDetails, isDark]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden border-none max-w-[95vw] w-[95vw] h-[95vh] rounded-[32px] shadow-2xl bg-white dark:bg-[#0f0f11] [&>button.absolute.right-4]:hidden"
      >
        {/* Full Dotted pattern Background across the ENTIRE modal */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 z-0"
          style={{
            background: isDark ? "radial-gradient(circle at center, #0f0f11 0%, rgba(255, 255, 255, 0.05) 59%, #0f0f11 100%)" : "radial-gradient(circle at center, #FFFFFF 0%, rgba(140, 134, 162, 0.15) 59%, #FFFFFF 100%)",
            maskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
            maskSize: "24px 24px",
            WebkitMaskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
            WebkitMaskSize: "24px 24px"
          }}
        />

        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 px-5 py-2.5 rounded-full transition-all hover:bg-gray-50 dark:hover:bg-white/10 text-black dark:text-white z-50 bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/10 font-medium text-sm cursor-pointer flex items-center gap-2"
        >
          <X size={16} strokeWidth={2.5} />
          Cerrar
        </button>

        {/* Read-only ReactFlow Diagram — Ocupa todo el fondo para que los videos floten por encima */}
        <div className="absolute inset-0 z-10">
          {activeFlow ? (
            <div className="w-full h-full relative">
              <div className="absolute top-8 left-8 z-20 pointer-events-none">
                <h2 className="text-2xl font-normal text-gray-900 dark:text-white">Arquitectura Algorítmica</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">{targetNetwork || ""}</p>
                <p className="text-[11px] font-light text-gray-400 dark:text-gray-500 mt-2">
                  Toca el ojo en los nodos para ver el detalle
                </p>
              </div>
              <ReactFlow
                colorMode={isDark ? "dark" : "light"}
                nodes={visibleNodes}
                edges={visibleEdges}
                nodeTypes={trendNodeTypes}
                edgeTypes={trendEdgeTypes}
                onInit={(instance) => { rfInstanceRef.current = instance; }}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                minZoom={0.15}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
                className="trends-flow"
              >
                <style>{`
                  .trends-flow .react-flow__handle { opacity: 0 !important; pointer-events: none !important; }
                  .trends-flow .react-flow__node { pointer-events: all !important; cursor: default !important; }
                  .trends-flow .react-flow__edge.trend-edge path.react-flow__edge-path {
                    stroke: ${isDark ? "#3F4553" : "#C9CEDC"} !important;
                    stroke-width: 1.5 !important;
                  }
                  .trends-flow .react-flow__edge.trend-edge-dashed path.react-flow__edge-path {
                    stroke: ${isDark ? "#5B4448" : "#F3C6C9"} !important;
                    stroke-width: 1.5 !important;
                    stroke-dasharray: 5 5 !important;
                    animation: trendDashMove 0.8s linear infinite !important;
                  }
                  .trends-flow .react-flow__edge.trend-edge-detail path.react-flow__edge-path {
                    stroke: ${isDark ? "#3D477F" : "#B9C3F9"} !important;
                    stroke-width: 1.5 !important;
                    stroke-dasharray: 4 4 !important;
                    animation: trendDashMove 0.8s linear infinite !important;
                  }
                  @keyframes trendDashMove {
                    to { stroke-dashoffset: -20; }
                  }
                `}</style>
              </ReactFlow>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm">
                <p className="text-gray-500 dark:text-gray-400 font-light text-sm">El diagrama de arquitectura no está disponible para esta red</p>
              </div>
            </div>
          )}
        </div>

        {/* Left Side: Floating Vertical Carousel (Over the diagram) */}
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="absolute left-0 top-0 bottom-0 z-30 w-full md:w-[35%] h-full flex flex-col items-center overflow-y-auto snap-y snap-mandatory scrollbar-hide py-[calc(47.5vh-300px)] pointer-events-auto bg-transparent"
        >
          {filteredTrends.map((trend, i) => (
            <motion.div
              key={trend.id}
              className="carousel-item w-[85%] max-w-[360px] shrink-0 snap-center flex flex-col my-8 relative transition-all duration-300"
              initial={{ opacity: 0.6, scale: 0.95 }}
              animate={{ opacity: activeIndex === i ? 1 : 0.6, scale: activeIndex === i ? 1 : 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {/* Actual Embedded Video with CSS Crop for UI */}
              <div className="w-full aspect-[9/16] bg-black rounded-[24px] overflow-hidden relative border-none">
                <iframe
                  src={getEmbedUrl(trend.media_url, activeIndex === i)}
                  className="absolute border-0"
                  style={
                    (trend.media_url || '').includes('instagram.com')
                      ? {
                          // Recorte sin zoom: el iframe es más alto que el contenedor y se desplaza
                          // hacia arriba para ocultar el header (~54px) y el footer (~48px) del embed.
                          top: '-54px',
                          left: '-1px',
                          width: 'calc(100% + 2px)',
                          height: 'calc(100% + 102px)',
                          pointerEvents: 'auto',
                        }
                      : {
                          top: '0',
                          left: '0',
                          width: '100%',
                          height: '100%',
                          pointerEvents: 'auto',
                        }
                  }
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          ))}
        </div>

      </DialogContent>
    </Dialog>
  );
}
