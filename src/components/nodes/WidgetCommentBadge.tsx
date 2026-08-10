import { useState, useMemo, useRef, useEffect } from "react";
import { Trash2, X, Check, Sparkles, Loader2, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import EstrellaIcon from "@/assets/miiles/Estrella.svg";
import type { WidgetAIComment } from "@/lib/widgetAI";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  comments: WidgetAIComment[];
  onChange: (next: WidgetAIComment[]) => void;
};

const formatStamp = (ts: number) => {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Hoy ${time}`;
  return `${d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })} ${time}`;
};

const WidgetCommentBadge = ({ comments, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const unreadCount = useMemo(() => comments.filter((c) => !c.read).length, [comments]);
  const hasUnread = unreadCount > 0;
  const isWorking = useMemo(() => comments.some((c) => c.pending), [comments]);

  useEffect(() => {
    if (open) {
      // Radix Popover anima la entrada, por lo que el scrollHeight puede no estar listo de inmediato.
      // Hacemos unos pocos intentos rápidos para asegurar que se vaya hasta abajo.
      let attempts = 0;
      const interval = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        if (++attempts > 10) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [open, comments.length]);

  if (!comments.length) return null;


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
            className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-[#1C1C1E] shadow-sm transition-colors ${
              isWorking || hasUnread ? "bg-black" : "bg-miiles-gray-400"
            }`}
            title={isWorking ? "Trabajando en tu tarea…" : "Comentarios"}
          >
            {isWorking && (
              <span className="absolute inset-0 rounded-full border-2 border-black/20 border-t-black animate-spin -m-1" />
            )}
            {isWorking ? (
              <Loader2 size={14} className="text-white animate-spin" />
            ) : (
              <img src={EstrellaIcon} alt="" className="w-4 h-4 invert" />
            )}
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
          className="w-[340px] max-h-[440px] rounded-2xl bg-white dark:bg-[#1C1C1E] shadow-sm border border-black/5 dark:border-white/10 flex flex-col overflow-hidden p-0 !z-[9999]"
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
                <div className="flex items-center gap-1.5 text-[10px] text-miiles-gray-400 mb-1">
                  <span>Tú</span>
                  {c.createdAt && (
                    <>
                      <span>·</span>
                      <span>{formatStamp(c.createdAt)}</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-foreground mb-2 whitespace-pre-wrap">{c.prompt}</div>
                <div
                  className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs ${
                    c.status === "error"
                      ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300"
                      : "bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-neutral-100"
                  }`}
                >
                  <div className="mt-0.5 shrink-0 text-neutral-500 dark:text-neutral-400">
                    {c.pending ? (
                      <Loader2 size={14} className="animate-spin text-black dark:text-white" />
                    ) : c.status === "error" ? (
                      <AlertTriangle size={14} className="text-red-500" />
                    ) : (c.answer.includes("✅") || c.answer.includes("✔️")) ? (
                      <Check size={14} />
                    ) : (
                      <Sparkles size={14} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="prose prose-xs max-w-none dark:prose-invert">
                      <ReactMarkdown>{c.answer.replace(/[✅✔️]/g, "").trim()}</ReactMarkdown>
                    </div>
                    {c.pending && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
                          <div className="h-full w-1/3 rounded-full bg-black dark:bg-white animate-[widget-loader_1.4s_ease-in-out_infinite]" />
                        </div>
                        <span className="text-[10px] text-miiles-gray-400 shrink-0">
                          {c.provider ? `${c.provider} trabajando…` : "Trabajando en tu tarea…"}
                        </span>
                      </div>
                    )}
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
