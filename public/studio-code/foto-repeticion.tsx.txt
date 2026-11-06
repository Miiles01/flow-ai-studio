/* ============================================================================
   CÓMO USAR ESTE COMPONENTE (instrucciones para tu asistente de IA:
   Claude, Codex, Gemini, Cursor, Antigravity o cualquier otro)
   ----------------------------------------------------------------------------
   - Componente de Remotion (React) para video vertical 1080×1920 a 30 fps.
     Si el proyecto no tiene Remotion, créalo (npx create-video@latest), copia este
     archivo en src/ y registra una <Composition> de repetitionDuration(props) cuadros.
   - Una sola foto con efecto de "repetición": copias de la misma foto se encogen una
     tras otra (como ecos o anillos) y por dentro la foto hace un zoom suave. Luego
     regresa. Se repite "loops" veces.
   - Ajustes:
     · image: foto en public/ o URL
     · shape: "pill" (cápsula), "circle", "rect" o "arch" (arco)
     · animate: "scale", "scaleX" (franjas a los lados) o "scaleY" (franjas arriba/abajo)
     · origin: punto hacia donde se encogen ("50% 50%", "50% 100%" = hacia abajo, "0% 50%"…)
     · elems: cuántas copias (2 a 8) · stagger: segundos entre copias
     · initialScale: zoom con el que empieza la foto de adentro
     · duration (s) · ease: "power2" | "power1" | "sine"
     · width, height: tamaño de la foto (px) · background (blanco)
     · hold: cuadros de pausa entre ida y vuelta · loops: cuántas veces
   - Para renderizar: npx remotion render src/index.ts <Id> out/video.mp4
   ========================================================================== */
// Foto con repetición (Remotion) · Miiles Estudio · inspirado en "Repetition Hover Effect" de Codrops
import React from "react";
import { AbsoluteFill, Easing, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export type RepetitionImageProps = {
  image: string;
  shape?: "pill" | "circle" | "rect" | "arch";
  animate?: "scale" | "scaleX" | "scaleY";
  origin?: string;
  elems?: number;
  stagger?: number;
  initialScale?: number;
  duration?: number;
  ease?: "power2" | "power1" | "sine";
  width?: number;
  height?: number;
  background?: string;
  hold?: number;
  loops?: number;
};

const EASES = {
  power2: Easing.inOut(Easing.quad),
  power1: Easing.bezier(0.45, 0, 0.55, 1),
  sine: Easing.bezier(0.37, 0, 0.63, 1),
};
const clamp = (v: number) => Math.max(0, Math.min(1, v));

const cycleFrames = (p: Partial<RepetitionImageProps>) => {
  const n = Math.max(2, p.elems ?? 4);
  const run = ((p.duration ?? 0.8) + Math.abs(p.stagger ?? 0.1) * (n - 1)) * 30;
  return Math.ceil(run * 2 + (p.hold ?? 30) * 2);
};
export function repetitionDuration(p: Partial<RepetitionImageProps>) {
  return cycleFrames(p) * (p.loops ?? 2) + 15;
}

export const RepetitionImage: React.FC<RepetitionImageProps> = (props) => {
  const {
    image, shape = "pill", animate = "scale", origin = "50% 50%", stagger = 0.1, initialScale = 2,
    duration = 0.8, ease = "power2", width: w = 700, height: h = 1100, background = "#FFFFFF", hold = 30,
  } = props;
  const n = Math.max(2, props.elems ?? 4);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const E = EASES[ease];

  // Tiempo de la línea de tiempo: espera, avanza (hover), espera, regresa
  const run = (duration + Math.abs(stagger) * (n - 1)) * fps;
  const cyc = cycleFrames({ ...props, elems: n });
  const f = Math.max(0, frame - 15) % cyc;
  const tf = f < hold ? 0 : f < hold + run ? f - hold : f < hold * 2 + run ? run : Math.max(0, run - (f - hold * 2 - run));
  const t = tf / fps;

  const radius = shape === "pill" ? Math.min(w, h) / 2 : shape === "circle" ? "50%" : shape === "arch" ? `${w / 2}px ${w / 2}px 0 0` : 12;
  const size = shape === "circle" ? { width: w, height: w } : { width: w, height: h };
  // stagger negativo del original: la copia de hasta arriba es la primera en moverse
  const progress = (i: number) => E(clamp((t - (n - 1 - i) * Math.abs(stagger)) / duration));
  const tr = (v: number) => (animate === "scaleX" ? `scaleX(${v})` : animate === "scaleY" ? `scaleY(${v})` : `scale(${v})`);
  const src = image.startsWith("http") ? image : staticFile(image);
  const layer: React.CSSProperties = { position: "absolute", inset: 0, borderRadius: radius, transformOrigin: origin, overflow: "hidden" };
  const img = <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />;

  return (
    <AbsoluteFill style={{ background, alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", ...size, borderRadius: radius, overflow: "hidden" }}>
        {Array.from({ length: n }, (_, i) => {
          if (i === 0) {
            // la primera vive en un marco fijo y hace zoom de initialScale → 1
            const v = initialScale + (1 - initialScale) * progress(0);
            return (
              <div key={i} style={layer}>
                <div style={{ ...layer, transform: tr(t <= 0 ? 1 : v) }}>{img}</div>
              </div>
            );
          }
          const v = 1 - progress(i); // las copias se encogen hasta desaparecer
          return <div key={i} style={{ ...layer, transform: tr(v) }}>{img}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};
