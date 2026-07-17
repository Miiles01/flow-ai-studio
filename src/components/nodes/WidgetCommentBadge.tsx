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
        className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-[#1C1C1E] shadow-lg transition-colors ${
          hasUnread ? "bg-black" : "bg-miiles-gray-400"
        }`}
        title="Comentarios"
      >
        <img src={EstrellaIcon} alt="" className="w-4 h-4 invert" />
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#1C1C1E] shadow-sm">
          {comments.length}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-10 right-0 w-[340px] max-h-[440px] rounded-2xl bg-white dark:bg-[#1C1C1E] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/5 dark:border-white/10 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-black/5 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-foreground">Comentarios</span>
                <button
                  onClick={clearAll}
                  className="p-1.5 rounded-lg transition-colors text-miiles-gray-400 hover:text-red-500 hover:bg-red-500/10"
                  title="Borrar todos"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors text-[11px] font-medium bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white"
              >
                <span>Cerrar</span>
                <X size={12} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto editor-scrollbar p-3 space-y-3">
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
