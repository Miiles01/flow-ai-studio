import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import EstrellaIcon from "@/assets/miiles/Estrella.svg";
import type { WidgetAIComment } from "@/lib/widgetAI";

type Props = {
  comments: WidgetAIComment[];
  onChange: (next: WidgetAIComment[]) => void;
};

const WidgetCommentBadge = ({ comments, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const hasUnread = useMemo(() => comments.some((c) => !c.read), [comments]);
  if (!comments.length) return null;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && hasUnread) {
      onChange(comments.map((c) => ({ ...c, read: true })));
    }
  };

  const remove = (id: string) => {
    onChange(comments.filter((c) => c.id !== id));
  };
  const clearAll = () => onChange([]);

  return (
    <div className="absolute -top-2 -right-2 z-30 nodrag nopan" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={toggle}
        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-colors ${
          hasUnread ? "bg-black" : "bg-miiles-gray-400"
        }`}
        title="Comentarios de Miiles"
      >
        <img src={EstrellaIcon} alt="" className="w-4 h-4 invert" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-10 right-0 w-[320px] max-h-[420px] rounded-2xl bg-white dark:bg-[#1C1E2A] shadow-2xl border border-black/5 dark:border-white/10 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-black/5 dark:border-white/10">
              <span className="text-xs font-medium text-foreground">Miiles</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearAll}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-miiles-gray-400 hover:text-red-500 hover:bg-red-500/10 transition"
                  title="Borrar todos"
                >
                  <Trash2 size={12} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-miiles-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="group">
                  <div className="text-[10px] text-miiles-gray-400 mb-1">Tú</div>
                  <div className="text-xs text-foreground mb-2 whitespace-pre-wrap">{c.prompt}</div>
                  <div className="rounded-lg bg-miiles-blue/10 dark:bg-miiles-blue/20 px-3 py-2 text-xs text-foreground prose prose-xs max-w-none dark:prose-invert">
                    <ReactMarkdown>{c.answer}</ReactMarkdown>
                  </div>
                  <div className="flex justify-end mt-1">
                    <button
                      onClick={() => remove(c.id)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-miiles-gray-400 hover:text-red-500 transition"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WidgetCommentBadge;
