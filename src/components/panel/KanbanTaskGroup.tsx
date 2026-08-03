import { Check, Copy, Columns3 } from "lucide-react";
import type { Node } from "@xyflow/react";
import type { KanbanColumn, KanbanCard, KanbanTaskItem } from "@/components/nodes/KanbanNode";

export type KanbanCardEntry = { colId: string; colTitle: string; card: KanbanCard };

/** Devuelve las tarjetas de una pizarra que tienen checklist. */
export const getKanbanCardsWithTasks = (node: Node): KanbanCardEntry[] => {
  const cols = ((node.data as any)?.columns ?? []) as KanbanColumn[];
  const out: KanbanCardEntry[] = [];
  for (const col of cols) {
    for (const card of col.cards ?? []) {
      if ((card.tasks?.length ?? 0) > 0) out.push({ colId: col.id, colTitle: col.title, card });
    }
  }
  return out;
};

type Props = {
  node: Node;
  entries: KanbanCardEntry[];
  isDark: boolean;
  accentColor: string;
  gridClass: string;
  onFocusBoard: () => void;
  onFocusCard: (entry: KanbanCardEntry) => void;
  onCopy: (entry: KanbanCardEntry) => void;
  copiedId: string | null;
  setNodes: (updater: (nds: Node[]) => Node[]) => void;
};

const KanbanTaskGroup = ({
  node,
  entries,
  isDark,
  accentColor,
  gridClass,
  onFocusBoard,
  onFocusCard,
  onCopy,
  copiedId,
  setNodes,
}: Props) => {
  const boardTitle = ((node.data as any)?.title as string) || "Pizarra";

  const mutateTasks = (
    colId: string,
    cardId: string,
    fn: (tasks: KanbanTaskItem[]) => KanbanTaskItem[],
  ) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== node.id) return n;
        const cols = ((n.data as any).columns ?? []) as KanbanColumn[];
        const next = cols.map((c) =>
          c.id !== colId
            ? c
            : {
                ...c,
                cards: c.cards.map((k) => (k.id === cardId ? { ...k, tasks: fn(k.tasks ?? []) } : k)),
              },
        );
        return { ...n, data: { ...n.data, columns: next } };
      }),
    );
  };

  const cardBg = isDark ? "#1C1C1E" : "#FFFFFF";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB";
  const textColor = isDark ? "#FFFFFF" : "#1F2937";
  const mutedColor = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Columns3 size={13} strokeWidth={1.5} style={{ color: mutedColor }} />
        <button
          onClick={onFocusBoard}
          className="text-[12px] font-medium truncate hover:underline text-left cursor-pointer"
          style={{ color: textColor }}
          title="Ir a la pizarra"
        >
          {boardTitle}
        </button>
        <span className="text-[11px] font-light" style={{ color: mutedColor }}>
          {entries.length}
        </span>
      </div>

      <div className={gridClass}>
        {entries.map(({ colId, colTitle, card }) => {
          const tasks = card.tasks ?? [];
          const done = tasks.filter((t) => t.completed).length;
          const key = `${node.id}:${card.id}`;
          return (
            <div
              key={key}
              onClick={() => onFocusCard({ colId, colTitle, card })}
              className="rounded-2xl border p-5 space-y-3 relative group/card transition-all duration-300 cursor-pointer outline-none hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04),0_8px_10px_-6px_rgba(0,0,0,0.04)]"
              style={{
                backgroundColor: cardBg,
                borderColor,
                boxShadow: "0 4px 12px -1px rgba(0,0,0,0.015), 0 2px 4px -1px rgba(0,0,0,0.01)",
              }}
            >
              {/* Copy button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy({ colId, colTitle, card });
                }}
                title="Copiar esta tarjeta como instrucciones para IA"
                className={`absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-lg border transition-all duration-200 ${
                  copiedId === key
                    ? "bg-black text-white border-black opacity-100"
                    : `opacity-0 group-hover/card:opacity-100 ${
                        isDark
                          ? "bg-white/10 text-white/80 border-white/10 hover:bg-white/20"
                          : "bg-white text-[#6B7280] border-[#E5E7EB] hover:text-black hover:bg-[#F3F4F6]"
                      }`
                }`}
              >
                {copiedId === key ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
              </button>

              {/* Card Title & Info */}
              <div className="space-y-0.5 pr-8">
                <div className="text-[15px] font-semibold truncate" style={{ color: textColor }}>
                  {card.title || "Tarjeta"}
                </div>
                <div className="text-[12px] font-light" style={{ color: mutedColor }}>
                  {colTitle} · {done}/{tasks.length}
                </div>
              </div>

              {/* Task Items */}
              <div className="space-y-2 pt-1">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group/task flex items-center gap-3 py-0.5 select-none"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        mutateTasks(colId, card.id, (ts) =>
                          ts.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)),
                        );
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center border-[1.5px] border-solid transition-all shrink-0 duration-200 mt-[2px] ${
                        task.completed
                          ? ""
                          : isDark
                          ? "bg-white/[0.05] border-white/15 hover:border-white/30 hover:bg-white/[0.08]"
                          : "bg-black/[0.03] border-black/15 hover:border-black/30 hover:bg-black/[0.05]"
                      }`}
                      style={{
                        borderColor: task.completed
                          ? (accentColor && accentColor !== "transparent" ? accentColor : "#4059F1")
                          : undefined,
                        backgroundColor: task.completed
                          ? (accentColor && accentColor !== "transparent" ? accentColor : "#4059F1")
                          : undefined,
                      }}
                      title={task.completed ? "Marcar como pendiente" : "Marcar como completada"}
                    >
                      {task.completed && (
                        <Check
                          size={12}
                          className={`${
                            (accentColor === "#FFFFFF" || accentColor === "#FACC15")
                              ? "text-gray-900"
                              : "text-white"
                          } stroke-[3.5]`}
                        />
                      )}
                    </button>
                    <span
                      className="text-[13px] font-light leading-snug break-words flex-1 min-w-0"
                      style={{
                        color: task.completed ? mutedColor : textColor,
                        textDecoration: task.completed ? "line-through" : "none",
                        opacity: task.completed ? 0.7 : 1,
                      }}
                    >
                      {task.text || "Tarea"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default KanbanTaskGroup;
