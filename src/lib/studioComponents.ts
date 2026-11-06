import repoComponents from "@/data/studio-components.json";
import i18n from "@/i18n";

// Componentes del Estudio: animaciones de video (y otros assets) que se copian como prompt para pegarlo en tu IA.
// El video de vista previa y el archivo de código se sirven desde wearemiiles.com para que miiles.app no cargue su peso.
export type StudioComponent = {
  slug: string;
  title: string;
  category: string; // uno de COMPONENT_CATEGORIES (Carrusel, Galería, Texto, Elemento, Transición)
  description: string;
  preview_video_url: string; // formato vertical 9:16
  poster_url?: string | null;
  code_url: string; // archivo con el código (se descarga y va dentro del prompt)
  code_filename: string;
  stack?: string; // p. ej. "Remotion + React"
  instruction: string; // instrucción breve que va antes del código en el prompt
  customize: string[];
  faq?: { q: string; a: string }[];
};

export const STUDIO_COMPONENTS = repoComponents as StudioComponent[];

/** Categorías para los filtros, en este orden (solo se muestran las que tienen componentes). */
export const COMPONENT_CATEGORIES: { id: string; es: string; en: string }[] = [
  { id: "Carrusel", es: "Carruseles", en: "Carousels" },
  { id: "Galería", es: "Galerías", en: "Galleries" },
  { id: "Texto", es: "Texto", en: "Text" },
  { id: "Elemento", es: "Elementos", en: "Elements" },
  { id: "Transición", es: "Transiciones", en: "Transitions" },
];

/**
 * Trae el código del componente. Primero desde la misma app (public/studio-code/): así no
 * depende de que wearemiiles permita CORS; si no está ahí, lo intenta en wearemiiles.
 */
const codeCache = new Map<string, Promise<string>>();
export function fetchComponentCode(c: StudioComponent): Promise<string> {
  const cached = codeCache.get(c.slug);
  if (cached) return cached;
  const file = c.code_url.split("/").pop() ?? "";
  const get = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo cargar el código (${res.status})`);
    return res.text();
  };
  const p = get(`/studio-code/${file}`).catch(() => get(c.code_url));
  p.catch(() => codeCache.delete(c.slug));
  codeCache.set(c.slug, p);
  return p;
}

/** Copia texto al portapapeles; si el navegador lo bloquea (p. ej. dentro de un iframe), usa un textarea. */
export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    if (!ok) throw new Error("No se pudo copiar");
  }
}

/** Prompt listo para pegar: instrucción breve + el código completo. */
export function buildComponentPrompt(c: StudioComponent, code: string): string {
  const en = (i18n.language || "es").startsWith("en");
  const head = en
    ? `Implement this video animation ("${c.title}") in my project${c.stack ? ` (${c.stack})` : ""}. ${c.instruction}\nKeep the timing and easing; adapt texts, colors and sizes to what I ask you.`
    : `Implementa esta animación de video («${c.title}») en mi proyecto${c.stack ? ` (${c.stack})` : ""}. ${c.instruction}\nRespeta los tiempos y las curvas de movimiento; adapta textos, colores y tamaños a lo que te pida.`;
  return `${head}\n\n\`\`\`${c.code_filename.split(".").pop() || ""}\n// ${c.code_filename}\n${code.trim()}\n\`\`\`\n`;
}
