
import type { TrendNodeKind, TrendConfidence } from "@/components/TrendFlowNode";
import iconPlay from "@/assets/trends/play.svg";
import iconHeart from "@/assets/trends/heart.svg";
import iconShare from "@/assets/trends/share.svg";
import iconLike from "@/assets/trends/like.svg";
import iconDislike from "@/assets/trends/dislike.svg";

import adsClaroObj from "@/assets/elementos-miiles/ads-modo-claro.svg.asset.json";
import adsOscuroObj from "@/assets/elementos-miiles/ads-modo-oscuro.svg.asset.json";
import alertaClaroObj from "@/assets/elementos-miiles/alerta-modo-claro.svg.asset.json";
import feedCuentaClaroObj from "@/assets/elementos-miiles/feed-con-cuenta-modo-claro.svg.asset.json";
import feedCuentaOscuroObj from "@/assets/elementos-miiles/feed-con-cuenta-modo-oscuro.svg.asset.json";
import feedNormalClaroObj from "@/assets/elementos-miiles/feed-normal-modo-claro.svg.asset.json";
import feedNormalOscuroObj from "@/assets/elementos-miiles/feed-normal-modo-oscuro.svg.asset.json";
import notificacionClaroObj from "@/assets/elementos-miiles/notificacio-n-modo-claro.svg.asset.json";
import notificacionOscuroObj from "@/assets/elementos-miiles/notificacio-n-modo-oscuro.svg.asset.json";
import resNegClaroObj from "@/assets/elementos-miiles/resultado-negativo-modo-claro.svg.asset.json";
import resNegOscuroObj from "@/assets/elementos-miiles/resultado-negativo-modo-oscuro.svg.asset.json";
import resPosClaroObj from "@/assets/elementos-miiles/resultado-positivo-modo-claro.svg.asset.json";
import resPosOscuroObj from "@/assets/elementos-miiles/resultado-positivo-modo-oscuro.svg.asset.json";
import tiempoClaroObj from "@/assets/elementos-miiles/tiempo-modo-claro.svg.asset.json";
import tiempoOscuroObj from "@/assets/elementos-miiles/tiempo-modo-oscuro.svg.asset.json";
import videoHorClaroObj from "@/assets/elementos-miiles/video-horizontal-modo-claro.svg.asset.json";
import videoHorOscuroObj from "@/assets/elementos-miiles/video-horizontal-modo-oscuro.svg.asset.json";
import videoClaroObj from "@/assets/elementos-miiles/video-modo-claro.svg.asset.json";
import videoOscuroObj from "@/assets/elementos-miiles/video-modo-oscuro.svg.asset.json";
import vistasClaroObj from "@/assets/elementos-miiles/vistas-modo-claro.svg.asset.json";
import vistasOscuroObj from "@/assets/elementos-miiles/vistas-modo-oscuro.svg.asset.json";

const videoLight = videoClaroObj.url;
const videoDark = videoOscuroObj.url;
const videoHorizontalLight = videoHorClaroObj.url;
const videoHorizontalDark = videoHorOscuroObj.url;
const vistasLight = vistasClaroObj.url;
const vistasDark = vistasOscuroObj.url;
const feedLight = feedNormalClaroObj.url;
const feedDark = feedNormalOscuroObj.url;
const feedCuentaLight = feedCuentaClaroObj.url;
const feedCuentaDark = feedCuentaOscuroObj.url;
const adsLight = adsClaroObj.url;
const adsDark = adsOscuroObj.url;
const alertaLight = alertaClaroObj.url;
const alertaDark = alertaClaroObj.url; // solo subio el claro
const notificacionLight = notificacionClaroObj.url;
const notificacionDark = notificacionOscuroObj.url;
const resNegLight = resNegClaroObj.url;
const resNegDark = resNegOscuroObj.url;
const resPosLight = resPosClaroObj.url;
const resPosDark = resPosOscuroObj.url;
const tiempoLight = tiempoClaroObj.url;
const tiempoDark = tiempoOscuroObj.url;
import type { TrendNodeKind, TrendConfidence } from "@/components/TrendFlowNode";
import videoLight from "@/assets/trends/video-light.svg";
import videoDark from "@/assets/trends/video-dark.svg";
import videoHorizontalLight from "@/assets/trends/video-horizontal-light.svg";
import videoHorizontalDark from "@/assets/trends/video-horizontal-dark.svg";
import vistasLight from "@/assets/trends/vistas-light.svg";
import vistasDark from "@/assets/trends/vistas-dark.svg";
import feedLight from "@/assets/trends/feed-light.svg";
import feedDark from "@/assets/trends/feed-dark.svg";
import feedCuentaLight from "@/assets/trends/feed-cuenta-light.svg";
import feedCuentaDark from "@/assets/trends/feed-cuenta-dark.svg";
import iconPlay from "@/assets/trends/play.svg";
import iconHeart from "@/assets/trends/heart.svg";
import iconShare from "@/assets/trends/share.svg";
import iconLike from "@/assets/trends/like.svg";
import iconDislike from "@/assets/trends/dislike.svg";

