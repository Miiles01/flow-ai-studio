import { memo, useState, useRef, useEffect, forwardRef } from "react";
import { Handle, Position, type NodeProps, NodeResizer, useReactFlow, useViewport } from "@xyflow/react";
import {
  Plus, Trash2, ArrowUp, ArrowDown, Minus, Check, Heading1, Heading2, Square,
} from "lucide-react";
import NodeExtendHandles from "@/components/nodes/NodeExtendHandles";
import WidgetCommentSlot from "@/components/nodes/WidgetCommentSlot";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

export type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
  /** Información adicional generada por la IA, normalmente oculta al usuario. */
  note?: string;
};

export type TodoNodeData = {
  title?: string;
  showTitle?: boolean;
  subtitle?: string;
  showSubtitle?: boolean;
  tasks?: TodoItem[];
  fontSize?: number;
  backgroundColor?: string;
  accentColor?: string;
  textColor?: string;
};

const HANDLE_CLASS =
  "!w-[10px] !h-[10px] !rounded-full !bg-white !border-[1.5px] !border-[#4059F1] transition-all duration-200 hover:!bg-[#4059F1] before:absolute before:-inset-3 before:content-[''] !z-[10000] pointer-events-auto";

const RAINBOW_COLORS = [
  { name: "Transparente", value: "transparent" },
  { name: "Rojo", value: "#EF4444" },
  { name: "Naranja", value: "#F97316" },
  { name: "Amarillo", value: "#FACC15" },
  { name: "Verde", value: "#22C55E" },
  { name: "Azul", value: "#4059F1" },
  { name: "Morado", value: "#A855F7" },
  { name: "Rosa", value: "#FCB5B9" },
  { name: "Blanco", value: "#FFFFFF" },
  { name: "Negro", value: "#1F2937" },
];

interface AutoResizingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
}

const AutoResizingTextarea = forwardRef<HTMLTextAreaElement, AutoResizingTextareaProps>(
  ({ value, onChange, className, style, rows = 1, ...props }, ref) => {
    const localRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
      const el = localRef.current;
      if (el) {
        el.style.height = "auto";
        const nextHeight = `${el.scrollHeight}px`;
        if (el.style.height !== nextHeight) el.style.height = nextHeight;
      }
    };

    // Sincroniza localRef con el ref prop de React
    useEffect(() => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(localRef.current);
      } else {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = localRef.current;
      }
    }, [ref]);

    useEffect(() => {
      adjustHeight();
    }, [value]);

    useEffect(() => {
      const el = localRef.current;
      if (!el) return;
      let frame = 0;
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(adjustHeight);
      });
      observer.observe(el);
      return () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
      };
    }, []);

    return (
      <textarea
        ref={localRef}
        value={value}
        onChange={(e) => {
          onChange?.(e);
          adjustHeight();
        }}
        className={`${className} resize-none overflow-hidden`}
        rows={rows}
        style={style}
        {...props}
      />
    );
  }
);
AutoResizingTextarea.displayName = "AutoResizingTextarea";

const isWhite = (c?: string) => {
  const v = (c || "").trim().toLowerCase();
  return v === "#ffffff" || v === "white" || v === "#fff" || v === "#fafafa" || v === "#f3f4f6";
};

