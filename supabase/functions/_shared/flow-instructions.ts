// ============================================================================
// INSTRUCCIONES DE LA IA PARA GENERAR FLUJOS  (Miiles)
// ============================================================================
//
// ✏️  ESTE ES EL LUGAR PARA EDITAR CÓMO LA IA CREA FLUJOS, HACE PREGUNTAS Y
//     ENTIENDE LA INTENCIÓN DEL USUARIO.
//
// Se puede editar de DOS formas:
//   1) Por admins, en vivo, desde la página /admin → pestaña "Instrucciones IA"
//      (esas ediciones se guardan en la base de datos y tienen prioridad).
//   2) Por otra IA / un humano editando este archivo directamente en GitHub
//      (estos valores son los DEFAULTS; se usan si no hay override en la DB).
//
// Las tres funciones (generate-flow, clarify-flow, plan-flow) leen estas
// instrucciones y las añaden a su prompt de sistema en cada generación.
// ============================================================================

export type InstructionKey = "global" | "generate" | "clarify" | "plan" | "search";

// Instrucciones aplicadas SIEMPRE, en las tres etapas.
export const DEFAULT_GLOBAL = `Habla y piensa siempre en español neutro.
Piensa como un fundador/estratega de negocio: objetivos claros, acciones concretas, dueños y métricas.
NUNCA menciones bases de datos, prospectos almacenados ni de dónde sale la información.`;

// Instrucciones extra al GENERAR el flujo final (nodos + edges).
export const DEFAULT_GENERATE = `Prioriza claridad estructural y pasos accionables sobre relleno genérico.
Cada fase debe tener un objetivo y entregables concretos.`;

// Instrucciones extra al hacer PREGUNTAS de aclaración al usuario.
export const DEFAULT_CLARIFY = `Haz preguntas cortas, estratégicas y orientadas a objetivos.
Solo pide aclaración cuando el prompt sea realmente ambiguo.`;

// Instrucciones extra al PLANEAR la estrategia (fases) antes de construir.
export const DEFAULT_PLAN = `Define fases accionables, métricas y entregables concretos antes de construir el flujo.`;

// Instrucciones que controlan QUÉ y CUÁNDO buscar en vivo (web / prospectos reales).
// Esto guía al clasificador de intención: decide si hay que descubrir cuentas/negocios
// REALES y NUEVOS, en qué canal (instagram / google_maps) y con qué términos.
export const DEFAULT_SEARCH = `Busca prospectos REALES y NUEVOS solo cuando el usuario quiera DESCUBRIR cuentas, creadores, marcas o negocios (no cuando solo quiere un plan o estrategia).
Usa "instagram" para cuentas, creadores, marcas o perfiles; usa "google_maps" para negocios locales por nicho + ubicación.
Genera un "query" conciso, limpio y en el idioma del usuario; extrae la ubicación si la menciona.`;

const DEFAULTS: Record<InstructionKey, string> = {
  global: DEFAULT_GLOBAL,
  generate: DEFAULT_GENERATE,
  clarify: DEFAULT_CLARIFY,
  plan: DEFAULT_PLAN,
  search: DEFAULT_SEARCH,
};

/**
 * Carga las instrucciones combinadas (global + específicas de la etapa).
 * Lee primero el override de admins en la tabla `ai_instructions`; si no
 * existe, usa los DEFAULTS de este archivo.
 * Devuelve un bloque de texto listo para añadir al prompt de sistema.
 */
export async function loadInstructions(
  supabase: { from: (t: string) => any },
  stage: Exclude<InstructionKey, "global">,
): Promise<string> {
  let global = DEFAULTS.global;
  let stageText = DEFAULTS[stage];

  try {
    const { data } = await supabase
      .from("ai_instructions")
      .select("key, content")
      .in("key", ["global", stage]);
    for (const row of data ?? []) {
      if (row.key === "global" && row.content?.trim()) global = row.content;
      if (row.key === stage && row.content?.trim()) stageText = row.content;
    }
  } catch (_e) {
    // Si falla la lectura, seguimos con los defaults del archivo.
  }

  const parts = [global, stageText].filter((p) => p && p.trim());
  if (parts.length === 0) return "";
  return `\n\n=== INSTRUCCIONES PERSONALIZADAS DE MIILES (PRIORIDAD ALTA) ===\n${parts.join("\n\n")}\n=== FIN INSTRUCCIONES PERSONALIZADAS ===`;
}

/**
 * Carga el contenido CRUDO de una sola instrucción (sin formato de bloque).
 * Usa el override de admins si existe; si no, el DEFAULT del archivo.
 */
export async function loadInstruction(
  supabase: { from: (t: string) => any },
  key: InstructionKey,
): Promise<string> {
  let text = DEFAULTS[key];
  try {
    const { data } = await supabase
      .from("ai_instructions")
      .select("content")
      .eq("key", key)
      .maybeSingle();
    if (data?.content?.trim()) text = data.content;
  } catch (_e) {
    // fallback al default
  }
  return text;
}
