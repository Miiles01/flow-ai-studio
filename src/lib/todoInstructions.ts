// Convierte una lista de tareas (TodoNode) en instrucciones bien estructuradas
// listas para pegar en una IA externa (Gemini, Claude, ChatGPT, etc.).

export type TodoTaskLike = {
  id: string;
  text: string;
  completed: boolean;
  /** Información adicional generada por la IA, normalmente oculta al usuario. */
  note?: string;
};

export type TodoListLike = {
  title?: string;
  subtitle?: string;
  tasks?: TodoTaskLike[];
};

const GENERIC_WORDS = new Set([
  "hacer", "tarea", "cosa", "cosas", "pendiente", "revisar", "ver", "mejorar",
  "arreglar", "crear", "hacer", "diseñar", "definir", "validar", "investigar",
]);

/**
 * Heurística para decidir si una tarea está "bien redactada" (específica) o es
 * demasiado genérica y necesita una indicación adicional para que una IA la
 * entienda y pueda ejecutarla.
 */
function isVague(text: string): boolean {
  const clean = text.trim();
  if (!clean) return true;
  const words = clean.split(/\s+/).filter(Boolean);
  // Muy corta -> genérica
  if (words.length <= 3) return true;
  // Sin ningún detalle concreto (números, nombres propios, comillas, urls...)
  const hasSpecifics = /[0-9]|"|'|https?:\/\/|@|#|[A-ZÁÉÍÓÚ][a-záéíóú]{2,}/.test(clean);
  if (!hasSpecifics && words.length <= 6) return true;
  // Empieza con un verbo genérico y es corta
  const first = words[0]?.toLowerCase().replace(/[^a-záéíóú]/gi, "");
  if (GENERIC_WORDS.has(first) && words.length <= 5) return true;
  return false;
}

function guidanceFor(text: string): string {
  return (
    `Esta tarea es algo genérica. Antes de ejecutarla, define el contexto, ` +
    `el resultado esperado, el formato de entrega y los criterios para ` +
    `considerarla completada. Si falta información, indícalo y propón ` +
    `supuestos razonables.`
  );
}

export type BuildOptions = {
  /** Si es true, incluye también las tareas ya completadas. */
  includeCompleted?: boolean;
  /** Solo estas tareas (por id). Si no se pasa, se incluyen todas. */
  onlyIds?: string[];
};

/**
 * Construye un texto de instrucciones en Markdown a partir de una lista de tareas.
 */
export function buildTasksInstructions(
  list: TodoListLike,
  options: BuildOptions = {}
): string {
  const title = (list.title ?? "Lista de Tareas").trim();
  const subtitle = (list.subtitle ?? "").trim();

  let tasks = (list.tasks ?? []).filter((t) => t.text.trim().length > 0);
  if (options.onlyIds && options.onlyIds.length > 0) {
    const set = new Set(options.onlyIds);
    tasks = tasks.filter((t) => set.has(t.id));
  }
  if (!options.includeCompleted) {
    tasks = tasks.filter((t) => !t.completed);
  }

  const lines: string[] = [];

  lines.push(`# ${title}`);
  if (subtitle) lines.push(`> ${subtitle}`);
  lines.push("");
  lines.push(
    "Eres un asistente de IA. A continuación tienes una lista de tareas que " +
      "necesito que ejecutes o me ayudes a completar. Trabaja cada tarea en " +
      "orden, explica brevemente tu razonamiento y entrega un resultado claro " +
      "y accionable para cada una."
  );
  lines.push("");

  if (tasks.length === 0) {
    lines.push("_(No hay tareas pendientes en esta lista.)_");
    return lines.join("\n");
  }

  lines.push("## Tareas");
  lines.push("");

  tasks.forEach((task, i) => {
    const status = task.completed ? " (completada)" : "";
    lines.push(`${i + 1}. ${task.text.trim()}${status}`);
    if (task.note && task.note.trim()) {
      lines.push(`   - Detalle: ${task.note.trim()}`);
    } else if (isVague(task.text)) {
      lines.push(`   - Indicación: ${guidanceFor(task.text)}`);
    }
  });

  lines.push("");
  lines.push("## Cómo responder");
  lines.push(
    "- Resuelve las tareas una por una, en el mismo orden numerado.\n" +
      "- Para cada tarea entrega los pasos concretos o el contenido final.\n" +
      "- Si alguna tarea es ambigua, indícalo y propón la mejor interpretación.\n" +
      "- Al final, incluye un breve resumen de lo realizado."
  );

  return lines.join("\n");
}

/** Una categoría del panel lateral (una Pizarra, o "Otras tareas"). */
export type TaskCategory = {
  /** Nombre de la categoría: nombre de la Pizarra u "Otras tareas". */
  name: string;
  /** Listas dentro de la categoría (tarjetas del tablero o listas sueltas). */
  lists: TodoListLike[];
};

/**
 * Construye instrucciones en Markdown agrupadas por categorías
 * (Pizarras primero, "Otras tareas" al final).
 */
export function buildCategorizedTasksInstructions(
  categories: TaskCategory[],
  options: BuildOptions = {}
): string {
  const blocks: string[] = [];
  for (const cat of categories) {
    const lists = cat.lists.filter((l) => (l.tasks ?? []).length > 0);
    if (lists.length === 0) continue;
    const inner = lists
      .map((l) => buildTasksInstructions(l, options))
      .join("\n\n");
    blocks.push(`# Categoría: ${cat.name}\n\n${inner}`);
  }
  if (blocks.length === 0) return "_(No hay tareas pendientes.)_";
  return blocks.join("\n\n---\n\n");
}

/** Descarga un texto como archivo en el navegador. */

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
