import { motion } from "framer-motion";
import { Circle, Diamond, Square, Play, StopCircle, MousePointer } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type ToolbarProps = {
  onAddNode: (type: string) => void;
};

const tools = [
  { id: "process", icon: Square, label: "Proceso" },
  { id: "decision", icon: Diamond, label: "Decisión" },
  { id: "start", icon: Play, label: "Inicio" },
  { id: "end", icon: StopCircle, label: "Fin" },
  { id: "action", icon: Circle, label: "Acción" },
];

const Toolbar = ({ onAddNode }: ToolbarProps) => {
  return (
    <motion.div
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute top-1/2 -translate-y-1/2 left-6 z-10 flex flex-col items-center gap-1.5 px-2 py-3 rounded-[30px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] font-sans"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] transition-all text-[#6B7280] hover:text-black">
            <MousePointer size={18} strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
          Seleccionar
        </TooltipContent>
      </Tooltip>
      
      <div className="w-6 h-[1px] bg-[#E5E7EB] my-1" />

      {tools.map((tool) => (
        <Tooltip key={tool.id}>
          <TooltipTrigger asChild>
            <button
              onClick={() => onAddNode(tool.id)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] transition-all group"
            >
              <tool.icon size={18} strokeWidth={1.5} className="text-[#6B7280] group-hover:text-black transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
            {tool.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </motion.div>
  );
};

export default Toolbar;
