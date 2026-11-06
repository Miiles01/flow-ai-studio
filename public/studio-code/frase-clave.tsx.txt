/* ============================================================================
   CÓMO USAR ESTE COMPONENTE (instrucciones para tu asistente de IA:
   Claude, Codex, Gemini, Cursor, Antigravity o cualquier otro)
   ----------------------------------------------------------------------------
   - Es un componente de Remotion (React) para frases clave en video vertical.
     Si el proyecto no tiene Remotion, créalo (npx create-video@latest), copia este
     archivo en src/ y registra una <Composition> de 1080×1920 a 30 fps.
     La duración se calcula con keyPhraseDuration(props).
   - Tipografías: pon los archivos en public/fonts/ (Manrope.woff2 para el texto y
     Advercase-Regular.otf para las palabras resaltadas) o cambia "font" y
     "highlightFont" por las que quieras. Advercase gratis no trae acentos: úsala
     solo en palabras sin acento.
   - "phrases" es la lista de escenas. Cada frase va en máximo 3 líneas, separadas
     con "\n". Si la frase es más larga, pártela en dos escenas.
       { text: "Contenido que\nse siente\nreal", highlight: ["real"] }
   - Ajustes:
     · split: "lines" | "words" | "letters" (qué entra por separado)
     · from: "start" | "center" | "end" | "edges" | "random" (orden de entrada)
     · transition: "reveal" (sale hacia arriba) | "swap" (la frase baja y la nueva sube)
     · background, color, highlightColor: colores (fondo blanco y texto negro por defecto)
     · safeArea: true mantiene el texto lejos de los botones y textos de TikTok, Reels,
       Shorts y Facebook (likes, comentarios y descripción). Déjalo en true.
     · fontSize es el tamaño máximo: se reduce solo si una línea no cabe.
     · fontSize, lineHeight, align ("center" | "left")
     · stagger, enter, hold, exit: tiempos en cuadros
   - No cambies las curvas de movimiento salvo que el usuario lo pida.
   - Para renderizar: npx remotion render src/index.ts <Id> out/video.mp4
   ========================================================================== */
// Frases clave con máscara (Remotion) · Miiles Estudio
// Inspirado en "Masked Text Reveal" de Osmo (líneas, palabras, letras), "Tab content toggle" de himaaax (cambio de frase)
// y "Stagger Direction Visualizer" de snorkltv (orden de entrada: inicio, centro, final, extremos, aleatorio).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";

export type Phrase = { text: string; highlight?: string[] };
export type KeyPhraseProps = {
  phrases: Phrase[];
  split?: "lines" | "words" | "letters";
  from?: "start" | "center" | "end" | "edges" | "random";
  transition?: "reveal" | "swap";
  background?: string;
  color?: string;
  highlightColor?: string;
  font?: string;           // archivo en public/ o nombre de una fuente ya instalada
  highlightFont?: string;
  fontSize?: number;
  lineHeight?: number;
  align?: "center" | "left";
  stagger?: number;        // cuadros entre una pieza y la siguiente
  enter?: number;          // cuadros que tarda cada pieza en entrar
  hold?: number;           // cuadros que la frase se queda completa
  exit?: number;           // cuadros que tarda en salir
  safeArea?: boolean;      // respeta la zona segura de TikTok / Reels / Shorts / Facebook
};

const OSMO = Easing.bezier(0.625, 0.05, 0, 1);   // curva del original de Osmo
const IN = Easing.bezier(0.55, 0.085, 0.68, 0.53);  // power1.in
const OUT = Easing.bezier(0.25, 0.46, 0.45, 0.94);  // power1.out

