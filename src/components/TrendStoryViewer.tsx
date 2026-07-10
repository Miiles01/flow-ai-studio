import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import type { Trend } from "@/hooks/useTrends";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MOCK_FLOWS } from "@/data/mockTrends";

type Props = {
  trends: Trend[];
  startIndex: number | null;
  onClose: () => void;
  onView?: (id: string) => void;
};

function getEmbedUrl(url: string | null, network: string | null, isActive: boolean) {
  if (!url) return "";
  try {
    const autoPlayParam = isActive ? "1" : "0";
    if (network === "youtube") {
      const v = new URL(url).searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=${autoPlayParam}&mute=1&controls=0&modestbranding=1`;
    }
    if (network === "instagram") {
      return url.replace(/\/$/, "") + "/embed/?hidecaption=true" + (isActive ? "&autoplay=1" : "");
    }
    if (network === "tiktok") {
      const match = url.match(/\/video\/(\d+)/);
      if (match) return `https://www.tiktok.com/embed/v2/${match[1]}?autoplay=${autoPlayParam}&hide_ui=1`;
    }
    if (network === "facebook") {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=${isActive ? "true" : "false"}`;
    }
  } catch (e) {
    return url;
  }
  return url;
}

export function TrendStoryViewer({ trends, startIndex, onClose, onView }: Props) {
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

  const activeFlow = targetNetwork ? MOCK_FLOWS[targetNetwork as string] : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden border-none max-w-[95vw] w-[95vw] h-[95vh] rounded-[32px] shadow-2xl relative bg-white [&>button.absolute.right-4]:hidden"
      >
        {/* Full Dotted pattern Background across the ENTIRE modal */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 z-0"
          style={{
            background: "radial-gradient(circle at center, #FFFFFF 0%, rgba(140, 134, 162, 0.15) 59%, #FFFFFF 100%)",
            maskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
            maskSize: "24px 24px",
            WebkitMaskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
            WebkitMaskSize: "24px 24px"
          }}
        />

        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 px-5 py-2.5 rounded-full transition-all hover:bg-gray-50 hover:shadow-md text-black z-50 bg-white shadow-sm border border-black/5 font-medium text-sm cursor-pointer flex items-center gap-2"
        >
          <X size={16} strokeWidth={2.5} />
          Cerrar
        </button>

        {/* Read-only ReactFlow Diagram (Full Width Background) */}
        <div className="absolute inset-0 z-10">
          {activeFlow ? (
            <div className="w-full h-full relative">
              <div className="absolute top-8 left-[38%] z-20 pointer-events-none">
                <h2 className="text-2xl font-normal text-gray-900">Arquitectura Algorítmica</h2>
                <p className="text-sm text-gray-500 mt-1 capitalize">{filteredTrends[activeIndex]?.network || targetNetwork || ""}</p>
              </div>
              <ReactFlow 
                nodes={(activeFlow.nodes || []).map((n: any) => ({
                  ...n,
                  draggable: false,
                  selectable: true,
                  style: {
                    background: n.data?.expandable ? '#f0fdf4' : '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px 18px',
                    fontSize: '13px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                  }
                }))} 
                edges={(activeFlow.edges || []).map((e: any) => ({
                  ...e,
                  animated: e.animated !== false,
                  style: { stroke: '#94a3b8', strokeWidth: 2 }
                }))} 
                fitView 
                fitViewOptions={{ padding: 0.2 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                minZoom={0.2}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="bg-white/60 backdrop-blur-md px-6 py-4 rounded-2xl border border-black/5 shadow-sm">
                <p className="text-gray-500 font-light text-sm">El diagrama de arquitectura no está disponible para esta red</p>
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
                  src={getEmbedUrl(trend.media_url, trend.network, activeIndex === i)} 
                  className="absolute border-0"
                  style={{
                    top: trend.network === 'instagram' ? '-12%' : '0',
                    left: trend.network === 'instagram' ? '-5%' : '0',
                    width: trend.network === 'instagram' ? '110%' : '100%',
                    height: trend.network === 'instagram' ? '124%' : '100%',
                    pointerEvents: 'auto'
                  }}
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
