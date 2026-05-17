import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import {
  Plus, Trash2, ArrowUp, ArrowDown, Type, Eye, EyeOff, Minus, Check, Baseline,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import CornerResizer from "./CornerResizer";

export type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
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

const COLOR_PALETTE = [
  { name: "Blanco", value: "#FFFFFF" },
  { name: "Celeste", value: "#F0F7FF" },
  { name: "Verde Menta", value: "#ECFDF5" },
  { name: "Amarillo Nota", value: "#FEFCE8" },
  { name: "Gris Premium", value: "#F9FAFB" },
  { name: "Oscuro Elegante", value: "#1F2937" },
];

const ACCENT_PALETTE = [
  { name: "Negro Premium", value: "#111827" },
  { name: "Azul Miiles", value: "#4059F1" },
  { name: "Verde", value: "#10B981" },
  { name: "Naranja", value: "#F59E0B" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Violeta", value: "#8B5CF6" },
];

const TEXT_COLOR_PALETTE = [
  { name: "Negro", value: "#111827" },
  { name: "Gris", value: "#6B7280" },
  { name: "Azul", value: "#2563EB" },
  { name: "Verde", value: "#059669" },
  { name: "Rojo", value: "#DC2626" },
  { name: "Púrpura", value: "#7C3AED" },
  { name: "Blanco", value: "#FFFFFF" },
];

const TodoNode = ({ id, data, selected }: NodeProps) => {
  const { getNodes, setNodes } = useReactFlow();
  const selectedNodes = getNodes().filter((n) => n.selected);
  const isSingleSelected = selected && selectedNodes.length === 1;

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
  const backgroundColor = nodeData.backgroundColor ?? "#FFFFFF";
  const accentColor = nodeData.accentColor ?? "#111827";
  const isDarkMode = backgroundColor === "#1F2937";
  const textColor = nodeData.textColor ?? (isDarkMode ? "#FFFFFF" : "#1F2937");

  const [activePicker, setActivePicker] = useState<"bg" | "accent" | "text" | null>(null);
  const taskInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, taskId: string) => {
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
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor,
          color: isDarkMode ? "#F3F4F6" : "#1F2937",
          boxShadow: selected ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" : "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.02)",
        }}
        className={`w-full h-full rounded-2xl flex flex-col p-5 select-none transition-all duration-300 border ${
          selected ? "border-[#4059F1]/40" : "border-[#E5E7EB]"
        }`}
      >
        <CornerResizer isVisible={!!selected} minWidth={280} minHeight={200} />

      {/* ─── Floating Toolbar (selected node only) ─── */}
      <AnimatePresence>
        {isSingleSelected && (
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="flex items-center gap-1.5 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.14)] px-3 py-1.5 border border-[#E5E7EB] shrink-0"
            >
              {/* Show / Hide Title */}
              <button
                onClick={() => updateNodeData({ showTitle: !showTitle })}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  showTitle ? "bg-[#F3F4F6] text-[#4059F1]" : "hover:bg-[#F3F4F6] text-[#6B7280]"
                }`}
                title={showTitle ? "Ocultar Título" : "Mostrar Título"}
              >
                <Type size={13} className={showTitle ? "stroke-[2.5]" : "stroke-[2]"} />
              </button>

              {/* Show / Hide Subtitle */}
              <button
                onClick={() => updateNodeData({ showSubtitle: !showSubtitle })}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  showSubtitle ? "bg-[#F3F4F6] text-[#4059F1]" : "hover:bg-[#F3F4F6] text-[#6B7280]"
                }`}
                title={showSubtitle ? "Ocultar Subtítulo" : "Mostrar Subtítulo"}
              >
                {showSubtitle ? <Eye size={13} className="stroke-[2.5]" /> : <EyeOff size={13} />}
              </button>

              <div className="w-[1px] h-4 bg-[#E5E7EB] mx-1" />

              {/* Font Size Adjustments */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => updateNodeData({ fontSize: Math.max(10, fontSize - 1) })}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
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
                  className="nodrag nopan text-[11px] font-medium text-black w-6 text-center bg-transparent border-none outline-none focus:bg-neutral-100 rounded select-all py-0.5 font-sans"
                />
                <button
                  onClick={() => updateNodeData({ fontSize: Math.min(200, fontSize + 1) })}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
                  title="Aumentar letra"
                >
                  <Plus size={11} strokeWidth={2.5} />
                </button>
              </div>

              <div className="w-[1px] h-4 bg-[#E5E7EB] mx-1" />

              {/* Background Color Picker */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePicker(activePicker === "bg" ? null : "bg");
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors gap-1"
                  title="Fondo del Todo"
                >
                  <div
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor }}
                  />
                </button>
                {activePicker === "bg" && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.18)] p-2.5 flex gap-1.5 border border-[#E5E7EB] z-50">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          updateNodeData({ backgroundColor: c.value });
                          setActivePicker(null);
                        }}
                        className="w-5.5 h-5.5 rounded-full border border-gray-200 hover:scale-110 transition-transform flex items-center justify-center"
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      >
                        {backgroundColor === c.value && (
                          <Check size={10} className={c.value === "#1F2937" ? "text-white" : "text-gray-800"} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Accent Color Picker */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePicker(activePicker === "accent" ? null : "accent");
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors"
                  title="Color de Acento"
                >
                  <div
                    className="w-4 h-4 rounded-md border border-gray-200 rotate-45"
                    style={{ backgroundColor: accentColor }}
                  />
                </button>
                {activePicker === "accent" && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.18)] p-2.5 flex gap-1.5 border border-[#E5E7EB] z-50">
                    {ACCENT_PALETTE.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          updateNodeData({ accentColor: c.value });
                          setActivePicker(null);
                        }}
                        className="w-5.5 h-5.5 rounded-lg border border-gray-200 hover:scale-110 transition-transform flex items-center justify-center"
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      >
                        {accentColor === c.value && <Check size={10} className="text-white" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Text Color Picker */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePicker(activePicker === "text" ? null : "text");
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors"
                  title="Color del Texto"
                >
                  <Baseline size={13} style={{ color: textColor }} className="stroke-[2.5]" />
                </button>
                {activePicker === "text" && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.18)] p-2.5 flex gap-1.5 border border-[#E5E7EB] z-50">
                    {TEXT_COLOR_PALETTE.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          updateNodeData({ textColor: c.value });
                          setActivePicker(null);
                        }}
                        className="w-5.5 h-5.5 rounded-full border border-gray-200 hover:scale-110 transition-transform flex items-center justify-center"
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      >
                        {textColor === c.value && (
                          <Check size={10} className={c.value === "#FFFFFF" ? "text-gray-800" : "text-white"} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Headers (Title & Subtitle) ─── */}
      <div className="flex flex-col gap-1.5 select-text mb-4">
        {showTitle && (
          <input
            value={title}
            onChange={(e) => updateNodeData({ title: e.target.value })}
            className="bg-transparent font-sans font-semibold focus:outline-none border-none p-0 w-full placeholder-gray-400"
            placeholder="Título de la Lista"
            style={{
              fontSize: `${fontSize * 1.3}px`,
              color: textColor,
            }}
          />
        )}
        {showSubtitle && (
          <input
            value={subtitle}
            onChange={(e) => updateNodeData({ subtitle: e.target.value })}
            className="bg-transparent font-sans font-light focus:outline-none border-none p-0 w-full placeholder-gray-400"
            placeholder="Añade un subtítulo descriptivo..."
            style={{
              fontSize: `${fontSize * 0.95}px`,
              color: textColor === "#1F2937" || textColor === "#111827"
                ? (isDarkMode ? "#9CA3AF" : "#6B7280")
                : `${textColor}cc`,
            }}
          />
        )}
      </div>

      {/* ─── Task List Content Area ─── */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="group/item flex items-center gap-3 py-1.5 px-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 select-text"
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggleTask(task.id)}
                className="w-5 h-5 rounded-md flex items-center justify-center border-[1.5px] border-solid transition-all shrink-0 duration-200"
                style={{
                  borderColor: task.completed ? (isDarkMode ? "#FFFFFF" : "#111827") : (isDarkMode ? "#6B7280" : "#9CA3AF"),
                  backgroundColor: task.completed ? (isDarkMode ? "#FFFFFF" : "#111827") : "transparent",
                }}
              >
                {task.completed && <Check size={12} className={`${isDarkMode ? "text-gray-900" : "text-white"} stroke-[3.5]`} />}
              </button>

              {/* Task Text Input & Custom Animated Strikethrough */}
              <div className="relative flex-1 flex items-center select-text">
                <input
                  ref={(el) => (taskInputRefs.current[task.id] = el)}
                  value={task.text}
                  onChange={(e) => handleTaskTextChange(task.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, task.id)}
                  placeholder="Añadir una tarea..."
                  className="bg-transparent w-full focus:outline-none border-none font-sans font-light focus:ring-0 placeholder-gray-400/80 leading-normal"
                  style={{
                    fontSize: `${fontSize}px`,
                    color: task.completed
                      ? isDarkMode ? "#6B7280" : "#9CA3AF"
                      : textColor,
                    opacity: task.completed ? 0.7 : 1,
                  }}
                />
                {task.completed && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] pointer-events-none"
                    style={{ backgroundColor: isDarkMode ? "#6B7280" : "#9CA3AF" }}
                  />
                )}
              </div>

              {/* Task Row Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <button
                  onClick={() => handleMoveTask(task.id, "up")}
                  className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Subir"
                >
                  <ArrowUp size={11} />
                </button>
                <button
                  onClick={() => handleMoveTask(task.id, "down")}
                  className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Bajar"
                >
                  <ArrowDown size={11} />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Task Button at bottom of list */}
        <button
          onClick={() => handleAddTask()}
          className="flex items-center gap-2 py-2 px-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left mt-1 shrink-0"
          style={{ fontSize: `${fontSize * 0.9}px` }}
        >
          <Plus size={13} />
          <span>Nueva Tarea...</span>
        </button>
      </div>
      </div>

      {/* ─── Fully Bidirectional Connection Handles ─── */}
      {(["top", "bottom", "left", "right"] as const).map((pos) => (
        <Handle
          key={pos}
          type="source"
          position={
            pos === "top" ? Position.Top :
            pos === "bottom" ? Position.Bottom :
            pos === "left" ? Position.Left : Position.Right
          }
          id={pos}
          className={`${HANDLE_CLASS} ${selected ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
        />
      ))}
    </motion.div>
  );
};

export default memo(TodoNode);