const TodoNode = ({ id, data, selected }: NodeProps) => {
  const { getNodes, setNodes } = useReactFlow();
  const selectedNodes = getNodes().filter((n) => n.selected);
  const isSingleSelected = selected && selectedNodes.length === 1;
  const { isDark } = useTheme();
  const { zoom } = useViewport();

  const nodeData = data as TodoNodeData;
  const showTitle = nodeData.showTitle ?? true;
  const showSubtitle = nodeData.showSubtitle ?? true;
  const title = nodeData.title ?? "Lista de Tareas";
  const subtitle = nodeData.subtitle ?? "Organiza tus actividades diarias";
  const tasks = nodeData.tasks ?? [
    { id: "t1", text: "Definir objetivos de diseño", completed: false },
    { id: "t2", text: "Diseñar wireframes responsivos", completed: false },
    { id: "t3", text: "Validar prototipos con usuarios", completed: false },
  ];
  const fontSize = nodeData.fontSize ?? 14;

  // Reacción dinámica en modo oscuro: si tiene fondo blanco por defecto, se pone oscuro (#2C2C2E).
  const rawFill = nodeData.backgroundColor ?? (isDark ? "#2C2C2E" : "#FFFFFF");
  const backgroundColor = isDark && isWhite(rawFill) ? "#2C2C2E" : rawFill;
  const accentColor = nodeData.accentColor ?? "#4059F1";

  // Calculamos automáticamente si el fondo del widget requiere texto blanco para alto contraste
  const isBoardDark = (() => {
    const v = (backgroundColor || "").trim().toLowerCase();
    if (!v || v === "transparent") return isDark;
    // Oscuros / saturados → texto blanco
    if (
      v === "#ef4444" || v === "#f97316" ||
      v === "#4059f1" || v === "#2563eb" ||
      v === "#a855f7" ||
      v === "#1f2937" || v === "#111827" ||
      v === "#2c2c2e" || v === "#1c1c1e" ||
      v === "#000000" || v === "black"
    ) return true;
    // Claros → texto negro
    if (
      v === "#facc15" || v === "#22c55e" || v === "#fcb5b9" ||
      v === "#ffffff" || v === "white" || v === "#fafafa" || v === "#f3f4f6"
    ) return false;
    // Cálculo de luminancia para cualquier otro color
    if (v.startsWith("#") && (v.length === 7 || v.length === 4)) {
      const hex = v.length === 4
        ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`
        : v;
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return lum < 0.55;
    }
    return isDark;
  })();

  const boardTextColor = isBoardDark ? "#FFFFFF" : "#111827";

  const [activePicker, setActivePicker] = useState<"bg" | null>(null);
  const taskInputRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const updateNodeData = (newData: Partial<TodoNodeData>) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...newData } } : n))
    );
  };

  // Task Actions
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    updateNodeData({ tasks: updatedTasks });
  };

  const handleTaskTextChange = (taskId: string, newText: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, text: newText } : t
    );
    updateNodeData({ tasks: updatedTasks });
  };

  const handleAddTask = (afterId?: string) => {
    const newId = `task-${Date.now()}`;
    const newTask: TodoItem = { id: newId, text: "", completed: false };

    let updatedTasks: TodoItem[];
    if (afterId) {
      const idx = tasks.findIndex((t) => t.id === afterId);
      updatedTasks = [...tasks];
      updatedTasks.splice(idx + 1, 0, newTask);
    } else {
      updatedTasks = [...tasks, newTask];
    }

    updateNodeData({ tasks: updatedTasks });

    // Focus newly created task on next tick
    setTimeout(() => {
      taskInputRefs.current[newId]?.focus();
    }, 50);
  };

  const handleDeleteTask = (taskId: string) => {
    const idx = tasks.findIndex((t) => t.id === taskId);
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    updateNodeData({ tasks: updatedTasks });

    // Focus previous task if available
    if (idx > 0 && tasks[idx - 1]) {
      setTimeout(() => {
        taskInputRefs.current[tasks[idx - 1].id]?.focus();
      }, 50);
    }
  };

  const handleMoveTask = (taskId: string, direction: "up" | "down") => {
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === tasks.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const updatedTasks = [...tasks];
    const [moved] = updatedTasks.splice(idx, 1);
    updatedTasks.splice(targetIdx, 0, moved);
    updateNodeData({ tasks: updatedTasks });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, taskId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTask(taskId);
    } else if (e.key === "Backspace") {
      const currentTask = tasks.find((t) => t.id === taskId);
      if (currentTask && currentTask.text === "") {
        e.preventDefault();
        handleDeleteTask(taskId);
      }
    }
  };

  // Color selection close helpers
  useEffect(() => {
    const handleOutsideClick = () => setActivePicker(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        width: "100%",
        height: "100%",
      }}
      className="relative w-full h-full"
    >
      <div className="absolute top-0 left-1/2 z-20 h-5 w-28 -translate-x-1/2 cursor-grab rounded-b-xl active:cursor-grabbing" title="Mover widget">
        <div className={`mx-auto mt-1.5 h-1.5 w-8 rounded-full opacity-0 transition-opacity group-hover/widget:opacity-100 ${isBoardDark ? "bg-white/40" : "bg-black/20"}`} />
      </div>

      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor,
          color: boardTextColor,
          boxShadow: selected ? "0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04)" : "0 4px 12px -1px rgba(0,0,0,0.015), 0 2px 4px -1px rgba(0,0,0,0.01)",
        }}
        className={`w-full h-full rounded-2xl flex flex-col p-5 select-none transition-all duration-300 border group/widget ${
          selected ? "border-[#4059F1]/50 ring-2 ring-[#4059F1]/20" : (isBoardDark ? "border-white/10" : "border-[#E5E7EB]")
        }`}
      >
        <NodeResizer isVisible={!!isSingleSelected} minWidth={280} minHeight={200} lineStyle={{ border: "none" }} />

        {/* ─── Floating Toolbar (selected node only) ─── */}
        <AnimatePresence>
          {isSingleSelected && (
            <div
              className="absolute -top-16 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto node-floating-toolbar"
              style={{
                whiteSpace: "nowrap",
                transform: `translate(-50%, 0) scale(${1 / zoom})`,
                transformOrigin: "bottom center",
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className={`flex items-center gap-1.5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] px-3 py-1.5 shrink-0 border ${isDark ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-[#E5E7EB]'}`}
              >
                {/* Show / Hide Title — H1 */}
                <button
                  onClick={() => updateNodeData({ showTitle: !showTitle })}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                    showTitle 
                      ? (isDark ? "bg-white/10 text-white" : "bg-[#F3F4F6] text-[#4059F1]") 
                      : (isDark ? "hover:bg-white/10 text-white/60 hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280]")
                  }`}
                  title={showTitle ? "Ocultar Título" : "Mostrar Título"}
                >
                  <Heading1 size={13} strokeWidth={showTitle ? 2.5 : 2} />
                </button>

                {/* Show / Hide Subtitle — H2 */}
                <button
                  onClick={() => updateNodeData({ showSubtitle: !showSubtitle })}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                    showSubtitle 
                      ? (isDark ? "bg-white/10 text-white" : "bg-[#F3F4F6] text-[#4059F1]") 
                      : (isDark ? "hover:bg-white/10 text-white/60 hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280]")
                  }`}
                  title={showSubtitle ? "Ocultar Subtítulo" : "Mostrar Subtítulo"}
                >
                  <Heading2 size={13} strokeWidth={showSubtitle ? 2.5 : 2} />
                </button>

                <div className={`w-[1px] h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />

                {/* Font Size Adjustments */}
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => updateNodeData({ fontSize: Math.max(10, fontSize - 1) })}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-[#F3F4F6] text-[#6B7280]'}`}
                    title="Reducir letra"
                  >
                    <Minus size={11} strokeWidth={2.5} />
                  </button>
                  <input
                    type="text"
                    value={fontSize === 0 ? "" : fontSize}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        updateNodeData({ fontSize: 0 });
                        return;
                      }
                      const num = parseInt(val, 10);
                      if (!isNaN(num)) {
                        updateNodeData({ fontSize: Math.min(200, num) });
                      }
                    }}
                    onBlur={() => {
                      updateNodeData({ fontSize: Math.max(10, fontSize || 14) });
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                    }}
                    className={`nodrag nopan text-[11px] font-medium w-6 text-center bg-transparent border-none outline-none rounded select-all py-0.5 font-sans ${isDark ? 'text-white focus:bg-white/10' : 'text-black focus:bg-neutral-100'}`}
                  />
                  <button
                    onClick={() => updateNodeData({ fontSize: Math.min(200, fontSize + 1) })}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-[#F3F4F6] text-[#6B7280]'}`}
                    title="Aumentar letra"
                  >
                    <Plus size={11} strokeWidth={2.5} />
                  </button>
                </div>

                <div className={`w-[1px] h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />

                {/* Background Color Picker */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePicker(activePicker === "bg" ? null : "bg");
                    }}
                    className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors relative ${isDark ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-[#F3F4F6] text-[#6B7280]'}`}
                    title="Color de fondo"
                  >
                    <Square size={13} className="text-[#6B7280]" />
                    <div
                      className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white overflow-hidden shadow-xs"
                      style={{ backgroundColor: backgroundColor === "transparent" ? "white" : (backgroundColor || "#FAFAFA") }}
                    >
                      {backgroundColor === "transparent" && (
                        <div className="absolute w-full h-[1px] bg-red-500 rotate-45" style={{ top: "45%" }} />
                      )}
                    </div>
                  </button>
                  {activePicker === "bg" && (
                    <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-2.5 grid grid-cols-5 gap-1.5 z-50 w-[150px] ${isDark ? 'bg-[#1C1C1E] border border-white/10' : 'bg-white border border-gray-100'}`}>
                      {RAINBOW_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => {
                            updateNodeData({ backgroundColor: c.value });
                            setActivePicker(null);
                          }}
                          className="w-6 h-6 rounded-full border border-gray-200/60 transition-transform hover:scale-110 flex items-center justify-center overflow-hidden relative shadow-sm cursor-pointer"
                          style={{ backgroundColor: c.value === "transparent" ? "white" : c.value }}
                          title={c.name}
                        >
                          {c.value === "transparent" && <div className="absolute w-full h-[1.5px] bg-red-500 rotate-45" />}
                          {backgroundColor === c.value && c.value !== "transparent" && (
                            <Check size={10} className={c.value === "#FFFFFF" || c.value === "#FACC15" || c.value === "#FCB5B9" ? "text-gray-800" : "text-white"} strokeWidth={2.5} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delete node */}
                <button
                  onClick={() => setNodes((nds) => nds.filter((n) => n.id !== id))}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-[#9CA3AF] hover:text-[#EF4444]' : 'hover:bg-[#FEE2E2] text-[#9CA3AF] hover:text-[#EF4444]'}`}
                  title="Eliminar"
                >
                  <Trash2 size={13} strokeWidth={2} />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ─── Headers (Title & Subtitle) ─── */}
        <div className="flex flex-col gap-1.5 select-text mb-4">
          {showTitle && (
            <AutoResizingTextarea
              value={title}
              onChange={(e) => updateNodeData({ title: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              className={`bg-transparent font-sans font-semibold focus:outline-none border-none p-0 w-full whitespace-pre-wrap break-words resize-none overflow-hidden ${
                isBoardDark ? "placeholder:text-white/45" : "placeholder:text-black/35"
              }`}
              placeholder="Título de la Lista"
              style={{
                fontSize: `${fontSize * 1.3}px`,
                color: boardTextColor,
                lineHeight: 1.25,
              }}
            />
          )}
          {showSubtitle && (
            <AutoResizingTextarea
              value={subtitle}
              onChange={(e) => updateNodeData({ subtitle: e.target.value })}
              className={`bg-transparent font-sans font-normal focus:outline-none border-none p-0 w-full whitespace-pre-wrap break-words resize-none overflow-hidden ${
                isBoardDark ? "placeholder:text-white/45 text-white/90" : "placeholder:text-black/35 text-neutral-700"
              }`}
              placeholder="Añade un subtítulo descriptivo..."
              style={{
                fontSize: `${fontSize * 0.95}px`,
                color: boardTextColor,
                lineHeight: 1.3,
              }}
            />
          )}
        </div>

        {/* ─── Task List Content Area ─── */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2 todo-scrollbar">
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={`group/item flex items-start gap-3 py-1.5 px-2 rounded-xl transition-all duration-200 select-text ${
                  isBoardDark ? "hover:bg-white/10" : "hover:bg-black/5"
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className={`w-5 h-5 rounded-full flex items-center justify-center border-[1.5px] border-solid transition-all shrink-0 duration-200 mt-[3px] ${
                    task.completed
                      ? ""
                      : isBoardDark
                      ? "bg-white/10 border-white/30 hover:border-white/50 hover:bg-white/15"
                      : "bg-black/[0.04] border-black/20 hover:border-black/40 hover:bg-black/[0.06]"
                  }`}
                  style={{
                    borderColor: task.completed
                      ? (accentColor && accentColor !== "transparent" ? accentColor : "#4059F1")
                      : undefined,
                    backgroundColor: task.completed
                      ? (accentColor && accentColor !== "transparent" ? accentColor : "#4059F1")
                      : undefined,
                  }}
                >
                  {task.completed && (
                    <Check
                      size={12}
                      className={`${
                        (accentColor && accentColor !== "transparent" ? (accentColor === "#FFFFFF" || accentColor === "#FACC15" || accentColor === "#FCB5B9") : false)
                          ? "text-gray-900"
                          : "text-white"
                      } stroke-[3.5]`}
                    />
                  )}
                </button>

                {/* Task Text Input */}
                <div className="relative flex-1 min-w-0 select-text">
                  <AutoResizingTextarea
                    ref={(el) => (taskInputRefs.current[task.id] = el)}
                    value={task.text}
                    onChange={(e) => handleTaskTextChange(task.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, task.id)}
                    placeholder="Añadir una tarea..."
                    className={`bg-transparent w-full focus:outline-none border-none font-sans font-light focus:ring-0 leading-normal p-0 whitespace-pre-wrap break-words resize-none overflow-hidden ${
                      isBoardDark ? "placeholder:text-white/40" : "placeholder:text-black/35"
                    }`}
                    style={{
                      fontSize: `${fontSize}px`,
                      color: task.completed
                        ? (isBoardDark ? "rgba(255,255,255,0.45)" : "rgba(17,24,39,0.45)")
                        : boardTextColor,
                      opacity: task.completed ? 0.75 : 1,
                      textDecoration: task.completed ? "line-through" : "none",
                    }}
                  />
                </div>

                {/* Task Row Actions */}
                <div className="hidden group-hover/item:flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveTask(task.id, "up")}
                    className={`p-1 rounded-md transition-colors ${
                      isBoardDark ? "hover:bg-white/15 text-white/60 hover:text-white" : "hover:bg-black/10 text-neutral-500 hover:text-neutral-900"
                    }`}
                    title="Subir"
                  >
                    <ArrowUp size={11} />
                  </button>
                  <button
                    onClick={() => handleMoveTask(task.id, "down")}
                    className={`p-1 rounded-md transition-colors ${
                      isBoardDark ? "hover:bg-white/15 text-white/60 hover:text-white" : "hover:bg-black/10 text-neutral-500 hover:text-neutral-900"
                    }`}
                    title="Bajar"
                  >
                    <ArrowDown size={11} />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className={`p-1 rounded-md transition-colors ${
                      isBoardDark ? "hover:bg-red-500/20 text-white/60 hover:text-red-400" : "hover:bg-red-50 text-neutral-500 hover:text-red-600"
                    }`}
                    title="Eliminar"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Task Button at bottom of list */}
        {selected && (
          <button
            onClick={() => handleAddTask()}
            className={`flex items-center gap-2 py-2 px-3 rounded-xl border border-dashed transition-all text-left mt-2 shrink-0 ${
              isBoardDark
                ? "border-white/20 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10"
                : "border-neutral-300 text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 hover:bg-black/5"
            }`}
            style={{ fontSize: `${fontSize * 0.9}px` }}
          >
            <Plus size={13} />
            <span>Nueva Tarea...</span>
          </button>
        )}
      </div>

      {/* ─── Fully Bidirectional Connection Handles ─── */}
      {(["top", "bottom", "left", "right"] as const).map((pos) => {
        const position =
          pos === "top" ? Position.Top :
          pos === "bottom" ? Position.Bottom :
          pos === "left" ? Position.Left : Position.Right;
        const className = `${HANDLE_CLASS} ${isSingleSelected ? "opacity-100" : "opacity-0 pointer-events-none"}`;

        return (
          <div key={pos}>
            <Handle
              type="target"
              position={position}
              id={pos}
              className={className}
            />
            <Handle
              type="source"
              position={position}
              id={pos}
              className={className}
            />
          </div>
        );
      })}

      <NodeExtendHandles nodeId={id} />
      <WidgetCommentSlot nodeId={id} />
    </motion.div>
  );
};

export default memo(TodoNode);
