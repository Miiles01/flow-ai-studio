/* ============================================================================
   CÓMO USAR ESTE COMPONENTE (instrucciones para tu asistente de IA:
   Claude, Codex, Gemini, Cursor, Antigravity o cualquier otro)
   ----------------------------------------------------------------------------
   - Componente de Remotion (React) para video vertical 1080×1920 a 30 fps.
     Si el proyecto no tiene Remotion, créalo (npx create-video@latest), copia este
     archivo en src/ y registra una <Composition>. Duración: stackCardsDuration(props).
   - Lista en tarjetas: cada tarjeta sube desde abajo y se pone encima de la anterior,
     que se encoge, se inclina hacia atrás y se oscurece un poco.
   - "cards": { title, text, bg, color } — título corto y una línea de texto
     (el número 01, 02… se pone solo).
   - Ajustes: background (blanco), font (Manrope.woff2 en public/fonts/),
     enter (cuadros que tarda en subir cada tarjeta), hold (cuadros que se lee).
   - Las tarjetas quedan dentro de la zona segura de TikTok, Reels, Shorts y Facebook.
   - Para renderizar: npx remotion render src/index.ts <Id> out/video.mp4
   ========================================================================== */
// Tarjetas que se apilan (Remotion) · Miiles Estudio · inspirado en "CSS-Only Stacking Cards" de karabharat
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";

export type TaskCard = { title: string; text: string; bg: string; color: string };
export type StackCardsProps = { cards: TaskCard[]; background?: string; font?: string; enter?: number; hold?: number };

const EASE = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = (v: number) => Math.max(0, Math.min(1, v));
export const stackCardsDuration = (p: StackCardsProps) => p.cards.length * ((p.enter ?? 22) + (p.hold ?? 42)) + 20;

export const StackCards: React.FC<StackCardsProps> = ({ cards, background = "#FFFFFF", font = "fonts/Manrope.woff2", enter = 22, hold = 42 }) => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("Cargando tipografía"));
  const isFile = /\.(woff2?|otf|ttf)$/.test(font);
  useEffect(() => {
    if (!isFile) { continueRender(handle); return; }
    new FontFace("SC-Font", `url(${staticFile(font)})`).load().then((f) => { document.fonts.add(f); continueRender(handle); }).catch(() => continueRender(handle));
  }, [font, handle, isFile]);
  const step = enter + hold;
  const W = 680, H = 760, top = 500; // dentro de la zona segura
  return (
    <AbsoluteFill style={{ background, fontFamily: `${isFile ? "SC-Font" : font}, Helvetica, Arial, sans-serif` }}>
      {cards.map((c, i) => {
        const start = i * step;
        const inT = EASE(clamp((frame - start) / enter));                 // sube desde abajo
        // Al llegar la siguiente tarjeta, esta se va hacia atrás una sola vez y ahí se queda quieta
        const d = i < cards.length - 1 ? EASE(clamp((frame - start - step) / enter)) : 0;
        if (frame < start) return null;
        const y = top + i * 18 + (1 - inT) * 1500 - d * 60;
        return (
          <div key={i} style={{
            position: "absolute", left: (1080 - W) / 2, top: y, width: W, height: H, perspective: 1000, zIndex: i,
          }}>
            <div style={{
              width: "100%", height: "100%", borderRadius: 48 - d * 20, background: c.bg, color: c.color, padding: 60,
              boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative", overflow: "hidden",
              transformOrigin: "50% 0%", transform: `scale(${1 - 0.2 * d}) rotateX(${-20 * d}deg)`,
            }}>
              {/* Al irse hacia atrás se aclara con un velo blanco (la tarjeta sigue sólida, sin transparencias) */}
              <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", opacity: 0.6 * d, zIndex: 2 }} />
              <span style={{ position: "absolute", right: 48, top: 20, fontSize: 200, fontWeight: 700, opacity: 0.25, letterSpacing: "-0.04em" }}>{String(i + 1).padStart(2, "0")}</span>
              <h2 style={{ margin: 0, fontSize: 84, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.04em" }}>{c.title}</h2>
              <p style={{ margin: "24px 0 0", fontSize: 40, lineHeight: 1.3, fontWeight: 500, opacity: 0.85 }}>{c.text}</p>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const exampleTasks: TaskCard[] = [
  { title: "Escribe el gancho", text: "Los primeros 3 segundos deciden si se quedan.", bg: "#4059F1", color: "#FFFFFF" },
  { title: "Graba en vertical", text: "Luz natural y el producto en la mano.", bg: "#FCB5B9", color: "#111111" },
  { title: "Edita con ritmo", text: "Cortes cortos y textos que se lean.", bg: "#1C1E2A", color: "#FFFFFF" },
  { title: "Publica y mide", text: "Revisa qué guardan y qué comparten.", bg: "#E8ECFE", color: "#111111" },
];
