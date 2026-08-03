import { Check, Plus, Trash2, ArrowUp, ArrowDown, Copy, Columns3 } from "lucide-react";
import type { Node } from "@xyflow/react";
import type { KanbanColumn, KanbanCard, KanbanTaskItem } from "@/components/nodes/KanbanNode";

const uid = () => `tk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

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
  onFocus: () => void;
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
  onFocus,
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
          onClick={onFocus}
          className="text-[12px] font-medium truncate hover:underline"
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
              className="rounded-2xl border p-4 space-y-2 relative group/card transition-all duration-300"
              style={{
                backgroundColor: cardBg,
                borderColor,
                boxShadow: "0 4px 12px -1px rgba(0,0,0,0.015), 0 2px 4px -1px rgba(0,0,0,0.01)",
              }}
            >
              <button
                onClick={() => onCopy({ colId, colTitle, card })}
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

              <div className="space-y-0.5 pr-8">
                <div className="text-[14px] font-semibold truncate" style={{ color: textColor }}>
                  {card.title || "Tarjeta"}
                </div>
                <div className="text-[11px] font-light" style={{ color: mutedColor }}>
                  {colTitle} · {done}/{tasks.length}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {tasks.map((task, idx) => (
                  <div key={task.id} className="group/task flex items-center gap-3 py-0.5">
                    <button
                      onClick={() =>
                        mutateTasks(colId, card.id, (ts) =>
                          ts.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)),
                        )
                      }
                      className="w-5 h-5 rounded-full flex items-center justify-center border-[1.5px] shrink-0 transition-all"
                      style={{
                        borderColor: task.completed ? accentColor : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
                        backgroundColor: task.completed ? accentColor : "transparent",
                      }}
                    >
                      {task.completed && <Check size={12} className="text-white" strokeWidth={3} />}
                    </button>
                    <input
                      value={task.text}
                      onChange={(e) =>
                        mutateTasks(colId, card.id, (ts) =>
                          ts.map((t) => (t.id === task.id ? { ...t, text: e.target.value } : t)),
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          mutateTasks(colId, card.id, (ts) => [...ts, { id: uid(), text: "", completed: false }]);
                        }
                      }}
                      placeholder="Nueva tarea..."
                      className="flex-1 bg-transparent border-none outline-none text-[13px] font-light leading-snug min-w-0 p-0"
                      style={{
                        color: task.completed ? mutedColor : textColor,
                        textDecoration: task.completed ? "line-through" : "none",
                        opacity: task.completed ? 0.7 : 1,
                      }}
                    />
                    <div className="flex items-center gap-1 shrink-0 opacity-0 pointer-events-none group-hover/task:opacity-100 group-hover/task:pointer-events-auto transition-opacity">
                      <button
                        onClick={() =>
                          mutateTasks(colId, card.id, (ts) => {
                            if (idx === 0) return ts;
                            const next = [...ts];
                            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                            return next;
                          })
                        }
                        className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-gray-400"
                        title="Subir"
                      >
                        <ArrowUp size={11} />
                      </button>
                      <button
                        onClick={() =>
                          mutateTasks(colId, card.id, (ts) => {
                            if (idx >= ts.length - 1) return ts;
                            const next = [...ts];
                            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                            return next;
                          })
                        }
                        className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-gray-400"
                        title="Bajar"
                      >
                        <ArrowDown size={11} />
                      </button>
                      <button
                        onClick={() => mutateTasks(colId, card.id, (ts) => ts.filter((t) => t.id !== task.id))}
                        className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-600"
                        title="Eliminar"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => mutateTasks(colId, card.id, (ts) => [...ts, { id: uid(), text: "", completed: false }])}
                className="flex items-center gap-2 py-2 px-3 rounded-xl border border-dashed transition-all text-left mt-1 w-full opacity-0 group-hover/card:opacity-100"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "#D1D5DB",
                  color: "#9CA3AF",
                  backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                }}
              >
                <Plus size={13} />
                <span className="text-[13px]">Nueva tarea</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default KanbanTaskGroup;
