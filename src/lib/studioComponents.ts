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
  const file = c.code_filename;
  const head = en
    ? `Implement this video animation ("${c.title}") in my project${c.stack ? ` (${c.stack})` : ""}.\n` +
      `Steps:\n` +
      `1. If I don't have a Remotion project, create one with \`npx create-video@latest --blank\`.\n` +
      `2. Save the code below exactly as it is in src/${file}. Do not rewrite or simplify it: the animation depends on its exact timing and math.\n` +
      `3. Register it in src/Root.tsx with a <Composition> of 1080×1920 at 30 fps (the "how to use" block in the code says which props and duration to use).\n` +
      `4. Check it first without changes with \`npx remotion studio\`: the example photos, icons and fonts load from wearemiiles.com, so it works as is.\n` +
      `5. Then replace the examples with my texts and photos (put my files in public/ and use their path, e.g. "photos/mine.jpg").\n` +
      `${c.instruction}\nKeep the timing and easing; adapt texts, colors and sizes to what I ask you.`
    : `Implementa esta animación de video («${c.title}») en mi proyecto${c.stack ? ` (${c.stack})` : ""}.\n` +
      `Pasos:\n` +
      `1. Si no tengo un proyecto de Remotion, créalo con \`npx create-video@latest --blank\`.\n` +
      `2. Guarda el código de abajo tal cual en src/${file}. No lo reescribas ni lo simplifiques: la animación depende de sus tiempos y cálculos exactos.\n` +
      `3. Regístralo en src/Root.tsx con una <Composition> de 1080×1920 a 30 fps (el bloque «Cómo usar este componente» del código dice qué props y qué duración usar).\n` +
      `4. Pruébalo primero sin cambios con \`npx remotion studio\`: las fotos, íconos y tipografías de ejemplo cargan desde wearemiiles.com, así que funciona tal cual.\n` +
      `5. Después cambia los ejemplos por mis textos y fotos (pon mis archivos en public/ y usa su ruta, p. ej. "fotos/mia.jpg").\n` +
      `${c.instruction}\nRespeta los tiempos y las curvas de movimiento; adapta textos, colores y tamaños a lo que te pida.`;
  return `${head}\n\n\`\`\`${c.code_filename.split(".").pop() || ""}\n// ${c.code_filename}\n${code.trim()}\n\`\`\`\n`;
}
