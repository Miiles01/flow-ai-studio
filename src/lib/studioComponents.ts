import repoComponents from "@/data/studio-components.json";
import i18n from "@/i18n";

// Componentes del Estudio: animaciones de video (y otros assets) que se copian como prompt para pegarlo en tu IA.
// El video de vista previa y el archivo de código se sirven desde wearemiiles.com para que miiles.app no cargue su peso.
export type StudioComponent = {
  slug: string;
  title: string;
  category: string; // p. ej. "Texto animado", "Transición"
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

/** Trae el código del componente desde wearemiiles. */
export async function fetchComponentCode(c: StudioComponent): Promise<string> {
  const res = await fetch(c.code_url);
  if (!res.ok) throw new Error(`No se pudo cargar el código (${res.status})`);
  return res.text();
}

/** Prompt listo para pegar: instrucción breve + el código completo. */
export function buildComponentPrompt(c: StudioComponent, code: string): string {
  const en = (i18n.language || "es").startsWith("en");
  const head = en
    ? `Implement this video animation ("${c.title}") in my project${c.stack ? ` (${c.stack})` : ""}. ${c.instruction}\nKeep the timing and easing; adapt texts, colors and sizes to what I ask you.`
    : `Implementa esta animación de video («${c.title}») en mi proyecto${c.stack ? ` (${c.stack})` : ""}. ${c.instruction}\nRespeta los tiempos y las curvas de movimiento; adapta textos, colores y tamaños a lo que te pida.`;
  return `${head}\n\n\`\`\`${c.code_filename.split(".").pop() || ""}\n// ${c.code_filename}\n${code.trim()}\n\`\`\`\n`;
}
