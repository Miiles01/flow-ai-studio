/* ============================================================================
   CÓMO USAR ESTE COMPONENTE (instrucciones para tu asistente de IA:
   Claude, Codex, Gemini, Cursor, Antigravity o cualquier otro)
   ----------------------------------------------------------------------------
   - Es un componente de Remotion (React). Si el proyecto no tiene Remotion,
     créalo (npx create-video@latest), copia este archivo en src/
     y registra una <Composition> de 1080×1920 a 30 fps con estas props.
   - Fotos e íconos van en public/ y se pasan en "items":
       { src: "carpeta/foto.jpg" }                       → tarjeta con foto
       { color: "#4059F1", icon: "icono.svg", iconColor: "#FFF" } → tarjeta de color con un ícono SVG de una tinta
   - Personaliza SOLO con las props de abajo; no cambies las curvas de movimiento
     salvo que el usuario lo pida.
   - background: color de fondo (por defecto blanco).
   - cardWidth / cardHeight: tamaño de cada tarjeta.
   - gap: separación entre tarjetas. radius: curva del arco (más grande = más plano).
   - hold / move: cuadros que se queda cada tarjeta y que dura el giro.
   - Para renderizar: npx remotion render src/index.ts <Id> out/video.mp4
   ========================================================================== */
// Carrusel circular para video (Remotion) · Miiles Estudio
// Las tarjetas viven sobre un círculo enorme cuyo centro queda debajo del cuadro: solo se ve el arco de arriba.
// El círculo gira de una tarjeta a la siguiente, se detiene un momento y vuelve a girar.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// icon: un SVG de una sola tinta (se pinta del color iconColor con una máscara)
export type CarouselItem = { src?: string; color?: string; icon?: string; iconColor?: string };

export type CircularCarouselProps = {
  items: CarouselItem[];
  background?: string;
  cardWidth?: number;   // px
  cardHeight?: number;  // px
  gap?: number;         // espacio entre tarjetas, en px sobre el arco
  radius?: number;      // radio del círculo, en px (más grande = curva más suave)
  centerY?: number;     // altura del centro de la tarjeta activa
  hold?: number;        // cuadros que se queda quieta cada tarjeta
  move?: number;        // cuadros que dura cada giro
};

const EASE = Easing.bezier(0.7, 0, 0.2, 1);

export const CircularCarousel: React.FC<CircularCarouselProps> = ({
  items,
  background = "#FFFFFF",
  cardWidth = 540,
  cardHeight = 720,
  gap = 110,
  radius = 1700,
  centerY = 900,
  hold = 22,
  move = 20,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  // Paso actual (con decimales mientras gira)
  const cycle = hold + move;
  const step = Math.floor(frame / cycle);
  const t = frame - step * cycle;
  const progress = step + (t < hold ? 0 : EASE(interpolate(t, [hold, cycle], [0, 1], { extrapolateRight: "clamp" })));

  // Ángulo entre tarjetas: el ancho de la tarjeta más el espacio, medido sobre el arco
  const stepAngle = (cardWidth + gap) / radius;
  const cx = width / 2;
  const cy = centerY + radius;
  const n = items.length;

  return (
    <AbsoluteFill style={{ background, overflow: "hidden" }}>
      {items.map((item, i) => {
        // Posición relativa a la tarjeta activa, dando la vuelta a la lista
        let d = ((i - progress) % n + n) % n;
        if (d > n / 2) d -= n;
        const angle = d * stepAngle;
        if (Math.abs(angle) > Math.PI / 2) return null;
        const x = cx + radius * Math.sin(angle);
        const y = cy - radius * Math.cos(angle);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - cardWidth / 2,
              top: y - cardHeight / 2,
              width: cardWidth,
              height: cardHeight,
              borderRadius: 36,
              overflow: "hidden",
              background: item.color ?? "#222",
              transform: `rotate(${angle}rad)`,
            }}
          >
            {item.src && <Img src={item.src.startsWith("http") ? item.src : staticFile(item.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            {item.icon && (
              <div
                style={{
                  position: "absolute", left: "50%", top: "50%", width: "42%", aspectRatio: "1 / 1",
                  transform: "translate(-50%, -50%)",
                  background: item.iconColor ?? "#fff",
                  WebkitMaskImage: `url(${staticFile(item.icon)})`, maskImage: `url(${staticFile(item.icon)})`,
                  WebkitMaskSize: "contain", maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center", maskPosition: "center",
                }}
              />
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Ejemplo con los colores de marca de Miiles (azul #4059F1, rosa #FCB5B9, azul claro #E8ECFE, rosa claro #FEEDED)
export const defaultItems: CarouselItem[] = [
  { src: "carrusel/foto.jpg" },
  { color: "#4059F1", icon: "carrusel/estrella.svg", iconColor: "#FCB5B9" },
  { src: "carrusel/rosa.jpg" },
  { color: "#FCB5B9", icon: "carrusel/flor.svg", iconColor: "#4059F1" },
  { src: "carrusel/azul.jpg" },
  { color: "#1C1E2A", icon: "carrusel/miiles.svg", iconColor: "#FCB5B9" },
  { src: "carrusel/foto.jpg" },
  { color: "#4059F1", icon: "carrusel/flor.svg", iconColor: "#FFFFFF" },
  { src: "carrusel/rosa.jpg" },
  { color: "#FCB5B9", icon: "carrusel/estrella.svg", iconColor: "#1C1E2A" },
];
