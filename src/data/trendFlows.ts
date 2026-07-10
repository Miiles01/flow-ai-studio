import type { TrendNodeKind } from "@/components/TrendFlowNode";

// ── Diagramas de arquitectura algorítmica por red social ──
// Cada nodo puede llevar `details` (las "raíces"): se muestran al tocar el ojo.
// `side` controla de qué lado del nodo padre salen las tarjetas de detalle.

export type TrendFlowDetail = {
  id: string;
  dx: number;
  dy: number;
  side?: "left" | "right" | "bottom";
  tag?: string;
  label: string;
  sublabel?: string;
};

export type TrendFlowNodeDef = {
  id: string;
  position: { x: number; y: number };
  data: {
    label: string;
    sublabel?: string;
    tag?: string;
    kind?: TrendNodeKind;
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
  instagram: {
    network: "instagram",
    title: "Trial Reels (Instagram)",
    nodes: [
      {
        id: "A",
        position: { x: 0, y: 0 },
        data: { kind: "start", tag: "Inicio", label: "Publicas un Trial Reel", sublabel: "El reel entra en fase de prueba automática" },
      },
      {
        id: "S",
        position: { x: 560, y: 0 },
        data: {
          kind: "strategy",
          tag: "Jugadas",
          label: "Qué está funcionando ahora",
          sublabel: "Toca el ojo para ver las estrategias vigentes",
          details: [
            { id: "s1", dx: -240, dy: 180, tag: "Estrategia", label: "Publica 3-5 trials por semana", sublabel: "Los trials no queman a tu audiencia: prueba variaciones sin miedo." },
            { id: "s2", dx: 20, dy: 180, tag: "Estrategia", label: "Remix de ganadores", sublabel: "Cuando un trial gradúa, produce 2-3 variaciones del mismo ángulo." },
            { id: "s3", dx: 280, dy: 180, tag: "Estrategia", label: "Texto grande + b-roll", sublabel: "El formato que más está graduando: frase potente sobre video en movimiento." },
            { id: "s4", dx: 540, dy: 180, tag: "Estrategia", label: "Audio en tendencia", sublabel: "Úsalo en las primeras 24h de la tendencia; después pierde empuje." },
          ],
        },
      },
      {
        id: "B",
        position: { x: 0, y: 190 },
        data: { kind: "phase", tag: "Fase 1", label: "Audición con NO seguidores", sublabel: "Instagram lo muestra primero a personas afines que no te siguen" },
      },
      {
        id: "C",
        position: { x: 0, y: 380 },
        data: { kind: "phase", tag: "Fase 2", label: "Ventana crítica: 90 minutos", sublabel: "El rendimiento inicial decide si el reel escala o muere" },
      },
      {
        id: "D",
        position: { x: 0, y: 570 },
        data: {
          kind: "decision",
          tag: "Decisión",
          label: "¿Retiene 60%+ en los primeros 3 segundos?",
          details: [
            { id: "d1", dx: -580, dy: -140, side: "left", tag: "Métrica", label: "Retención de 3 segundos", sublabel: "% de gente que pasa del tercer segundo. Benchmark sano: 60% o más." },
            { id: "d2", dx: -580, dy: 0, side: "left", tag: "Métrica", label: "Tiempo medio de visualización", sublabel: "Instagram compara tu promedio contra reels similares. Los loops lo elevan." },
            { id: "d3", dx: -580, dy: 140, side: "left", tag: "Tip", label: "Cómo mejorar el hook", sublabel: "Movimiento + texto grande en el primer frame. Sin intros: directo al valor." },
          ],
        },
      },
      {
        id: "E",
        position: { x: -480, y: 840 },
        data: { kind: "fail", tag: "Resultado", label: "Estrangulamiento", sublabel: "El reel no sale del grupo de prueba. Ajusta el hook y vuelve a intentar." },
      },
      {
        id: "F",
        position: { x: 480, y: 780 },
        data: {
          kind: "decision",
          tag: "Decisión",
          label: "¿Genera DMs y compartidos? (dark social)",
          details: [
            { id: "f1", dx: 320, dy: -140, side: "right", tag: "Métrica", label: "Dark social", sublabel: "DMs y compartidos pesan más que likes: señal de valor real entre amigos." },
            { id: "f2", dx: 320, dy: 0, side: "right", tag: "Métrica", label: "Ratio shares / alcance", sublabel: "1 compartido por cada 100 vistas ya es señal fuerte para graduar." },
            { id: "f3", dx: 320, dy: 140, side: "right", tag: "Tip", label: "CTA que funciona", sublabel: "\"Mándaselo a alguien que…\" — pedir el share directo multiplica el dark social." },
          ],
        },
      },
      {
        id: "G",
        position: { x: 480, y: 1000 },
        data: { kind: "success", tag: "Resultado", label: "Graduación", sublabel: "Salta a Explore, al feed de Reels y a tus seguidores" },
      },
    ],
    edges: [
      { id: "eA-B", source: "A", target: "B" },
      { id: "eA-S", source: "A", target: "S", sourceHandle: "r-s", targetHandle: "l-t", dashed: true },
      { id: "eB-C", source: "B", target: "C" },
      { id: "eC-D", source: "C", target: "D" },
      { id: "eD-E", source: "D", target: "E", label: "No", animated: false },
      { id: "eD-F", source: "D", target: "F", label: "Sí" },
      { id: "eF-E", source: "F", target: "E", label: "Débil", animated: false },
      { id: "eF-G", source: "F", target: "G", label: "Fuerte" },
    ],
  },

  tiktok: {
    network: "tiktok",
    title: "Algoritmo TikTok (FYP)",
    nodes: [
      {
        id: "A",
        position: { x: 0, y: 0 },
        data: { kind: "start", tag: "Inicio", label: "Publicas un video", sublabel: "Entra al sistema de distribución por círculos" },
      },
      {
        id: "S",
        position: { x: 560, y: 0 },
        data: {
          kind: "strategy",
          tag: "Jugadas",
          label: "Qué está funcionando ahora",
          sublabel: "Toca el ojo para ver las estrategias vigentes",
          details: [
            { id: "s1", dx: -240, dy: 180, tag: "Estrategia", label: "Videos de 7-15 segundos", sublabel: "Maximizan completion rate y loops. Ideal para crecer al inicio." },
            { id: "s2", dx: 20, dy: 180, tag: "Estrategia", label: "Loop perfecto", sublabel: "Que el final conecte con el inicio: lo ven 2-3 veces sin notarlo." },
            { id: "s3", dx: 280, dy: 180, tag: "Estrategia", label: "Series de contenido", sublabel: "Parte 1, 2, 3… disparan búsquedas de tu perfil y sesiones largas." },
            { id: "s4", dx: 540, dy: 180, tag: "Estrategia", label: "Las 3 primeras palabras", sublabel: "Dilas en voz y en texto: TikTok las indexa para búsqueda (SEO)." },
          ],
        },
      },
      {
        id: "B",
        position: { x: 0, y: 190 },
        data: { kind: "phase", tag: "Fase 1", label: "Ingesta y etiquetado", sublabel: "Clasifica audio, texto en pantalla, hashtags y ubicación" },
      },
      {
        id: "C",
        position: { x: 0, y: 380 },
        data: { kind: "phase", tag: "Fase 2", label: "Círculo semilla (~1.000 vistas)", sublabel: "Prueba con una audiencia pequeña y mide la reacción" },
      },
      {
        id: "D",
        position: { x: 0, y: 570 },
        data: {
          kind: "decision",
          tag: "Decisión",
          label: "¿Supera la prueba de los 3 segundos?",
          details: [
            { id: "d1", dx: -580, dy: -140, side: "left", tag: "Métrica", label: "Tasa de scroll", sublabel: "Si la mayoría desliza antes del segundo 3, el video muere en el círculo semilla." },
            { id: "d2", dx: -580, dy: 0, side: "left", tag: "Métrica", label: "Completion rate", sublabel: "% que ve el video completo. En videos de 7-15s es la métrica reina." },
            { id: "d3", dx: -580, dy: 140, side: "left", tag: "Métrica", label: "Saves y shares", sublabel: "Guardados y compartidos valen más que likes para escalar de círculo." },
          ],
        },
      },
      {
        id: "E",
        position: { x: -480, y: 840 },
        data: { kind: "fail", tag: "Resultado", label: "El video muere", sublabel: "Ratio de interacción bajo: no pasa al siguiente círculo" },
      },
      {
        id: "F",
        position: { x: 480, y: 780 },
        data: { kind: "phase", tag: "Fase 3", label: "Ratio de interacción (RI)", sublabel: "(likes + comentarios + shares + saves) ÷ vistas" },
      },
      {
        id: "G",
        position: { x: 480, y: 970 },
        data: {
          kind: "decision",
          tag: "Decisión",
          label: "¿RI mayor que la media de tu nicho?",
          details: [
            { id: "g1", dx: 320, dy: -100, side: "right", tag: "Métrica", label: "Benchmark de RI", sublabel: "Arriba de 6-8% en el círculo semilla suele escalar. Debajo de 3%, difícil." },
            { id: "g2", dx: 320, dy: 60, side: "right", tag: "Tip", label: "Responde comentarios con video", sublabel: "Cada respuesta reinicia el ciclo de distribución del video original." },
          ],
        },
      },
      {
        id: "H",
        position: { x: 480, y: 1190 },
        data: { kind: "success", tag: "Resultado", label: "Escala de círculos", sublabel: "10K → 100K → 500K… cada círculo repite la prueba" },
      },
    ],
    edges: [
      { id: "eA-B", source: "A", target: "B" },
      { id: "eA-S", source: "A", target: "S", sourceHandle: "r-s", targetHandle: "l-t", dashed: true },
      { id: "eB-C", source: "B", target: "C" },
      { id: "eC-D", source: "C", target: "D" },
      { id: "eD-E", source: "D", target: "E", label: "Alto scroll", animated: false },
      { id: "eD-F", source: "D", target: "F", label: "Retiene" },
      { id: "eF-G", source: "F", target: "G" },
      { id: "eG-E", source: "G", target: "E", label: "No", animated: false },
      { id: "eG-H", source: "G", target: "H", label: "Sí" },
      { id: "eH-G", source: "H", target: "G", sourceHandle: "r-s", targetHandle: "r-t", label: "Bucle", dashed: true },
    ],
  },

  facebook: {
    network: "facebook",
    title: "Facebook EdgeRank",
    nodes: [
      {
        id: "A",
        position: { x: 0, y: 0 },
        data: { kind: "phase", tag: "Fase 1", label: "Inventario", sublabel: "Todo lo disponible para ti: amigos, páginas, grupos y ads" },
      },
      {
        id: "S",
        position: { x: 560, y: 0 },
        data: {
          kind: "strategy",
          tag: "Jugadas",
          label: "Qué está funcionando ahora",
          sublabel: "Toca el ojo para ver las estrategias vigentes",
          details: [
            { id: "s1", dx: -240, dy: 180, tag: "Estrategia", label: "Contenido que abre conversación", sublabel: "Las interacciones significativas (comentarios largos) disparan el alcance." },
            { id: "s2", dx: 20, dy: 180, tag: "Estrategia", label: "Video nativo + Reels de FB", sublabel: "Facebook empuja fuerte su propio reproductor frente a links externos." },
            { id: "s3", dx: 280, dy: 180, tag: "Estrategia", label: "Grupos y comunidad", sublabel: "El contenido de grupos activos aparece casi siempre arriba del feed." },
          ],
        },
      },
      {
        id: "B",
        position: { x: 0, y: 190 },
        data: {
          kind: "phase",
          tag: "Fase 2",
          label: "Señales",
          sublabel: "Quién publicó, tipo de contenido, hora y tus interacciones previas",
          details: [
            { id: "b1", dx: -580, dy: -70, side: "left", tag: "Señal", label: "Señales activas", sublabel: "Comentarios, compartidos y reacciones: las que más pesan." },
            { id: "b2", dx: -580, dy: 70, side: "left", tag: "Señal", label: "Señales pasivas", sublabel: "Tiempo de visualización y clics: pesan menos, pero suman." },
          ],
        },
      },
      {
        id: "C",
        position: { x: 0, y: 380 },
        data: { kind: "phase", tag: "Fase 3", label: "Predicciones", sublabel: "Probabilidad de que comentes, compartas o reacciones" },
      },
      {
        id: "D",
        position: { x: 0, y: 570 },
        data: { kind: "phase", tag: "Fase 4", label: "Relevancy Score", sublabel: "Cada publicación recibe un puntaje personalizado para ti" },
      },
      {
        id: "E",
        position: { x: 0, y: 760 },
        data: { kind: "success", tag: "Resultado", label: "Feed ordenado", sublabel: "De mayor a menor puntaje, mezclado con ads" },
      },
    ],
    edges: [
      { id: "eA-B", source: "A", target: "B" },
      { id: "eA-S", source: "A", target: "S", sourceHandle: "r-s", targetHandle: "l-t", dashed: true },
      { id: "eB-C", source: "B", target: "C" },
      { id: "eC-D", source: "C", target: "D" },
      { id: "eD-E", source: "D", target: "E" },
    ],
  },

  youtube: {
    network: "youtube",
    title: "YouTube Shorts",
    nodes: [
      {
        id: "A",
        position: { x: 0, y: 0 },
        data: { kind: "start", tag: "Inicio", label: "Publicas un Short", sublabel: "Sin ventana de tiempo: puede escalar semanas después" },
      },
      {
        id: "S",
        position: { x: 560, y: 0 },
        data: {
          kind: "strategy",
          tag: "Jugadas",
          label: "Qué está funcionando ahora",
          sublabel: "Toca el ojo para ver las estrategias vigentes",
          details: [
            { id: "s1", dx: -240, dy: 180, tag: "Estrategia", label: "50-60 segundos", sublabel: "La duración con mejor consumo: historia completa sin relleno." },
            { id: "s2", dx: 20, dy: 180, tag: "Estrategia", label: "Conecta Shorts a tu canal", sublabel: "Shorts que llevan a videos largos convierten viewers en suscriptores." },
            { id: "s3", dx: 280, dy: 180, tag: "Estrategia", label: "Títulos como búsqueda", sublabel: "Los Shorts se indexan: usa la frase exacta que buscaría tu audiencia." },
          ],
        },
      },
      {
        id: "B",
        position: { x: 0, y: 190 },
        data: { kind: "phase", tag: "Fase 1", label: "Audiencia semilla", sublabel: "Se muestra en el feed de Shorts a usuarios afines" },
      },
      {
        id: "C",
        position: { x: 0, y: 380 },
        data: {
          kind: "decision",
          tag: "Decisión",
          label: "¿Visto o deslizado en el primer fotograma?",
          details: [
            { id: "c1", dx: -580, dy: -70, side: "left", tag: "Métrica", label: "Viewed vs. Swiped", sublabel: "La métrica clave de Shorts: % que decide quedarse al ver el primer frame." },
            { id: "c2", dx: -580, dy: 70, side: "left", tag: "Tip", label: "El primer fotograma", sublabel: "Trátalo como una miniatura: composición clara y texto legible." },
          ],
        },
      },
      {
        id: "D",
        position: { x: -480, y: 620 },
        data: { kind: "fail", tag: "Resultado", label: "Short frenado", sublabel: "Alto swipe-away: el feed deja de mostrarlo" },
      },
      {
        id: "E",
        position: { x: 480, y: 590 },
        data: { kind: "phase", tag: "Fase 2", label: "Duración vista (AVD)", sublabel: "% del video consumido; el punto dulce está en 50-60 segundos" },
      },
      {
        id: "F",
        position: { x: 480, y: 780 },
        data: {
          kind: "decision",
          tag: "Decisión",
          label: "¿Alta satisfacción del espectador?",
          details: [
            { id: "f1", dx: 320, dy: -100, side: "right", tag: "Métrica", label: "Encuestas de satisfacción", sublabel: "YouTube pregunta directamente y ajusta la distribución con las respuestas." },
            { id: "f2", dx: 320, dy: 60, side: "right", tag: "Métrica", label: "Sesión que continúa", sublabel: "Si después de tu Short siguen viendo más, el sistema te premia." },
          ],
        },
      },
      {
        id: "G",
        position: { x: 480, y: 1000 },
        data: { kind: "success", tag: "Resultado", label: "Acervo evergreen", sublabel: "Resurge en picos estacionales y búsquedas durante meses" },
      },
    ],
    edges: [
      { id: "eA-B", source: "A", target: "B" },
      { id: "eA-S", source: "A", target: "S", sourceHandle: "r-s", targetHandle: "l-t", dashed: true },
      { id: "eB-C", source: "B", target: "C" },
      { id: "eC-D", source: "C", target: "D", label: "≥70% desliza", animated: false },
      { id: "eC-E", source: "C", target: "E", label: "Retiene" },
      { id: "eE-F", source: "E", target: "F" },
      { id: "eF-D", source: "F", target: "D", label: "No", animated: false },
      { id: "eF-G", source: "F", target: "G", label: "Sí" },
    ],
  },
};