// ── Diagramas de arquitectura algorítmica por red social ──
// Lógica: objetivo del algoritmo → qué mide (señales) → rondas de prueba → bucle.
// Cada nodo lleva un nivel de confianza (confirmado / muy probable / hipótesis)
// y puede llevar `details` (las "raíces"): se muestran al tocar el ojo.

export type TrendFlowDetail = {
  id: string;
  dx: number;
  dy: number;
  side?: "left" | "right" | "bottom";
  tag?: string;
  label: string;
  sublabel?: string;
  icon?: string;
  confidence?: TrendConfidence;
};

export type TrendFlowNodeDef = {
  id: string;
  position: { x: number; y: number };
  data: {
    label: string;
    sublabel?: string;
    tag?: string;
    kind?: TrendNodeKind;
    image?: string;
    imageDark?: string;
    icon?: string;
    confidence?: TrendConfidence;
    details?: TrendFlowDetail[];
  };
};

export type TrendFlowEdgeDef = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  animated?: boolean;
  dashed?: boolean;
};

export type TrendFlow = {
  network: string;
  title: string;
  nodes: TrendFlowNodeDef[];
  edges: TrendFlowEdgeDef[];
};

export const TREND_FLOWS: Record<string, TrendFlow> = {
  tiktok: {
    network: "tiktok",
    title: "Algoritmo TikTok (FYP)",
    nodes: [
      {
        id: "OBJ",
        position: { x: -560, y: 40 },
        data: {
          kind: "phase", tag: "Objetivo", confidence: "confirmed",
          label: "¿Qué maximiza TikTok?",
          sublabel: "Tiempo de sesión y que vuelvas mañana. Cada decisión del algoritmo apunta ahí.",
        },
      },
      {
        id: "A",
        position: { x: 0, y: 0 },
        data: {
          kind: "start", tag: "Inicio",
          image: videoLight, imageDark: videoDark,
          label: "Tipo de Publicación",
          sublabel: "¿Es un anuncio pagado o contenido orgánico?",
        },
      },
      {
        id: "A_ADS",
        position: { x: 450, y: 150 },
        data: {
          image: adsLight, imageDark: adsDark,
          kind: "phase", tag: "Ads",
          label: "Anuncio Pagado (Ads)",
          sublabel: "No depende del algoritmo orgánico. Escala mediante presupuesto (CPA / Subastas).",
        },
      },
      {
        id: "A_ORG",
        position: { x: 0, y: 180 },
        data: {
          kind: "phase", tag: "Orgánico",
          label: "Contenido Orgánico",
          sublabel: "Entra al Modo Prueba del algoritmo para ser evaluado.",
        },
      },
      {
        id: "S",
        position: { x: 560, y: 40 },
        data: {
          kind: "strategy", tag: "Jugadas",
          label: "Qué está funcionando ahora",
          sublabel: "Toca el ojo para ver las estrategias vigentes",
          details: [
            { id: "s1", dx: 340, dy: -40, side: "right", tag: "Estrategia", label: "Videos de 7-15 segundos", sublabel: "Maximizan completion rate y loops. Ideal para crecer al inicio." },
            { id: "s2", dx: 340, dy: 115, side: "right", tag: "Estrategia", label: "Loop perfecto", sublabel: "Que el final conecte con el inicio: lo ven 2-3 veces sin notarlo." },
            { id: "s3", dx: 340, dy: 270, side: "right", tag: "Estrategia", label: "Series de contenido", sublabel: "Parte 1, 2, 3… disparan búsquedas de tu perfil y sesiones largas." },
            { id: "s4", dx: 340, dy: 425, side: "right", tag: "Estrategia", label: "Las 3 primeras palabras", sublabel: "Dilas en voz y en texto: TikTok las indexa para búsqueda (SEO)." },
          ],
        },
      },
      {
        id: "PLUS",
        position: { x: -560, y: 370 },
        data: {
          kind: "strategy", tag: "Novedad 2026", confidence: "confirmed",
          label: "Instagram Plus",
          sublabel: "Nueva suscripción opcional de $3.99/mes con ventajas exclusivas",
          details: [
            { id: "p1", dx: -340, dy: -40, side: "left", tag: "Interacción", label: "Story Spotlight & Super Hearts", sublabel: "Prioridad en historias y corazones animados." },
            { id: "p2", dx: -340, dy: 115, side: "left", tag: "Visualización", label: "Story Preview en secreto", sublabel: "Mira historias sin que lo sepan y descubre quién repitió las tuyas." },
            { id: "p3", dx: -340, dy: 270, side: "left", tag: "Personalización", label: "Posts fijados y fuentes", sublabel: "Fija hasta 6 publicaciones y publica sin aparecer en el feed." }
          ]
        },
      },
      {
        id: "B",
        position: { x: 0, y: 370 },
        data: {
          kind: "phase", tag: "Fase 1", confidence: "confirmed",
          label: "El algoritmo lo etiqueta",
          sublabel: "Audio, texto en pantalla, hashtags y tema: así decide a quién mostrárselo",
        },
      },
      {
        id: "C",
        position: { x: 0, y: 560 },
        data: {
          kind: "phase", tag: "Fase 2 · Ronda 1", confidence: "likely",
          image: vistasLight, imageDark: vistasDark,
          label: "Se muestra a ~100-500 personas",
          sublabel: "Una muestra pequeña de usuarios afines lo ve en su FYP. Aquí se mide todo.",
          details: [
            { id: "c1", dx: -580, dy: -280, side: "left", tag: "Señal", icon: iconPlay, confidence: "likely", label: "Retención de 3 segundos", sublabel: "¿Deslizan o se quedan? Si la mayoría hace scroll antes del segundo 3, no hay ronda 2." },
            { id: "c2", dx: -580, dy: -120, side: "left", tag: "Señal", icon: iconHeart, confidence: "likely", label: "Likes y comentarios tempranos", sublabel: "La reacción de la muestra pesa más por ser pocos: cada like cuenta mucho." },
            { id: "c3", dx: -580, dy: 40, side: "left", tag: "Señal", icon: iconShare, confidence: "likely", label: "Compartidos y guardados", sublabel: "Las señales más caras de conseguir: valen más que cualquier like." },
          ],
        },
      },
      {
        id: "D",
        position: { x: 0, y: 880 },
        data: {
          kind: "decision", tag: "Decisión", confidence: "likely",
          label: "¿La muestra reaccionó mejor que videos similares?",
        },
      },
      {
        id: "E",
        position: { x: -480, y: 1290 },
        data: {
          kind: "fail", tag: "Resultado", confidence: "likely",
          image: resNegLight, imageDark: resNegDark,
          label: "Se detiene la distribución",
          sublabel: "No castiga tu cuenta: el siguiente video vuelve a empezar de cero",
        },
      },
      {
        id: "F",
        position: { x: 480, y: 1100 },
        data: {
          kind: "phase", tag: "Fase 3 · Ronda 2", confidence: "likely",
          label: "Escala a ~1.000-5.000 personas",
          sublabel: "Audiencia más amplia y diversa; se repite la misma medición",
        },
      },
      {
        id: "G",
        position: { x: 480, y: 1290 },
        data: {
          kind: "decision", tag: "Decisión", confidence: "likely",
          label: "¿Mantiene las señales al crecer?",
          details: [
            { id: "g1", dx: 360, dy: -140, side: "right", tag: "Métrica", confidence: "hypothesis", label: "Benchmark de interacción", sublabel: "Arriba de 6-8% de interacción en la ronda semilla suele escalar. Debajo de 3%, difícil." },
            { id: "g2", dx: 360, dy: 20, side: "right", tag: "Tip", label: "Responde comentarios con video", sublabel: "Cada respuesta reinicia el ciclo de distribución del video original." },
          ],
        },
      },
      {
        id: "H",
        position: { x: 480, y: 1510 },
        data: {
          kind: "success", tag: "Resultado", confidence: "likely",
          image: feedLight, imageDark: feedDark,
          label: "Rondas crecientes: 10K → 100K → 1M",
          sublabel: "Cada ronda repite la prueba. Mientras siga ganando, sigue escalando.",
        },
      },
    ],
    edges: [
      { id: "eA-OBJ", source: "A", target: "OBJ", sourceHandle: "l-s", targetHandle: "r-t", dashed: true },
      { id: "eA-S", source: "A", target: "S", sourceHandle: "r-s", targetHandle: "l-t", dashed: true },
      { id: "eA-PLUS", source: "A", target: "PLUS", sourceHandle: "l-s", targetHandle: "r-t", dashed: true },
      { id: "eA-ADS", source: "A", target: "A_ADS", label: "Anuncio Pagado", dashed: true },
      { id: "eA-ORG", source: "A", target: "A_ORG", label: "Orgánico" },
      { id: "eORG-B", source: "A_ORG", target: "B" },
      { id: "eB-C", source: "B", target: "C" },
      { id: "eC-D", source: "C", target: "D" },
      { id: "eD-E", source: "D", target: "E", label: "No" },
      { id: "eD-F", source: "D", target: "F", label: "Sí" },
      { id: "eF-G", source: "F", target: "G" },
      { id: "eG-E", source: "G", target: "E", sourceHandle: "l-s", targetHandle: "r-t", label: "No" },
      { id: "eG-H", source: "G", target: "H", label: "Sí" },
      { id: "eH-G", source: "H", target: "G", sourceHandle: "r-s", targetHandle: "r-t", label: "Bucle", dashed: true },
    ],
  },

  instagram: {
    network: "instagram",
    title: "Trial Reels (Instagram)",
    nodes: [
      {
        id: "OBJ",
        position: { x: -560, y: 40 },
        data: {
          kind: "phase", tag: "Objetivo", confidence: "likely",
          label: "¿Qué maximiza Instagram?",
          sublabel: "Tiempo en la app y conexión entre personas: por eso los DMs pesan tanto.",
        },
      },
      {
        id: "A",
        position: { x: 0, y: 0 },
        data: {
          kind: "start", tag: "Inicio",
          image: videoLight, imageDark: videoDark,
          label: "Tipo de Publicación",
          sublabel: "¿Es un anuncio pagado o contenido orgánico?",
        },
      },
      {
        id: "A_ADS",
        position: { x: 450, y: 150 },
        data: {
          image: adsLight, imageDark: adsDark,
          kind: "phase", tag: "Ads",
          label: "Anuncio Pagado (Ads)",
          sublabel: "No depende del algoritmo orgánico. Escala mediante presupuesto (CPA / Subastas).",
        },
      },
      {
        id: "A_ORG",
        position: { x: 0, y: 180 },
        data: {
          kind: "phase", tag: "Orgánico",
          label: "Contenido Orgánico",
          sublabel: "Entra al Modo Prueba del algoritmo para ser evaluado.",
        },
      },
      {
        id: "S",
        position: { x: 560, y: 40 },
        data: {
          kind: "strategy", tag: "Jugadas",
          label: "Qué está funcionando ahora",
          sublabel: "Toca el ojo para ver las estrategias vigentes",
          details: [
            { id: "s1", dx: 340, dy: -40, side: "right", tag: "Estrategia", label: "Publica 3-5 trials por semana", sublabel: "Los trials no queman a tu audiencia: prueba variaciones sin miedo." },
            { id: "s2", dx: 340, dy: 115, side: "right", tag: "Estrategia", label: "Remix de ganadores", sublabel: "Cuando un trial gradúa, produce 2-3 variaciones del mismo ángulo." },
            { id: "s3", dx: 340, dy: 270, side: "right", tag: "Estrategia", label: "Texto grande + b-roll", sublabel: "El formato que más está graduando: frase potente sobre video en movimiento." },
            { id: "s4", dx: 340, dy: 425, side: "right", tag: "Estrategia", label: "Audio en tendencia", sublabel: "Úsalo en las primeras 24h de la tendencia; después pierde empuje." },
          ],
        },
      },
      {
        id: "PLUS",
        position: { x: -560, y: 370 },
        data: {
          kind: "strategy", tag: "Novedad 2026", confidence: "confirmed",
          label: "Instagram Plus",
          sublabel: "Nueva suscripción opcional de $3.99/mes con ventajas exclusivas",
          details: [
            { id: "p1", dx: -340, dy: -40, side: "left", tag: "Interacción", label: "Story Spotlight & Super Hearts", sublabel: "Prioridad en historias y corazones animados." },
            { id: "p2", dx: -340, dy: 115, side: "left", tag: "Visualización", label: "Story Preview en secreto", sublabel: "Mira historias sin que lo sepan y descubre quién repitió las tuyas." },
            { id: "p3", dx: -340, dy: 270, side: "left", tag: "Personalización", label: "Posts fijados y fuentes", sublabel: "Fija hasta 6 publicaciones y publica sin aparecer en el feed." }
          ]
        },
      },
      {
        id: "B",
        position: { x: 0, y: 370 },
        data: {
          kind: "phase", tag: "Fase 1 · Ronda 1", confidence: "confirmed",
          image: vistasLight, imageDark: vistasDark,
          label: "Audición: ~100-1.000 no seguidores",
          sublabel: "Instagram lo muestra a personas afines que NO te siguen",
        },
      },
      {
        id: "C",
        position: { x: 0, y: 690 },
        data: {
          kind: "phase", tag: "Fase 2", confidence: "hypothesis",
          image: tiempoLight, imageDark: tiempoDark,
          label: "Ventana crítica: ~90 minutos",
          sublabel: "El rendimiento inicial define si el reel escala o muere",
        },
      },
      {
        id: "D",
        position: { x: 0, y: 880 },
        data: {
          kind: "decision", tag: "Decisión", confidence: "likely",
          label: "¿Retiene y genera interacción en la audición?",
          details: [
            { id: "d1", dx: -580, dy: -280, side: "left", tag: "Señal", icon: iconPlay, confidence: "likely", label: "Retención de 3 segundos", sublabel: "% de gente que pasa del tercer segundo. Benchmark sano: 60% o más." },
            { id: "d2", dx: -580, dy: -120, side: "left", tag: "Señal", icon: iconHeart, confidence: "likely", label: "Interacción temprana", sublabel: "Likes y comentarios de la muestra; Instagram compara contra reels similares." },
            { id: "d3", dx: -580, dy: 40, side: "left", tag: "Tip", label: "Cómo mejorar el hook", sublabel: "Movimiento + texto grande en el primer frame. Sin intros: directo al valor." },
          ],
        },
      },
      {
        id: "E",
        position: { x: -480, y: 1290 },
        data: {
          kind: "fail", tag: "Resultado", confidence: "likely",
          image: resNegLight, imageDark: resNegDark,
          label: "Estrangulamiento",
          sublabel: "El reel no sale del grupo de prueba. Ajusta el hook y vuelve a intentar.",
        },
      },
      {
        id: "F",
        position: { x: 480, y: 1100 },
        data: {
          kind: "decision", tag: "Decisión · Ronda 2", confidence: "likely",
          label: "¿Genera DMs y compartidos? (dark social)",
          details: [
            { id: "f1", dx: 340, dy: -180, side: "right", tag: "Señal", icon: iconShare, confidence: "likely", label: "Dark social", sublabel: "DMs y compartidos pesan más que likes: señal de valor real entre amigos." },
            { id: "f2", dx: 340, dy: -20, side: "right", tag: "Métrica", confidence: "hypothesis", label: "Ratio shares / alcance", sublabel: "1 compartido por cada 100 vistas ya es señal fuerte para graduar." },
            { id: "f3", dx: 340, dy: 140, side: "right", tag: "Tip", label: "CTA que funciona", sublabel: "\"Mándaselo a alguien que…\" — pedir el share directo multiplica el dark social." },
          ],
        },
      },
      {
        id: "G",
        position: { x: 480, y: 1320 },
        data: {
          kind: "success", tag: "Resultado", confidence: "confirmed",
          image: feedCuentaLight, imageDark: feedCuentaDark,
          label: "Graduación",
          sublabel: "Explore, feed de Reels y ahora sí: tus seguidores",
        },
      },
    ],
    edges: [
      { id: "eA-OBJ", source: "A", target: "OBJ", sourceHandle: "l-s", targetHandle: "r-t", dashed: true },
      { id: "eA-S", source: "A", target: "S", sourceHandle: "r-s", targetHandle: "l-t", dashed: true },
      { id: "eA-PLUS", source: "A", target: "PLUS", sourceHandle: "l-s", targetHandle: "r-t", dashed: true },
      { id: "eA-ADS", source: "A", target: "A_ADS", label: "Anuncio Pagado", dashed: true },
      { id: "eA-ORG", source: "A", target: "A_ORG", label: "Orgánico" },
      { id: "eORG-B", source: "A_ORG", target: "B" },
      { id: "eB-C", source: "B", target: "C" },
      { id: "eC-D", source: "C", target: "D" },
      { id: "eD-E", source: "D", target: "E", label: "No" },
      { id: "eD-F", source: "D", target: "F", label: "Sí" },
      { id: "eF-E", source: "F", target: "E", sourceHandle: "l-s", targetHandle: "r-t", label: "Débil" },
      { id: "eF-G", source: "F", target: "G", label: "Fuerte" },
    ],
  },

  facebook: {
    network: "facebook",
    title: "Facebook EdgeRank",
    nodes: [
      {
        id: "OBJ",
        position: { x: -560, y: 40 },
        data: {
          kind: "phase", tag: "Objetivo", confidence: "confirmed",
          label: "¿Qué maximiza Facebook?",
          sublabel: "Interacciones significativas: conversaciones reales entre personas.",
        },
      },
      {
        id: "A",
        position: { x: 0, y: 0 },
        data: {
          kind: "start", tag: "Inicio",
          image: videoLight, imageDark: videoDark,
          label: "Publicas contenido",
          sublabel: "Entra al inventario disponible para tu comunidad",
        },
      },
      {
        id: "S",
        position: { x: 560, y: 40 },
        data: {
          kind: "strategy", tag: "Jugadas",
          label: "Qué está funcionando ahora",
          sublabel: "Toca el ojo para ver las estrategias vigentes",
          details: [
            { id: "s1", dx: 340, dy: -20, side: "right", tag: "Estrategia", label: "Contenido que abre conversación", sublabel: "Las interacciones significativas (comentarios largos) disparan el alcance." },
            { id: "s2", dx: 340, dy: 135, side: "right", tag: "Estrategia", label: "Video nativo + Reels de FB", sublabel: "Facebook empuja fuerte su propio reproductor frente a links externos." },
            { id: "s3", dx: 340, dy: 290, side: "right", tag: "Estrategia", label: "Grupos y comunidad", sublabel: "El contenido de grupos activos aparece casi siempre arriba del feed." },
          ],
        },
      },
      {
        id: "PLUS",
        position: { x: -560, y: 370 },
        data: {
          kind: "strategy", tag: "Novedad 2026", confidence: "confirmed",
          label: "Instagram Plus",
          sublabel: "Nueva suscripción opcional de $3.99/mes con ventajas exclusivas",
          details: [
            { id: "p1", dx: -340, dy: -40, side: "left", tag: "Interacción", label: "Story Spotlight & Super Hearts", sublabel: "Prioridad en historias y corazones animados." },
            { id: "p2", dx: -340, dy: 115, side: "left", tag: "Visualización", label: "Story Preview en secreto", sublabel: "Mira historias sin que lo sepan y descubre quién repitió las tuyas." },
            { id: "p3", dx: -340, dy: 270, side: "left", tag: "Personalización", label: "Posts fijados y fuentes", sublabel: "Fija hasta 6 publicaciones y publica sin aparecer en el feed." }
          ]
        },
      },
      {
        id: "B",
        position: { x: 0, y: 370 },
        data: {
          kind: "phase", tag: "Fase 1", confidence: "confirmed",
          label: "Inventario",
          sublabel: "Todo lo disponible para cada usuario: amigos, páginas, grupos y ads",
        },
      },
      {
        id: "C",
        position: { x: 0, y: 560 },
        data: {
          kind: "phase", tag: "Fase 2", confidence: "confirmed",
          label: "Señales",
          sublabel: "Quién publicó, tipo de contenido, hora y las interacciones previas de cada usuario",
          details: [
            { id: "c1", dx: -580, dy: -120, side: "left", tag: "Señal", icon: iconLike, confidence: "confirmed", label: "Señales activas", sublabel: "Comentarios, compartidos y reacciones: las que más pesan." },
            { id: "c2", dx: -580, dy: 40, side: "left", tag: "Señal", icon: iconPlay, confidence: "confirmed", label: "Señales pasivas", sublabel: "Tiempo de visualización y clics: pesan menos, pero suman." },
          ],
        },
      },
      {
        id: "D",
        position: { x: 0, y: 750 },
        data: {
          kind: "phase", tag: "Fase 3", confidence: "confirmed",
          label: "Predicciones",
          sublabel: "Probabilidad de que cada usuario comente, comparta o reaccione",
        },
      },
      {
        id: "E",
        position: { x: 0, y: 940 },
        data: {
          kind: "phase", tag: "Fase 4", confidence: "confirmed",
          label: "Relevancy Score",
          sublabel: "Cada publicación recibe un puntaje personalizado por usuario",
        },
      },
      {
        id: "F",
        position: { x: 0, y: 1130 },
        data: {
          kind: "success", tag: "Resultado", confidence: "confirmed",
          image: feedLight, imageDark: feedDark,
          label: "Feed ordenado",
          sublabel: "De mayor a menor puntaje, mezclado con ads",
        },
      },
    ],
    edges: [
      { id: "eA-OBJ", source: "A", target: "OBJ", sourceHandle: "l-s", targetHandle: "r-t", dashed: true },
      { id: "eA-S", source: "A", target: "S", sourceHandle: "r-s", targetHandle: "l-t", dashed: true },
      { id: "eA-PLUS", source: "A", target: "PLUS", sourceHandle: "l-s", targetHandle: "r-t", dashed: true },
      { id: "eA-ADS", source: "A", target: "A_ADS", label: "Anuncio Pagado", dashed: true },
      { id: "eA-ORG", source: "A", target: "A_ORG", label: "Orgánico" },
      { id: "eORG-B", source: "A_ORG", target: "B" },
      { id: "eB-C", source: "B", target: "C" },
      { id: "eC-D", source: "C", target: "D" },
      { id: "eD-E", source: "D", target: "E" },
      { id: "eE-F", source: "E", target: "F" },
    ],
  },

  youtube: {
    network: "youtube",
    title: "YouTube Shorts",
    nodes: [
      {
        id: "OBJ",
        position: { x: -560, y: 40 },
        data: {
          kind: "phase", tag: "Objetivo", confidence: "confirmed",
          label: "¿Qué maximiza YouTube?",
          sublabel: "Satisfacción del espectador: lo mide directamente con encuestas.",
        },
      },
      {
        id: "A",
        position: { x: 0, y: 0 },
        data: {
          kind: "start", tag: "Inicio",
          image: videoHorizontalLight, imageDark: videoHorizontalDark,
          label: "Tipo de Publicación",
          sublabel: "¿Es un anuncio pagado o contenido orgánico?",
        },
      },
      {
        id: "A_ADS",
        position: { x: 450, y: 150 },
        data: {
          image: adsLight, imageDark: adsDark,
          kind: "phase", tag: "Ads",
          label: "Anuncio Pagado (Ads)",
          sublabel: "No depende del algoritmo orgánico. Escala mediante presupuesto (CPA / Subastas).",
        },
      },
      {
        id: "A_ORG",
        position: { x: 0, y: 180 },
        data: {
          kind: "phase", tag: "Orgánico",
          label: "Contenido Orgánico",
          sublabel: "Se distribuye basado en el CTR (Visto vs Deslizado) inicial.",
        },
      },
      {
        id: "S",
        position: { x: 560, y: 40 },
        data: {
          kind: "strategy", tag: "Jugadas",
          label: "Qué está funcionando ahora",
          sublabel: "Toca el ojo para ver las estrategias vigentes",
          details: [
            { id: "s1", dx: 340, dy: -20, side: "right", tag: "Estrategia", label: "50-60 segundos", sublabel: "La duración con mejor consumo: historia completa sin relleno." },
            { id: "s2", dx: 340, dy: 135, side: "right", tag: "Estrategia", label: "Conecta Shorts a tu canal", sublabel: "Shorts que llevan a videos largos convierten viewers en suscriptores." },
            { id: "s3", dx: 340, dy: 290, side: "right", tag: "Estrategia", label: "Títulos como búsqueda", sublabel: "Los Shorts se indexan: usa la frase exacta que buscaría tu audiencia." },
          ],
        },
      },
      {
        id: "PLUS",
        position: { x: -560, y: 370 },
        data: {
          kind: "strategy", tag: "Novedad 2026", confidence: "confirmed",
          label: "Instagram Plus",
          sublabel: "Nueva suscripción opcional de $3.99/mes con ventajas exclusivas",
          details: [
            { id: "p1", dx: -340, dy: -40, side: "left", tag: "Interacción", label: "Story Spotlight & Super Hearts", sublabel: "Prioridad en historias y corazones animados." },
            { id: "p2", dx: -340, dy: 115, side: "left", tag: "Visualización", label: "Story Preview en secreto", sublabel: "Mira historias sin que lo sepan y descubre quién repitió las tuyas." },
            { id: "p3", dx: -340, dy: 270, side: "left", tag: "Personalización", label: "Posts fijados y fuentes", sublabel: "Fija hasta 6 publicaciones y publica sin aparecer en el feed." }
          ]
        },
      },
      {
        id: "B",
        position: { x: 0, y: 370 },
        data: {
          kind: "phase", tag: "Fase 1 · Ronda 1", confidence: "likely",
          image: vistasLight, imageDark: vistasDark,
          label: "Muestra semilla en el feed de Shorts",
          sublabel: "Se enseña a un grupo de usuarios afines y se mide la reacción",
        },
      },
      {
        id: "C",
        position: { x: 0, y: 690 },
        data: {
          kind: "decision", tag: "Decisión", confidence: "confirmed",
          label: "¿Visto o deslizado?",
          details: [
            { id: "c1", dx: -580, dy: -120, side: "left", tag: "Métrica", icon: iconPlay, confidence: "confirmed", label: "Viewed vs. Swiped", sublabel: "La métrica clave de Shorts: % que decide quedarse al ver el primer frame." },
            { id: "c2", dx: -580, dy: 40, side: "left", tag: "Tip", label: "El primer fotograma", sublabel: "Trátalo como una miniatura: composición clara y texto legible." },
          ],
        },
      },
      {
        id: "D",
        position: { x: -480, y: 1100 },
        data: {
          kind: "fail", tag: "Resultado", confidence: "likely",
          image: resNegLight, imageDark: resNegDark,
          label: "Short frenado",
          sublabel: "Alto swipe-away: el feed deja de mostrarlo",
        },
      },
      {
        id: "E",
        position: { x: 480, y: 910 },
        data: {
          kind: "phase", tag: "Fase 2 · Ronda 2", confidence: "likely",
          label: "Escala a más feeds y regiones",
          sublabel: "Se mide el AVD: % del video consumido. Punto dulce: 50-60 segundos.",
        },
      },
      {
        id: "F",
        position: { x: 480, y: 1100 },
        data: {
          kind: "decision", tag: "Decisión", confidence: "confirmed",
          label: "¿Alta satisfacción del espectador?",
          details: [
            { id: "f1", dx: 340, dy: -120, side: "right", tag: "Métrica", icon: iconLike, confidence: "confirmed", label: "Encuestas de satisfacción", sublabel: "YouTube pregunta directamente y ajusta la distribución con las respuestas." },
            { id: "f2", dx: 340, dy: 40, side: "right", tag: "Métrica", confidence: "likely", label: "Sesión que continúa", sublabel: "Si después de tu Short siguen viendo más, el sistema te premia." },
          ],
        },
      },
      {
        id: "G",
        position: { x: 480, y: 1320 },
        data: {
          kind: "success", tag: "Resultado", confidence: "likely",
          image: resPosLight, imageDark: resPosDark,
          label: "Acervo evergreen",
          sublabel: "Resurge en picos estacionales y búsquedas durante meses",
        },
      },
    ],
    edges: [
      { id: "eA-OBJ", source: "A", target: "OBJ", sourceHandle: "l-s", targetHandle: "r-t", dashed: true },
      { id: "eA-S", source: "A", target: "S", sourceHandle: "r-s", targetHandle: "l-t", dashed: true },
      { id: "eA-PLUS", source: "A", target: "PLUS", sourceHandle: "l-s", targetHandle: "r-t", dashed: true },
      { id: "eA-ADS", source: "A", target: "A_ADS", label: "Anuncio Pagado", dashed: true },
      { id: "eA-ORG", source: "A", target: "A_ORG", label: "Orgánico" },
      { id: "eORG-B", source: "A_ORG", target: "B" },
      { id: "eB-C", source: "B", target: "C" },
      { id: "eC-D", source: "C", target: "D", label: "≥70% desliza" },
      { id: "eC-E", source: "C", target: "E", label: "Retiene" },
      { id: "eE-F", source: "E", target: "F" },
      { id: "eF-D", source: "F", target: "D", sourceHandle: "l-s", targetHandle: "r-t", label: "No" },
      { id: "eF-G", source: "F", target: "G", label: "Sí" },
    ],
  },
};
