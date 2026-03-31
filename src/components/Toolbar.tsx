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
      className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-3 rounded-full bg-white shadow-sm font-sans"
    >
      <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-miiles-gray-50 transition-all text-miiles-gray-400 hover:text-black btn-hover-float">
        <MousePointer size={18} />
      </button>
      
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onAddNode(tool.id)}
          className="flex items-center gap-3 px-5 py-2.5 rounded-full hover:bg-miiles-gray-50 transition-all group btn-hover-float"
          title={tool.label}
        >
          <tool.icon size={18} className="text-miiles-gray-400 group-hover:text-black transition-colors" />
          <span className="text-[13px] font-light text-miiles-gray-600 group-hover:text-black uppercase tracking-tight">{tool.label}</span>
        </button>
      ))}
    </motion.div>
  );
};

export default Toolbar;
