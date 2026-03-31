import { motion } from "framer-motion";
import { Circle, Diamond, Square, Play, StopCircle, MousePointer } from "lucide-react";

type ToolbarProps = {
  onAddNode: (type: string) => void;
};

const tools = [
  { id: "process", icon: Square, label: "Proceso", color: "text-muted-foreground" },
  { id: "decision", icon: Diamond, label: "Decisión", color: "text-amber-500" },
  { id: "start", icon: Play, label: "Inicio", color: "text-emerald-500" },
  { id: "end", icon: StopCircle, label: "Fin", color: "text-rose-500" },
  { id: "action", icon: Circle, label: "Acción", color: "text-primary" },
];

const Toolbar = ({ onAddNode }: ToolbarProps) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-3 py-2 rounded-xl bg-card/90 backdrop-blur-xl border border-border shadow-2xl shadow-black/40"
    >
      <div className="flex items-center gap-0.5 pr-2 mr-2 border-r border-border">
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
          <MousePointer size={16} />
        </button>
      </div>
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onAddNode(tool.id)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors group"
          title={tool.label}
        >
          <tool.icon size={16} className={`${tool.color} group-hover:scale-110 transition-transform`} />
          <span className="text-xs text-muted-foreground hidden sm:inline">{tool.label}</span>
        </button>
      ))}
    </motion.div>
  );
};

export default Toolbar;
