import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { X, Lightbulb } from "lucide-react";
import SuggestionDialog from "@/components/SuggestionDialog";
import { RetentionPopup } from "@/components/RetentionPopup";
import type { Trend } from "@/hooks/useTrends";
import { ReactFlow, BaseEdge, EdgeLabelRenderer, getSmoothStepPath, getStraightPath, Background, BackgroundVariant, type Node, type Edge, type EdgeProps, type ReactFlowInstance } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import TrendFlowNode from "@/components/TrendFlowNode";
import TrendVideoCard from "@/components/TrendVideoCard";
import TrendVideoPlayer from "@/components/TrendVideoPlayer";
import { Button } from "@/components/ui/button";
import { TREND_FLOWS, type TrendFlow } from "@/data/trendFlows";
import { useTheme } from "@/contexts/ThemeContext";
import { getYouTubeExplainerEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/videoEmbed";

const trendNodeTypes = { trendNode: TrendFlowNode, trendVideo: TrendVideoCard };

// Edge con etiqueta tipo pill (contenedor súper redondo en medio de la línea)
const TrendEdge = ({ id, source, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label }: EdgeProps) => {
  const isVideoEdge = source.startsWith("video-");
  const [path, labelX, labelY] = isVideoEdge 
    ? getStraightPath({ sourceX, sourceY, targetX, targetY })
    : getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, borderRadius: 14 });
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

export function TrendStoryViewer({ trends, startIndex, onClose }: Props) {
  const { isDark } = useTheme();
  const open = startIndex !== null && trends.length > 0;
  const targetNetwork = startIndex !== null && trends[startIndex] ? trends[startIndex].network : null;
  const [suggestOpen, setSuggestOpen] = useState(false);
  const activeFlow = targetNetwork ? TREND_FLOWS[targetNetwork as string] : null;
  const [activeVideo, setActiveVideo] = useState<NonNullable<TrendFlow["videos"]>[number] | null>(null);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const videoTriggerRef = useRef<HTMLButtonElement | null>(null);

  // ── Expansión de nodos (las "raíces" del diagrama) ──
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

  // Al cambiar de red, el diagrama vuelve a su vista genérica
  useEffect(() => {
    setExpandedIds(new Set());
    setActiveVideo(null);
    setVideoExpanded(false);
  }, [targetNetwork]);

  const openVideo = useCallback((trigger: HTMLButtonElement, index = 0) => {
    const video = activeFlow?.videos?.[index];
    if (!video) return;
    videoTriggerRef.current = trigger;
    setActiveVideo(video);
    setVideoExpanded(false);
  }, [activeFlow]);

  const closeVideo = useCallback(() => {
    setActiveVideo(null);
    setVideoExpanded(false);
    window.requestAnimationFrame(() => videoTriggerRef.current?.focus());
  }, []);

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
        image: n.data.image,
        imageDark: n.data.imageDark,
        icon: n.data.icon,
        confidence: n.data.confidence,
        hasDetails: (n.data.details?.length ?? 0) > 0,
        expanded: expandedIds.has(n.id),
        onToggle: toggleNodeDetails,
      },
    }));

    (activeFlow.videos ?? []).forEach((video, index) => {
      nodes.push({
        id: `video-${activeFlow.network}-${index}`,
        type: "trendVideo",
        position: video.position,
        draggable: false,
        selectable: false,
        data: {
          title: video.title,
          thumbnailUrl: video.thumbnailUrl ?? getYouTubeThumbnailUrl(video.url) ?? undefined,
          ariaLabel: video.ariaLabel,
          onPlay: (trigger: HTMLButtonElement) => openVideo(trigger, index),
        },
      });
    });

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
          data: { label: det.label, sublabel: det.sublabel, tag: det.tag, kind: "detail", icon: det.icon, confidence: det.confidence },
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
  }, [activeFlow, expandedIds, toggleNodeDetails, openVideo]);

  const activeEmbedUrl = activeVideo ? getYouTubeExplainerEmbedUrl(activeVideo.url) : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        hideClose
        onEscapeKeyDown={(event) => {
          if (!activeVideo) return;
          event.preventDefault();
          closeVideo();
        }}
        className="p-0 overflow-hidden border-none max-w-[95vw] w-[95vw] h-[95vh] rounded-[32px] shadow-2xl bg-white dark:bg-[#0f0f11] [&>button.absolute.right-4]:hidden"
      >
        <DialogTitle className="sr-only">Arquitectura Algorítmica</DialogTitle>
        <DialogDescription className="sr-only">
          Esquema interactivo que explica cómo funciona el algoritmo de {targetNetwork ?? "la red seleccionada"}.
        </DialogDescription>
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

        {/* Floating Close Button (oculto mientras el video está ampliado) */}
        {!(activeVideo && videoExpanded) && (
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="absolute right-8 top-8 z-[60] rounded-full border border-border bg-card px-5 py-2.5 text-sm font-normal text-card-foreground shadow-sm hover:translate-y-0 hover:bg-muted"
          >
            <X size={16} strokeWidth={2.5} />
            Cerrar
          </Button>
        )}

        {/* Botón flotante para sugerir mejoras a la arquitectura */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => setSuggestOpen(true)}
          className="absolute bottom-8 right-8 z-[60] rounded-full border border-border bg-card px-5 py-2.5 text-sm font-normal text-card-foreground shadow-sm hover:translate-y-0 hover:bg-muted"
        >
          <Lightbulb size={16} strokeWidth={2.5} />
          Sugerir ideas
        </Button>

        <SuggestionDialog
          open={suggestOpen}
          network={targetNetwork || null}
          context="Arquitectura Algorítmica"
          onClose={() => setSuggestOpen(false)}
        />
        <RetentionPopup />

        <div className="absolute inset-0 z-10">
          {activeFlow ? (
            <div className="w-full h-full relative">
              <div className="pointer-events-none absolute left-8 top-8 z-20 flex items-start gap-4">
                <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5 text-card-foreground sm:rounded-2xl sm:px-5 sm:py-4">
                  <div>
                    <h2 className="text-lg font-normal leading-none text-foreground sm:text-2xl">
                      <span className="hidden sm:inline">Arquitectura Algorítmica</span>
                      <span className="sm:hidden">{targetNetwork ? targetNetwork.charAt(0).toUpperCase() + targetNetwork.slice(1) : ""}</span>
                    </h2>
                    <p className="mt-1 hidden text-sm font-light text-muted-foreground sm:block">{targetNetwork ? targetNetwork.charAt(0).toUpperCase() + targetNetwork.slice(1) : ""}</p>
                  </div>
                </div>
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
                <Background variant={BackgroundVariant.Dots} gap={32} size={1.5} color={isDark ? "#52525B" : "#9CA3AF"} />
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

        {activeVideo && activeEmbedUrl ? (
          <TrendVideoPlayer
            title={activeVideo.title}
            embedUrl={activeEmbedUrl}
            expanded={videoExpanded}
            onExpandedChange={setVideoExpanded}
            onClose={closeVideo}
          />
        ) : null}

      </DialogContent>
    </Dialog>
  );
}
