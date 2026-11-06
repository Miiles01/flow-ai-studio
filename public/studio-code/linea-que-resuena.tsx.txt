/* ============================================================================
   CÓMO USAR ESTE COMPONENTE (instrucciones para tu asistente de IA:
   Claude, Codex, Gemini, Cursor, Antigravity o cualquier otro)
   ----------------------------------------------------------------------------
   - Es un componente de Remotion (React) para video vertical 1080×1920 a 30 fps.
     Si el proyecto no tiene Remotion, créalo (npx create-video@latest), copia este
     archivo en src/ y registra una <Composition> con estas props.
   - Es una línea que cruza el cuadro y vibra como una cuerda: se jala, se suelta y
     rebota. Sirve como separador, para marcar un ritmo o acompañar una frase clave.
   - Ajustes:
     · background: fondo (blanco por defecto)
     · colors: degradado de la línea [inicio, fin] (por defecto azul y rosa de Miiles)
     · thickness: grosor en px
     · y: altura de la línea en el cuadro (0.5 = al centro)
     · pull: cuánto se jala en px; every: segundos entre un jalón y otro
     · pluckFrames: si los pasas, la línea se jala en esos cuadros exactos (por
       ejemplo, sincronizados con la música o con cada frase)
   - No cambies la curva del rebote (elastic.out(1, 0.3) del original) salvo que el usuario lo pida.
   - Para renderizar: npx remotion render src/index.ts <Id> out/video.mp4
   ========================================================================== */
// Línea que resuena (Remotion) · Miiles Estudio · inspirado en "Cursor Line Wobble" de GreenSock
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export type ResonantLineProps = {
  background?: string;
  colors?: [string, string];
  thickness?: number;
  y?: number;
  pull?: number;
  every?: number;
  pluckFrames?: number[];
};

// elastic.out(1, 0.3) de GSAP
const elasticOut = (t: number, a = 1, p = 0.3) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const s = (p / (2 * Math.PI)) * Math.asin(1 / a);
  return a * Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / p) + 1;
};
const easeOut = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);

export const ResonantLine: React.FC<ResonantLineProps> = ({
  background = "#FFFFFF", colors = ["#4059F1", "#FCB5B9"], thickness = 18, y = 0.5, pull = 260, every = 1.8, pluckFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cy = height * y;
  const PULL = Math.round(fps * 0.35);   // cuadros que tarda en jalarse
  const RELEASE = Math.round(fps * 0.9); // cuadros del rebote (0.9 s, como el original)

  // Jalones: los que pasaste o uno cada "every" segundos, alternando arriba y abajo
  const plucks = pluckFrames ?? Array.from({ length: 60 }, (_, i) => Math.round(fps * 0.4 + i * fps * every));
  let offset = 0;
  for (let i = plucks.length - 1; i >= 0; i--) {
    const start = plucks[i];
    if (frame < start) continue;
    const dir = i % 2 === 0 ? 1 : -1;
    const amp = pull * (i % 3 === 2 ? 0.6 : 1) * dir;
    const t = frame - start;
    if (t < PULL) offset = amp * easeOut(t / PULL);                 // se jala
    else offset = amp * (1 - elasticOut((t - PULL) / RELEASE));     // se suelta y rebota
    break;
  }
  // Curva cuadrática: el punto de control se mueve el doble para que el centro de la línea llegue a "offset"
  const d = `M0,${cy} Q${width / 2},${cy + offset * 2} ${width},${cy}`;
  return (
    <AbsoluteFill style={{ background }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="rl-grad" x1="0" y1="0" x2={width} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0.2" stopColor={colors[0]} />
            <stop offset="0.8" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <path d={d} stroke="url(#rl-grad)" strokeWidth={thickness} strokeLinecap="round" fill="none" />
      </svg>
    </AbsoluteFill>
  );
};