const DEFAULTS = { split: "words", from: "start", transition: "reveal", stagger: 3, enter: 22, hold: 45, exit: 16 } as const;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
function order(n: number, from: KeyPhraseProps["from"], seed: number): number[] {
  const mid = (n - 1) / 2;
  if (from === "end") return Array.from({ length: n }, (_, i) => n - 1 - i);
  if (from === "center") return Array.from({ length: n }, (_, i) => Math.abs(i - mid));
  if (from === "edges") return Array.from({ length: n }, (_, i) => mid - Math.abs(i - mid));
  if (from === "random") {
    const idx = Array.from({ length: n }, (_, i) => i);
    let s = seed + 1;
    for (let i = n - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const out = new Array(n); idx.forEach((v, k) => { out[v] = k; }); return out;
  }
  return Array.from({ length: n }, (_, i) => i);
}

/** Duración total en cuadros (úsala en la <Composition>). */
export function keyPhraseDuration(p: KeyPhraseProps): number {
  return Math.ceil(p.phrases.reduce((acc, ph) => acc + sceneLength(p, ph), 0)) + 10;
}
function units(p: KeyPhraseProps, ph: Phrase) {
  const lines = ph.text.split("\n");
  const split = p.split ?? DEFAULTS.split;
  if (split === "lines") return lines.length;
  if (split === "words") return lines.reduce((a, l) => a + l.split(" ").filter(Boolean).length, 0);
  return lines.reduce((a, l) => a + l.replace(/ /g, "").length, 0);
}
function sceneLength(p: KeyPhraseProps, ph: Phrase) {
  const stagger = p.stagger ?? DEFAULTS.stagger, enter = p.enter ?? DEFAULTS.enter, hold = p.hold ?? DEFAULTS.hold, exit = p.exit ?? DEFAULTS.exit;
  const n = units(p, ph);
  const maxOrder = (p.from ?? "start") === "center" || p.from === "edges" ? Math.ceil((n - 1) / 2) : n - 1;
  return maxOrder * stagger + enter + hold + exit + (ph.text.split("\n").length - 1) * 2;
}

function useFonts(font: string, highlightFont: string) {
  const [handle] = useState(() => delayRender("Cargando tipografías"));
  useEffect(() => {
    const load = (name: string, file: string) =>
      /\.(woff2?|otf|ttf)$/.test(file) ? new FontFace(name, `url(${staticFile(file)})`).load().then((f) => { document.fonts.add(f); }) : Promise.resolve();
    Promise.all([load("KP-Text", font), load("KP-Highlight", highlightFont)]).then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [font, highlightFont, handle]);
}

export const KeyPhrase: React.FC<KeyPhraseProps> = (props) => {
  const {
    phrases, background = "#FFFFFF", color = "#111111", highlightColor = "#111111", safeArea = true,
    font = "fonts/Manrope.woff2", highlightFont = "fonts/Advercase-Regular.otf",
    fontSize = 150, lineHeight = 1.0, align = "center",
  } = props;
  const split = props.split ?? DEFAULTS.split, from = props.from ?? DEFAULTS.from, transition = props.transition ?? DEFAULTS.transition;
  const stagger = props.stagger ?? DEFAULTS.stagger, enter = props.enter ?? DEFAULTS.enter, hold = props.hold ?? DEFAULTS.hold, exit = props.exit ?? DEFAULTS.exit;
  useFonts(font, highlightFont);
  const frame = useCurrentFrame();
  const textFamily = /\.(woff2?|otf|ttf)$/.test(font) ? "KP-Text" : font;
  const hlFamily = /\.(woff2?|otf|ttf)$/.test(highlightFont) ? "KP-Highlight" : highlightFont;

  // Escena actual
  let start = 0, idx = 0;
  for (; idx < phrases.length; idx++) { const len = sceneLength(props, phrases[idx]); if (frame < start + len) break; start += len; }
  if (idx >= phrases.length) return <AbsoluteFill style={{ background }} />;
  const ph = phrases[idx];
  const f = frame - start;
  const lines = ph.text.split("\n");
  const hl = new Set((ph.highlight ?? []).map((w) => w.toLowerCase()));
  const len = sceneLength(props, ph);
  const exitStart = len - exit;
  // El tamaño baja solo si la línea más larga no cabe en el ancho seguro (Manrope ≈ 0.53 em por carácter)
  const safeWidth = 1080 - (safeArea ? 400 : 160);
  const longest = Math.max(...lines.map((l) => l.length));
  const fitSize = Math.min(fontSize, Math.floor(safeWidth / (longest * 0.53)));

  // Piezas que entran por separado, con su orden
  type U = { line: number; word: number; char: number };
  const list: U[] = [];
  lines.forEach((l, li) => {
    const words = l.split(" ").filter(Boolean);
    if (split === "lines") list.push({ line: li, word: -1, char: -1 });
    else words.forEach((w, wi) => {
      if (split === "words") list.push({ line: li, word: wi, char: -1 });
      else Array.from(w).forEach((_, ci) => list.push({ line: li, word: wi, char: ci }));
    });
  });
  const ord = order(list.length, from, idx * 7 + 3);
  const key = (u: U) => `${u.line}-${u.word}-${u.char}`;
  const delay = new Map(list.map((u, i) => [key(u), ord[i] * stagger]));

  const enterY = (d: number) => (transition === "swap" ? 150 : 110) * (1 - (transition === "swap" ? OUT : OSMO)(clamp01((f - d) / enter)));
  // Salida por línea: "reveal" sube y se va; "swap" baja (como el original de himaaax)
  const exitY = (li: number) => {
    const p = clamp01((f - exitStart - li * 2) / Math.max(1, exit - lines.length * 2));
    return transition === "swap" ? 150 * IN(p) : -110 * OSMO(p);
  };

  return (
    <AbsoluteFill style={{ background }}>
      {/* Zona segura simétrica para 1080×1920 (el texto queda centrado en el cuadro y lejos de la UI):
          200 px a cada lado (likes, comentarios, compartir) y 480 px arriba y abajo (usuario, descripción y audio) */}
      <div style={{ position: "absolute", left: safeArea ? 200 : 80, right: safeArea ? 200 : 80, top: safeArea ? 480 : 80, bottom: safeArea ? 480 : 80, display: "flex", alignItems: "center", justifyContent: align === "center" ? "center" : "flex-start" }}>
      <div style={{ width: "100%", textAlign: align, color, fontFamily: `${textFamily}, Manrope, Helvetica, Arial, sans-serif`, fontWeight: 600, fontSize: fitSize, lineHeight, letterSpacing: "-0.04em" }}>
        {lines.map((l, li) => {
          const ly = exitY(li) + (split === "lines" ? enterY(delay.get(`${li}--1--1`) ?? 0) : 0);
          return (
            // La máscara de cada línea: lo que está fuera no se ve
            <div key={li} style={{ overflow: "hidden", whiteSpace: "nowrap", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
              <div style={{ transform: `translateY(${ly}%)` }}>
                {l.split(" ").filter(Boolean).map((w, wi) => {
                  const isHl = hl.has(w.toLowerCase().replace(/[.,;:!?¡¿]/g, ""));
                  const wStyle: React.CSSProperties = { display: "inline-block", whiteSpace: "nowrap", ...(isHl ? { fontFamily: `${hlFamily}, serif`, fontWeight: 400, color: highlightColor, letterSpacing: "-0.02em", fontSize: "1.12em" } : {}) };
                  const wy = split === "words" ? enterY(delay.get(`${li}-${wi}--1`) ?? 0) : 0;
                  return (
                    <React.Fragment key={wi}>
                      <span style={{ ...wStyle, transform: `translateY(${wy}%)` }}>
                        {split === "letters"
                          ? Array.from(w).map((ch, ci) => (
                              <span key={ci} style={{ display: "inline-block", transform: `translateY(${enterY(delay.get(`${li}-${wi}-${ci}`) ?? 0)}%)` }}>{ch}</span>
                            ))
                          : w}
                      </span>
                      {" "}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </AbsoluteFill>
  );
};

// Ejemplo
export const examplePhrases: Phrase[] = [
  { text: "Contenido que\nse siente\nreal", highlight: ["real"] },
  { text: "Videos que la\ngente sí\ntermina de ver", highlight: ["ver"] },
  { text: "Tu marca, en\nmovimiento", highlight: ["movimiento"] },
];
