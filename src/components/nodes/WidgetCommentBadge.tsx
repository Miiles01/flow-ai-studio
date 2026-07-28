import { useState, useMemo, useRef, useEffect } from "react";
import { Trash2, X, Check, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import EstrellaIcon from "@/assets/miiles/Estrella.svg";
import type { WidgetAIComment } from "@/lib/widgetAI";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  comments: WidgetAIComment[];
  onChange: (next: WidgetAIComment[]) => void;
};

const WidgetCommentBadge = ({ comments, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const unreadCount = useMemo(() => comments.filter((c) => !c.read).length, [comments]);
  const hasUnread = unreadCount > 0;
  
  if (!comments.length) return null;

  useEffect(() => {
    if (open && scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [open, comments.length]);

  const onOpenChange = (next: boolean) => {
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
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-[#1C1C1E] shadow-lg transition-colors ${
              hasUnread ? "bg-black" : "bg-miiles-gray-400"
            }`}
            title="Comentarios"
          >
            <img src={EstrellaIcon} alt="" className="w-4 h-4 invert" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#1C1C1E] shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={12}
          className="w-[340px] max-h-[440px] rounded-2xl bg-white dark:bg-[#1C1C1E] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-black/5 dark:border-white/10 flex flex-col overflow-hidden p-0 !z-[9999]"
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
          <div ref={scrollRef} className="flex-1 overflow-y-auto editor-scrollbar p-3 space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="group">
                <div className="text-[10px] text-miiles-gray-400 mb-1">Tú</div>
                <div className="text-xs text-foreground mb-2 whitespace-pre-wrap">{c.prompt}</div>
                <div className="flex items-start gap-2 rounded-xl bg-neutral-100 dark:bg-white/10 px-3 py-2.5 text-xs text-neutral-900 dark:text-neutral-100">
                  <div className="mt-0.5 shrink-0 text-neutral-500 dark:text-neutral-400">
                    {(c.answer.includes("✅") || c.answer.includes("✔️")) ? <Check size={14} /> : <Sparkles size={14} />}
                  </div>
                  <div className="prose prose-xs max-w-none dark:prose-invert">
                    <ReactMarkdown>{c.answer.replace(/[✅✔️]/g, "").trim()}</ReactMarkdown>
                  </div>
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
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default WidgetCommentBadge;
