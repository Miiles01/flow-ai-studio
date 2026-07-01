import { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import type { Trend } from "@/hooks/useTrends";

type Props = {
  trends: Trend[];
  startIndex: number | null;
  onClose: () => void;
  onView?: (id: string) => void;
};

export function TrendStoryViewer({ trends, startIndex, onClose, onView }: Props) {
  const open = startIndex !== null && trends.length > 0;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && startIndex !== null && containerRef.current) {
      // Small delay to allow render before scrolling
      setTimeout(() => {
        const el = containerRef.current;
        if (!el) return;
        const items = el.querySelectorAll('.carousel-item');
        const target = items[startIndex] as HTMLElement;
        if (target) {
          el.scrollTo({
            top: target.offsetTop - el.clientHeight / 2 + target.clientHeight / 2,
            behavior: 'instant'
          });
        }
      }, 50);
    }
  }, [open, startIndex]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden border-none max-w-[95vw] w-[95vw] h-[95vh] rounded-[32px] shadow-2xl flex flex-col md:grid md:grid-cols-[40%_60%] gap-0 bg-white"
      >
        {/* Left Side: Vertical Carousel */}
        <div 
          ref={containerRef}
          className="relative w-full h-full bg-[#FAFAFA] flex flex-col items-center overflow-y-auto snap-y snap-mandatory scrollbar-hide py-[calc(47.5vh-250px)] border-r border-black/5"
        >
          {trends.map((trend, i) => (
            <motion.div
              key={trend.id}
              className="carousel-item w-[85%] max-w-[340px] aspect-[9/16] shrink-0 bg-miiles-gray-200 rounded-[24px] snap-center flex items-center justify-center my-6 overflow-hidden shadow-sm relative transition-opacity duration-300"
              initial={{ opacity: 0.6 }}
              whileInView={{ opacity: 1 }}
              viewport={{ amount: 0.7 }}
            >
              {/* Placeholder for video */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-miiles-gray-500 gap-3">
                <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[12px] border-l-black/40 border-b-8 border-b-transparent ml-1" />
                </div>
                <span className="font-medium text-sm">Video Area</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Side: Dotted Canvas */}
        <div className="relative w-full h-full bg-white flex flex-col">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full transition-colors hover:bg-black/5 text-black z-50"
            aria-label="Cerrar"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
          
          {/* Dotted pattern */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background: "radial-gradient(circle at center, #FFFFFF 0%, rgba(140, 134, 162, 0.15) 59%, #FFFFFF 100%)",
              maskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
              maskSize: "24px 24px",
              WebkitMaskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
              WebkitMaskSize: "24px 24px"
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
