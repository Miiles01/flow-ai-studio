import { motion } from "framer-motion";
import { Circle, Diamond, Square, Play, StopCircle, MousePointer } from "lucide-react";

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
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-20 right-8 z-10 flex items-center gap-1 px-3 py-2 rounded-[30px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] font-sans"
    >
      <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] transition-all text-[#6B7280] hover:text-black">
        <MousePointer size={18} strokeWidth={1.5} />
      </button>
      
      <div className="w-[1px] h-6 bg-[#E5E7EB] mx-1" />

      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onAddNode(tool.id)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-[#F3F4F6] transition-all group"
          title={tool.label}
        >
          <tool.icon size={18} strokeWidth={1.5} className="text-[#6B7280] group-hover:text-black transition-colors" />
          <span className="text-[13px] font-normal text-[#6B7280] group-hover:text-black tracking-tight">{tool.label}</span>
        </button>
      ))}
    </motion.div>
  );
};

export default Toolbar;
