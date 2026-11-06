/* ============================================================================
   CÓMO USAR ESTE COMPONENTE (instrucciones para tu asistente de IA:
   Claude, Codex, Gemini, Cursor, Antigravity o cualquier otro)
   ----------------------------------------------------------------------------
   - Es un componente de Remotion (React) para video vertical 1080×1920 a 30 fps.
     Si el proyecto no tiene Remotion, créalo (npx create-video@latest), copia este
     archivo en src/ y registra una <Composition> con estas props.
   - Tipografía: pon Anton.woff2 en public/fonts/ (Google Fonts, licencia libre) o
     cambia "font" por otra condensada. Funciona mejor con palabras de 4 a 8 letras.
   - Ajustes:
     · text: la palabra o frase corta (se escribe en mayúsculas)
     · copies: cuántas veces se repite cada letra hacia abajo (3 por defecto)
     · background, color: fondo blanco y letras negras por defecto
     · stretch: qué tanto se estiran las copias (0 a 0.9)
     · seconds: segundos que tarda un estiramiento completo
     · safeArea: true deja libre la zona de botones y textos de TikTok, Reels, Shorts
       y Facebook (200 px a los lados, 300 px arriba y abajo). Déjalo en true.
   - No cambies la curva de movimiento salvo que el usuario lo pida.
   - Para renderizar: npx remotion render src/index.ts <Id> out/video.mp4
   ========================================================================== */
// Letras elásticas apiladas (Remotion) · Miiles Estudio · inspirado en el pen "ByWqNxq" de Leanne Renard
// (a su vez inspirado en volumkonferansen.no). Cada letra se repite en una columna; las copias se estiran
// y se encogen como elástico sin cambiar la altura total, y cada letra va a su propio ritmo.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export type ElasticStackProps = {
  text: string;
  copies?: number;
  background?: string;
  color?: string;
  font?: string;       // archivo en public/ o nombre de una fuente instalada
  stretch?: number;    // 0 a 0.9
  seconds?: number;
  gap?: number;        // px entre copias y entre letras
  safeArea?: boolean;
};

// power1.inOut del original, aplicado como ida y vuelta (yoyo)
const inOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

export const ElasticStack: React.FC<ElasticStackProps> = ({
  text, copies = 3, background = "#FFFFFF", color = "#111111", font = "fonts/Anton.woff2",
  stretch = 0.75, seconds = 2.5, gap = 14, safeArea = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const [handle] = useState(() => delayRender("Cargando tipografía"));
  const isFile = /\.(woff2?|otf|ttf)$/.test(font);
  const family = isFile ? "ES-Font" : font;
  const letters = Array.from(text.toUpperCase().replace(/ /g, ""));
  // Caja exacta de cada letra (sin espacio de ascendentes): así cada copia llena su lugar sin encimarse
  const [boxes, setBoxes] = useState<Record<string, { x: number; y: number; w: number; h: number }>>({});
  useEffect(() => {
    const measure = () => {
      // Contorno real de cada letra (tinta), medido con canvas: así ninguna letra se corta
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.font = `100px "${family}"`;
      const out: Record<string, { x: number; y: number; w: number; h: number }> = {};
      for (const ch of new Set(letters)) {
        const m = ctx.measureText(ch);
        out[ch] = { x: -m.actualBoundingBoxLeft, y: -m.actualBoundingBoxAscent, w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight, h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent };
      }
      setBoxes(out);
      continueRender(handle);
    };
    if (!isFile) { measure(); return; }
    new FontFace("ES-Font", `url(${staticFile(font)})`).load().then((f) => { document.fonts.add(f); measure(); }).catch(() => continueRender(handle));
  }, [font, handle, isFile]); // eslint-disable-line react-hooks/exhaustive-deps

  const left = safeArea ? 200 : 60, top = safeArea ? 300 : 60;
  const boxW = width - left * 2, boxH = height - top * 2;
  // Cada columna toma el ancho natural de su letra (la I queda delgada, la M ancha)
  const natural = letters.map((ch) => boxes[ch]?.w ?? 60);
  const totalNat = natural.reduce((a, b) => a + b, 0);
  const free = boxW - gap * (letters.length - 1);
  const usable = boxH - gap * (copies - 1);

  return (
    <AbsoluteFill style={{ background }}>
      <div style={{ position: "absolute", left, top, width: boxW, height: boxH, display: "flex", gap, justifyContent: "center" }}>
        {letters.map((ch, li) => {
          // Cada letra con su propio desfase y velocidad, como el original (seek y timescale distintos)
          const speed = [1, 1, 0.8, 1.2][li % 4];
          const offset = [0, 0.4, 0.2, 0.6][li % 4];
          const t = ((frame / fps) * speed / seconds + offset) % 2;
          const p = inOut(t < 1 ? t : 2 - t); // 0 → 1 → 0
          // Peso de cada copia: la que se estira va pasando de la primera a la última
          const weights = Array.from({ length: copies }, (_, k) => {
            const target = p * (copies - 1);
            const d = Math.abs(k - target);
            return 1 - stretch * Math.min(1, d / (copies - 1 || 1)) + stretch * Math.max(0, 1 - d);
          });
          const sum = weights.reduce((a, b) => a + b, 0);
          return (
            <div key={li} style={{ width: (free * natural[li]) / totalNat, display: "flex", flexDirection: "column", gap }}>
              {weights.map((w, k) => {
                const h = (usable * w) / sum;
                const bb = boxes[ch];
                return (
                  <svg key={k} width={(free * natural[li]) / totalNat} height={h} viewBox={bb ? `${bb.x} ${bb.y} ${bb.w} ${bb.h}` : "0 -73.5 60 73.5"} preserveAspectRatio="none" style={{ display: "block" }}>
                    {/* La letra llena su caja y se estira con ella */}
                    <text x="0" y="0" fill={color} fontFamily={family} fontSize="100">{ch}</text>
                  </svg>
                );
              })}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
