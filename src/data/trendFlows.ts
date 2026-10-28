
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

export type TrendFlowVideo = {
  url: string;
  title: string;
  thumbnailUrl?: string;
  ariaLabel?: string;
  position: { x: number; y: number };
};

export type TrendFlow = {
  network: string;
  title: string;
  videos?: TrendFlowVideo[];
  nodes: TrendFlowNodeDef[];
  edges: TrendFlowEdgeDef[];
};

export const TREND_FLOWS: Record<string, TrendFlow> = {
  tiktok: {
    network: "tiktok",
    title: "architecture.flows.tiktok.title",
    videos: [
      {
        url: "https://www.youtube.com/watch?v=_wN0N9UtKls",
        title: "architecture.flows.tiktok.videos.0.title",
        ariaLabel: "architecture.flows.tiktok.videos.0.ariaLabel",
        position: { x: -360, y: 0 },
      },
      {
        url: "https://www.youtube.com/watch?v=ALk_hMPhC48",
        title: "architecture.flows.tiktok.videos.1.title",
        ariaLabel: "architecture.flows.tiktok.videos.1.ariaLabel",
        position: { x: -360, y: 900 },
      },
      {
        url: "https://www.youtube.com/watch?v=T9fFTnHuG-E",
        title: "architecture.flows.tiktok.videos.2.title",
        ariaLabel: "architecture.flows.tiktok.videos.2.ariaLabel",
        position: { x: 900, y: 1500 },
      },
    ],
    nodes: [
      {
        id: "A_TRIAL",
        position: { x: -500, y: 300 },
        data: {
          image: resNegLight, imageDark: resNegDark,
          kind: "phase", tag: "architecture.flows.tiktok.nodes.A_TRIAL.data.tag", confidence: "confirmed",
          label: "architecture.flows.tiktok.nodes.A_TRIAL.data.label",
          sublabel: "architecture.flows.tiktok.nodes.A_TRIAL.data.sublabel",
          details: [
            { id: "tr1", dx: -340, dy: 0, side: "left", tag: "architecture.flows.tiktok.nodes.A_TRIAL.data.details.tr1.tag", label: "architecture.flows.tiktok.nodes.A_TRIAL.data.details.tr1.label", sublabel: "architecture.flows.tiktok.nodes.A_TRIAL.data.details.tr1.sublabel" }
          ]
        },
      },
      {
        id: "A",
        position: { x: 0, y: 0 },
        data: {
          kind: "start", tag: "architecture.flows.tiktok.nodes.A.data.tag",
          image: videoLight, imageDark: videoDark,
          label: "architecture.flows.tiktok.nodes.A.data.label",
          sublabel: "architecture.flows.tiktok.nodes.A.data.sublabel",
        },
      },
      {
        id: "A_ADS",
        position: { x: 500, y: 300 },
        data: {
          image: adsLight, imageDark: adsDark,
          kind: "phase", tag: "architecture.flows.tiktok.nodes.A_ADS.data.tag",
          label: "architecture.flows.tiktok.nodes.A_ADS.data.label",
          sublabel: "architecture.flows.tiktok.nodes.A_ADS.data.sublabel",
          details: [
            { id: "ads1", dx: 340, dy: -60, side: "right", tag: "architecture.flows.tiktok.nodes.A_ADS.data.details.ads1.tag", label: "architecture.flows.tiktok.nodes.A_ADS.data.details.ads1.label", sublabel: "architecture.flows.tiktok.nodes.A_ADS.data.details.ads1.sublabel" },
            { id: "ads2", dx: 340, dy: 80, side: "right", tag: "architecture.flows.tiktok.nodes.A_ADS.data.details.ads2.tag", label: "architecture.flows.tiktok.nodes.A_ADS.data.details.ads2.label", sublabel: "architecture.flows.tiktok.nodes.A_ADS.data.details.ads2.sublabel" },
            { id: "ads3", dx: 340, dy: 220, side: "right", tag: "architecture.flows.tiktok.nodes.A_ADS.data.details.ads3.tag", label: "architecture.flows.tiktok.nodes.A_ADS.data.details.ads3.label", sublabel: "architecture.flows.tiktok.nodes.A_ADS.data.details.ads3.sublabel" }
          ],
        },
      },
      {
        id: "A_ORG",
        position: { x: 0, y: 300 },
        data: {
          kind: "phase", tag: "architecture.flows.tiktok.nodes.A_ORG.data.tag",
          label: "architecture.flows.tiktok.nodes.A_ORG.data.label",
          sublabel: "architecture.flows.tiktok.nodes.A_ORG.data.sublabel",
        },
      },
      {
        id: "S",
        position: { x: 1200, y: 300 },
        data: {
          kind: "strategy", tag: "architecture.flows.tiktok.nodes.S.data.tag",
          label: "architecture.flows.tiktok.nodes.S.data.label",
          sublabel: "architecture.flows.tiktok.nodes.S.data.sublabel",
          details: [
            { id: "s1", dx: 340, dy: -40, side: "right", tag: "architecture.flows.tiktok.nodes.S.data.details.s1.tag", label: "architecture.flows.tiktok.nodes.S.data.details.s1.label", sublabel: "architecture.flows.tiktok.nodes.S.data.details.s1.sublabel" },
            { id: "s2", dx: 340, dy: 115, side: "right", tag: "architecture.flows.tiktok.nodes.S.data.details.s2.tag", label: "architecture.flows.tiktok.nodes.S.data.details.s2.label", sublabel: "architecture.flows.tiktok.nodes.S.data.details.s2.sublabel" },
            { id: "s3", dx: 340, dy: 270, side: "right", tag: "architecture.flows.tiktok.nodes.S.data.details.s3.tag", label: "architecture.flows.tiktok.nodes.S.data.details.s3.label", sublabel: "architecture.flows.tiktok.nodes.S.data.details.s3.sublabel" },
            { id: "s4", dx: 340, dy: 425, side: "right", tag: "architecture.flows.tiktok.nodes.S.data.details.s4.tag", label: "architecture.flows.tiktok.nodes.S.data.details.s4.label", sublabel: "architecture.flows.tiktok.nodes.S.data.details.s4.sublabel" },
          ],
        },
      },
      {
        id: "B",
        position: { x: 0, y: 600 },
        data: {
          kind: "phase", tag: "architecture.flows.tiktok.nodes.B.data.tag", confidence: "confirmed",
          label: "architecture.flows.tiktok.nodes.B.data.label",
          sublabel: "architecture.flows.tiktok.nodes.B.data.sublabel",
        },
      },
      {
        id: "C",
        position: { x: 0, y: 900 },
        data: {
          kind: "phase", tag: "architecture.flows.tiktok.nodes.C.data.tag", confidence: "likely",
          image: vistasLight, imageDark: vistasDark,
          label: "architecture.flows.tiktok.nodes.C.data.label",
          sublabel: "architecture.flows.tiktok.nodes.C.data.sublabel",
          details: [
            { id: "c1", dx: -440, dy: -280, side: "left", tag: "architecture.flows.tiktok.nodes.C.data.details.c1.tag", icon: iconPlay, confidence: "likely", label: "architecture.flows.tiktok.nodes.C.data.details.c1.label", sublabel: "architecture.flows.tiktok.nodes.C.data.details.c1.sublabel" },
            { id: "c2", dx: -440, dy: -120, side: "left", tag: "architecture.flows.tiktok.nodes.C.data.details.c2.tag", icon: iconHeart, confidence: "likely", label: "architecture.flows.tiktok.nodes.C.data.details.c2.label", sublabel: "architecture.flows.tiktok.nodes.C.data.details.c2.sublabel" },
            { id: "c3", dx: -440, dy: 40, side: "left", tag: "architecture.flows.tiktok.nodes.C.data.details.c3.tag", icon: iconShare, confidence: "likely", label: "architecture.flows.tiktok.nodes.C.data.details.c3.label", sublabel: "architecture.flows.tiktok.nodes.C.data.details.c3.sublabel" },
          ],
        },
      },
      {
        id: "D",
        position: { x: 0, y: 1200 },
        data: {
          kind: "decision", tag: "architecture.flows.tiktok.nodes.D.data.tag", confidence: "likely",
          label: "architecture.flows.tiktok.nodes.D.data.label",
          details: [
            { id: "d1_tk", dx: -440, dy: -40, side: "left", tag: "architecture.flows.tiktok.nodes.D.data.details.d1_tk.tag", label: "architecture.flows.tiktok.nodes.D.data.details.d1_tk.label", sublabel: "architecture.flows.tiktok.nodes.D.data.details.d1_tk.sublabel" }
          ],
        },
      },
      {
        id: "E",
        position: { x: -500, y: 1500 },
        data: {
          kind: "fail", tag: "architecture.flows.tiktok.nodes.E.data.tag", confidence: "likely",
          image: resNegLight, imageDark: resNegDark,
          label: "architecture.flows.tiktok.nodes.E.data.label",
          sublabel: "architecture.flows.tiktok.nodes.E.data.sublabel",
        },
      },
      {
        id: "F",
        position: { x: 500, y: 1500 },
        data: {
          kind: "phase", tag: "architecture.flows.tiktok.nodes.F.data.tag", confidence: "likely",
          label: "architecture.flows.tiktok.nodes.F.data.label",
          sublabel: "architecture.flows.tiktok.nodes.F.data.sublabel",
        },
      },
      {
        id: "G",
        position: { x: 500, y: 1800 },
        data: {
          kind: "decision", tag: "architecture.flows.tiktok.nodes.G.data.tag", confidence: "likely",
          label: "architecture.flows.tiktok.nodes.G.data.label",
          details: [
            { id: "g1", dx: 340, dy: -140, side: "right", tag: "architecture.flows.tiktok.nodes.G.data.details.g1.tag", confidence: "hypothesis", label: "architecture.flows.tiktok.nodes.G.data.details.g1.label", sublabel: "architecture.flows.tiktok.nodes.G.data.details.g1.sublabel" },
            { id: "g2", dx: 340, dy: 20, side: "right", tag: "architecture.flows.tiktok.nodes.G.data.details.g2.tag", label: "architecture.flows.tiktok.nodes.G.data.details.g2.label", sublabel: "architecture.flows.tiktok.nodes.G.data.details.g2.sublabel" },
          ],
        },
      },
      {
        id: "H",
        position: { x: 500, y: 2100 },
        data: {
          kind: "success", tag: "architecture.flows.tiktok.nodes.H.data.tag", confidence: "likely",
          image: feedLight, imageDark: feedDark,
          label: "architecture.flows.tiktok.nodes.H.data.label",
          sublabel: "architecture.flows.tiktok.nodes.H.data.sublabel",
        },
      },
    ],
    edges: [
      { id: "evid-0", source: "video-tiktok-0", target: "A", sourceHandle: "r-s", targetHandle: "l-t", dashed: true, animated: true },
      { id: "evid-1", source: "video-tiktok-1", target: "C", sourceHandle: "r-s", targetHandle: "l-t", dashed: true, animated: true },
      { id: "evid-2", source: "video-tiktok-2", target: "F", sourceHandle: "l-s", targetHandle: "r-t", dashed: true, animated: true },
      { id: "eA-S", source: "A", target: "S", dashed: true },
      { id: "eA-ADS", source: "A", target: "A_ADS", label: "architecture.flows.tiktok.edges.eA-ADS.label", dashed: true },
      { id: "eA-TRIAL", source: "A", target: "A_TRIAL", label: "architecture.flows.tiktok.edges.eA-TRIAL.label", dashed: true },
      { id: "eA-ORG", source: "A", target: "A_ORG", label: "architecture.flows.tiktok.edges.eA-ORG.label" },
      { id: "eORG-B", source: "A_ORG", target: "B" },
      { id: "eB-C", source: "B", target: "C" },
      { id: "eC-D", source: "C", target: "D" },
      { id: "eD-E", source: "D", target: "E", label: "architecture.flows.tiktok.edges.eD-E.label" },
      { id: "eD-F", source: "D", target: "F", label: "architecture.flows.tiktok.edges.eD-F.label" },
      { id: "eF-G", source: "F", target: "G" },
      { id: "eG-E", source: "G", target: "E", sourceHandle: "l-s", targetHandle: "r-t", label: "architecture.flows.tiktok.edges.eG-E.label" },
      { id: "eG-H", source: "G", target: "H", label: "architecture.flows.tiktok.edges.eG-H.label" },
      { id: "eH-G", source: "H", target: "G", sourceHandle: "r-s", targetHandle: "r-t", label: "architecture.flows.tiktok.edges.eH-G.label", dashed: true },
    ],
  },

  instagram: {
    network: "instagram",
    title: "architecture.flows.instagram.title",
    videos: [
      {
        url: "https://www.youtube.com/watch?v=6XA4kiMJD9I",
        title: "architecture.flows.instagram.videos.0.title",
        ariaLabel: "architecture.flows.instagram.videos.0.ariaLabel",
        position: { x: -360, y: 0 },
      },
      {
        url: "https://www.youtube.com/watch?v=P0I2LvSuJo0",
        title: "architecture.flows.instagram.videos.1.title",
        ariaLabel: "architecture.flows.instagram.videos.1.ariaLabel",
        position: { x: -360, y: 900 },
      },
      {
        url: "https://www.youtube.com/watch?v=yKDiu4bwHUA",
        title: "architecture.flows.instagram.videos.2.title",
        ariaLabel: "architecture.flows.instagram.videos.2.ariaLabel",
        position: { x: -860, y: 300 },
      },
    ],
    nodes: [
      {
        id: "A",
        position: { x: 0, y: 0 },
        data: {
          kind: "start", tag: "architecture.flows.instagram.nodes.A.data.tag",
          image: videoLight, imageDark: videoDark,
          label: "architecture.flows.instagram.nodes.A.data.label",
          sublabel: "architecture.flows.instagram.nodes.A.data.sublabel",
        },
      },
      {
        id: "A_ADS",
        position: { x: 500, y: 300 },
        data: {
          image: adsLight, imageDark: adsDark,
          kind: "phase", tag: "architecture.flows.instagram.nodes.A_ADS.data.tag",
          label: "architecture.flows.instagram.nodes.A_ADS.data.label",
          sublabel: "architecture.flows.instagram.nodes.A_ADS.data.sublabel",
          details: [
            { id: "ads1", dx: 340, dy: -60, side: "right", tag: "architecture.flows.instagram.nodes.A_ADS.data.details.ads1.tag", label: "architecture.flows.instagram.nodes.A_ADS.data.details.ads1.label", sublabel: "architecture.flows.instagram.nodes.A_ADS.data.details.ads1.sublabel" },
            { id: "ads2", dx: 340, dy: 80, side: "right", tag: "architecture.flows.instagram.nodes.A_ADS.data.details.ads2.tag", label: "architecture.flows.instagram.nodes.A_ADS.data.details.ads2.label", sublabel: "architecture.flows.instagram.nodes.A_ADS.data.details.ads2.sublabel" },
            { id: "ads3", dx: 340, dy: 220, side: "right", tag: "architecture.flows.instagram.nodes.A_ADS.data.details.ads3.tag", label: "architecture.flows.instagram.nodes.A_ADS.data.details.ads3.label", sublabel: "architecture.flows.instagram.nodes.A_ADS.data.details.ads3.sublabel" }
          ],
        },
      },
      {
        id: "A_ORG",
        position: { x: 0, y: 300 },
        data: {
          kind: "phase", tag: "architecture.flows.instagram.nodes.A_ORG.data.tag",
          label: "architecture.flows.instagram.nodes.A_ORG.data.label",
          sublabel: "architecture.flows.instagram.nodes.A_ORG.data.sublabel",
        },
      },
      {
        id: "S",
        position: { x: 1200, y: 300 },
        data: {
          kind: "strategy", tag: "architecture.flows.instagram.nodes.S.data.tag",
          label: "architecture.flows.instagram.nodes.S.data.label",
          sublabel: "architecture.flows.instagram.nodes.S.data.sublabel",
          details: [
            { id: "s1", dx: 340, dy: -40, side: "right", tag: "architecture.flows.instagram.nodes.S.data.details.s1.tag", label: "architecture.flows.instagram.nodes.S.data.details.s1.label", sublabel: "architecture.flows.instagram.nodes.S.data.details.s1.sublabel" },
            { id: "s2", dx: 340, dy: 115, side: "right", tag: "architecture.flows.instagram.nodes.S.data.details.s2.tag", label: "architecture.flows.instagram.nodes.S.data.details.s2.label", sublabel: "architecture.flows.instagram.nodes.S.data.details.s2.sublabel" },
            { id: "s3", dx: 340, dy: 270, side: "right", tag: "architecture.flows.instagram.nodes.S.data.details.s3.tag", label: "architecture.flows.instagram.nodes.S.data.details.s3.label", sublabel: "architecture.flows.instagram.nodes.S.data.details.s3.sublabel" },
            { id: "s4", dx: 340, dy: 425, side: "right", tag: "architecture.flows.instagram.nodes.S.data.details.s4.tag", label: "architecture.flows.instagram.nodes.S.data.details.s4.label", sublabel: "architecture.flows.instagram.nodes.S.data.details.s4.sublabel" },
          ],
        },
      },
      {
        id: "PLUS",
        position: { x: -1200, y: 300 },
        data: {
          kind: "strategy", tag: "architecture.flows.instagram.nodes.PLUS.data.tag", confidence: "confirmed",
          label: "architecture.flows.instagram.nodes.PLUS.data.label",
          sublabel: "architecture.flows.instagram.nodes.PLUS.data.sublabel",
          details: [
            { id: "p1", dx: -340, dy: -120, side: "left", tag: "architecture.flows.instagram.nodes.PLUS.data.details.p1.tag", label: "architecture.flows.instagram.nodes.PLUS.data.details.p1.label", sublabel: "architecture.flows.instagram.nodes.PLUS.data.details.p1.sublabel" },
            { id: "p2", dx: -340, dy: 35, side: "left", tag: "architecture.flows.instagram.nodes.PLUS.data.details.p2.tag", label: "architecture.flows.instagram.nodes.PLUS.data.details.p2.label", sublabel: "architecture.flows.instagram.nodes.PLUS.data.details.p2.sublabel" },
            { id: "p3", dx: -340, dy: 190, side: "left", tag: "architecture.flows.instagram.nodes.PLUS.data.details.p3.tag", label: "architecture.flows.instagram.nodes.PLUS.data.details.p3.label", sublabel: "architecture.flows.instagram.nodes.PLUS.data.details.p3.sublabel" },
            { id: "p4", dx: -340, dy: 345, side: "left", tag: "architecture.flows.instagram.nodes.PLUS.data.details.p4.tag", label: "architecture.flows.instagram.nodes.PLUS.data.details.p4.label", sublabel: "architecture.flows.instagram.nodes.PLUS.data.details.p4.sublabel" }
          ]
        },
      },
      {
        id: "B",
        position: { x: 0, y: 600 },
        data: {
          kind: "phase", tag: "architecture.flows.instagram.nodes.B.data.tag", confidence: "confirmed",
          image: vistasLight, imageDark: vistasDark,
          label: "architecture.flows.instagram.nodes.B.data.label",
          sublabel: "architecture.flows.instagram.nodes.B.data.sublabel",
        },
      },
      {
        id: "C",
        position: { x: 0, y: 900 },
        data: {
          kind: "phase", tag: "architecture.flows.instagram.nodes.C.data.tag", confidence: "hypothesis",
          image: tiempoLight, imageDark: tiempoDark,
          label: "architecture.flows.instagram.nodes.C.data.label",
          sublabel: "architecture.flows.instagram.nodes.C.data.sublabel",
        },
      },
      {
        id: "D",
        position: { x: 0, y: 1200 },
        data: {
          kind: "decision", tag: "architecture.flows.instagram.nodes.D.data.tag", confidence: "likely",
          label: "architecture.flows.instagram.nodes.D.data.label",
          details: [
            { id: "d1", dx: -440, dy: -280, side: "left", tag: "architecture.flows.instagram.nodes.D.data.details.d1.tag", icon: iconPlay, confidence: "likely", label: "architecture.flows.instagram.nodes.D.data.details.d1.label", sublabel: "architecture.flows.instagram.nodes.D.data.details.d1.sublabel" },
            { id: "d2", dx: -440, dy: -120, side: "left", tag: "architecture.flows.instagram.nodes.D.data.details.d2.tag", icon: iconHeart, confidence: "likely", label: "architecture.flows.instagram.nodes.D.data.details.d2.label", sublabel: "architecture.flows.instagram.nodes.D.data.details.d2.sublabel" },
            { id: "d3", dx: -440, dy: 40, side: "left", tag: "architecture.flows.instagram.nodes.D.data.details.d3.tag", label: "architecture.flows.instagram.nodes.D.data.details.d3.label", sublabel: "architecture.flows.instagram.nodes.D.data.details.d3.sublabel" },
          ],
        },
      },
      {
        id: "E",
        position: { x: -500, y: 1500 },
        data: {
          kind: "fail", tag: "architecture.flows.instagram.nodes.E.data.tag", confidence: "likely",
          image: resNegLight, imageDark: resNegDark,
          label: "architecture.flows.instagram.nodes.E.data.label",
          sublabel: "architecture.flows.instagram.nodes.E.data.sublabel",
        },
      },
      {
        id: "F",
        position: { x: 500, y: 1500 },
        data: {
          kind: "decision", tag: "architecture.flows.instagram.nodes.F.data.tag", confidence: "likely",
          label: "architecture.flows.instagram.nodes.F.data.label",
          details: [
            { id: "f1", dx: 340, dy: -180, side: "right", tag: "architecture.flows.instagram.nodes.F.data.details.f1.tag", icon: iconShare, confidence: "likely", label: "architecture.flows.instagram.nodes.F.data.details.f1.label", sublabel: "architecture.flows.instagram.nodes.F.data.details.f1.sublabel" },
            { id: "f2", dx: 340, dy: -20, side: "right", tag: "architecture.flows.instagram.nodes.F.data.details.f2.tag", confidence: "hypothesis", label: "architecture.flows.instagram.nodes.F.data.details.f2.label", sublabel: "architecture.flows.instagram.nodes.F.data.details.f2.sublabel" },
            { id: "f3", dx: 340, dy: 140, side: "right", tag: "architecture.flows.instagram.nodes.F.data.details.f3.tag", label: "architecture.flows.instagram.nodes.F.data.details.f3.label", sublabel: "architecture.flows.instagram.nodes.F.data.details.f3.sublabel" },
          ],
        },
      },
      {
        id: "G",
        position: { x: 500, y: 1800 },
        data: {
          kind: "success", tag: "architecture.flows.instagram.nodes.G.data.tag", confidence: "confirmed",
          image: feedCuentaLight, imageDark: feedCuentaDark,
          label: "architecture.flows.instagram.nodes.G.data.label",
          sublabel: "architecture.flows.instagram.nodes.G.data.sublabel",
          details: [
            { id: "g1", dx: -440, dy: -100, side: "left", tag: "architecture.flows.instagram.nodes.G.data.details.g1.tag", label: "architecture.flows.instagram.nodes.G.data.details.g1.label", sublabel: "architecture.flows.instagram.nodes.G.data.details.g1.sublabel" },
            { id: "g2", dx: -440, dy: 60, side: "left", tag: "architecture.flows.instagram.nodes.G.data.details.g2.tag", label: "architecture.flows.instagram.nodes.G.data.details.g2.label", sublabel: "architecture.flows.instagram.nodes.G.data.details.g2.sublabel" },
            { id: "g3", dx: -440, dy: 220, side: "left", tag: "architecture.flows.instagram.nodes.G.data.details.g3.tag", label: "architecture.flows.instagram.nodes.G.data.details.g3.label", sublabel: "architecture.flows.instagram.nodes.G.data.details.g3.sublabel" }
          ],
        },
      },
    ],
    edges: [
      { id: "evid-0", source: "video-instagram-0", target: "A", sourceHandle: "r-s", targetHandle: "l-t", dashed: true, animated: true },
      { id: "evid-1", source: "video-instagram-1", target: "C", sourceHandle: "r-s", targetHandle: "l-t", dashed: true, animated: true },
      { id: "evid-2", source: "video-instagram-2", target: "A_TRIAL", sourceHandle: "r-s", targetHandle: "l-t", dashed: true, animated: true },
      { id: "eA-S", source: "A", target: "S", dashed: true },
      { id: "eA-PLUS", source: "A", target: "PLUS", dashed: true },
      { id: "eA-ADS", source: "A", target: "A_ADS", label: "architecture.flows.instagram.edges.eA-ADS.label", dashed: true },
      { id: "eA-TRIAL", source: "A", target: "A_TRIAL", label: "architecture.flows.instagram.edges.eA-TRIAL.label", dashed: true },
      { id: "eA-ORG", source: "A", target: "A_ORG", label: "architecture.flows.instagram.edges.eA-ORG.label" },
      { id: "eORG-B", source: "A_ORG", target: "B" },
      { id: "eB-C", source: "B", target: "C" },
      { id: "eC-D", source: "C", target: "D" },
      { id: "eD-E", source: "D", target: "E", label: "architecture.flows.instagram.edges.eD-E.label" },
      { id: "eD-F", source: "D", target: "F", label: "architecture.flows.instagram.edges.eD-F.label" },
      { id: "eF-E", source: "F", target: "E", sourceHandle: "l-s", targetHandle: "r-t", label: "architecture.flows.instagram.edges.eF-E.label" },
      { id: "eF-G", source: "F", target: "G", label: "architecture.flows.instagram.edges.eF-G.label" },
    ],
  },

  facebook: {
    network: "facebook",
    title: "architecture.flows.facebook.title",
    videos: [
      {
        url: "https://www.youtube.com/watch?v=_wN0N9UtKls",
        title: "architecture.flows.facebook.videos.0.title",
        ariaLabel: "architecture.flows.facebook.videos.0.ariaLabel",
        position: { x: -360, y: 0 },
      }
    ],
    nodes: [
      {
        id: "A_TRIAL",
        position: { x: -500, y: 300 },
        data: {
          image: videoHorizontalLight, imageDark: videoHorizontalDark,
          kind: "phase", tag: "architecture.flows.facebook.nodes.A_TRIAL.data.tag", confidence: "likely",
          label: "architecture.flows.facebook.nodes.A_TRIAL.data.label",
          sublabel: "architecture.flows.facebook.nodes.A_TRIAL.data.sublabel",
          details: [
            { id: "tr1", dx: -340, dy: 0, side: "left", tag: "architecture.flows.facebook.nodes.A_TRIAL.data.details.tr1.tag", label: "architecture.flows.facebook.nodes.A_TRIAL.data.details.tr1.label", sublabel: "architecture.flows.facebook.nodes.A_TRIAL.data.details.tr1.sublabel" }
          ]
        },
      },
      {
        id: "A",
        position: { x: 0, y: 0 },
        data: {
          kind: "start", tag: "architecture.flows.facebook.nodes.A.data.tag",
          image: videoLight, imageDark: videoDark,
          label: "architecture.flows.facebook.nodes.A.data.label",
          sublabel: "architecture.flows.facebook.nodes.A.data.sublabel",
        },
      },
      {
        id: "A_ADS",
        position: { x: 500, y: 300 },
        data: {
          image: adsLight, imageDark: adsDark,
          kind: "phase", tag: "architecture.flows.facebook.nodes.A_ADS.data.tag",
          label: "architecture.flows.facebook.nodes.A_ADS.data.label",
          sublabel: "architecture.flows.facebook.nodes.A_ADS.data.sublabel",
          details: [
            { id: "ads1", dx: 340, dy: -120, side: "right", tag: "architecture.flows.facebook.nodes.A_ADS.data.details.ads1.tag", label: "architecture.flows.facebook.nodes.A_ADS.data.details.ads1.label", sublabel: "architecture.flows.facebook.nodes.A_ADS.data.details.ads1.sublabel" },
            { id: "ads2", dx: 340, dy: 40, side: "right", tag: "architecture.flows.facebook.nodes.A_ADS.data.details.ads2.tag", label: "architecture.flows.facebook.nodes.A_ADS.data.details.ads2.label", sublabel: "architecture.flows.facebook.nodes.A_ADS.data.details.ads2.sublabel" },
            { id: "ads3", dx: 340, dy: 200, side: "right", tag: "architecture.flows.facebook.nodes.A_ADS.data.details.ads3.tag", label: "architecture.flows.facebook.nodes.A_ADS.data.details.ads3.label", sublabel: "architecture.flows.facebook.nodes.A_ADS.data.details.ads3.sublabel" }
          ],
        },
      },
      {
        id: "A_ORG",
        position: { x: 0, y: 300 },
        data: {
          kind: "phase", tag: "architecture.flows.facebook.nodes.A_ORG.data.tag",
          label: "architecture.flows.facebook.nodes.A_ORG.data.label",
          sublabel: "architecture.flows.facebook.nodes.A_ORG.data.sublabel",
        },
      },
      {
        id: "S",
        position: { x: 1200, y: 300 },
        data: {
          kind: "strategy", tag: "architecture.flows.facebook.nodes.S.data.tag",
          label: "architecture.flows.facebook.nodes.S.data.label",
          sublabel: "architecture.flows.facebook.nodes.S.data.sublabel",
          details: [
            { id: "s1", dx: 340, dy: -20, side: "right", tag: "architecture.flows.facebook.nodes.S.data.details.s1.tag", label: "architecture.flows.facebook.nodes.S.data.details.s1.label", sublabel: "architecture.flows.facebook.nodes.S.data.details.s1.sublabel" },
            { id: "s2", dx: 340, dy: 135, side: "right", tag: "architecture.flows.facebook.nodes.S.data.details.s2.tag", label: "architecture.flows.facebook.nodes.S.data.details.s2.label", sublabel: "architecture.flows.facebook.nodes.S.data.details.s2.sublabel" },
            { id: "s3", dx: 340, dy: 290, side: "right", tag: "architecture.flows.facebook.nodes.S.data.details.s3.tag", label: "architecture.flows.facebook.nodes.S.data.details.s3.label", sublabel: "architecture.flows.facebook.nodes.S.data.details.s3.sublabel" },
          ],
        },
      },
      {
        id: "B",
        position: { x: 0, y: 600 },
        data: {
          kind: "phase", tag: "architecture.flows.facebook.nodes.B.data.tag", confidence: "confirmed",
          label: "architecture.flows.facebook.nodes.B.data.label",
          sublabel: "architecture.flows.facebook.nodes.B.data.sublabel",
        },
      },
      {
        id: "C",
        position: { x: 0, y: 900 },
        data: {
          kind: "phase", tag: "architecture.flows.facebook.nodes.C.data.tag", confidence: "confirmed",
          label: "architecture.flows.facebook.nodes.C.data.label",
          sublabel: "architecture.flows.facebook.nodes.C.data.sublabel",
          details: [
            { id: "c1", dx: -440, dy: -120, side: "left", tag: "architecture.flows.facebook.nodes.C.data.details.c1.tag", icon: iconLike, confidence: "confirmed", label: "architecture.flows.facebook.nodes.C.data.details.c1.label", sublabel: "architecture.flows.facebook.nodes.C.data.details.c1.sublabel" },
            { id: "c2", dx: -440, dy: 40, side: "left", tag: "architecture.flows.facebook.nodes.C.data.details.c2.tag", icon: iconPlay, confidence: "confirmed", label: "architecture.flows.facebook.nodes.C.data.details.c2.label", sublabel: "architecture.flows.facebook.nodes.C.data.details.c2.sublabel" },
          ],
        },
      },
      {
        id: "D",
        position: { x: 0, y: 1200 },
        data: {
          kind: "phase", tag: "architecture.flows.facebook.nodes.D.data.tag", confidence: "confirmed",
          label: "architecture.flows.facebook.nodes.D.data.label",
          sublabel: "architecture.flows.facebook.nodes.D.data.sublabel",
        },
      },
      {
        id: "E",
        position: { x: 0, y: 1500 },
        data: {
          kind: "phase", tag: "architecture.flows.facebook.nodes.E.data.tag", confidence: "confirmed",
          label: "architecture.flows.facebook.nodes.E.data.label",
          sublabel: "architecture.flows.facebook.nodes.E.data.sublabel",
        },
      },
      {
        id: "F",
        position: { x: 0, y: 1800 },
        data: {
          kind: "success", tag: "architecture.flows.facebook.nodes.F.data.tag", confidence: "confirmed",
          image: feedLight, imageDark: feedDark,
          label: "architecture.flows.facebook.nodes.F.data.label",
          sublabel: "architecture.flows.facebook.nodes.F.data.sublabel",
        },
      },
    ],
    edges: [
      { id: "evid-0", source: "video-facebook-0", target: "A", sourceHandle: "r-s", targetHandle: "l-t", dashed: true, animated: true },
      { id: "eA-S", source: "A", target: "S", dashed: true },
      { id: "eA-ADS", source: "A", target: "A_ADS", label: "architecture.flows.facebook.edges.eA-ADS.label", dashed: true },
      { id: "eA-TRIAL", source: "A", target: "A_TRIAL", label: "architecture.flows.facebook.edges.eA-TRIAL.label", dashed: true },
      { id: "eA-ORG", source: "A", target: "A_ORG", label: "architecture.flows.facebook.edges.eA-ORG.label" },
      { id: "eORG-B", source: "A_ORG", target: "B" },
      { id: "eB-C", source: "B", target: "C" },
      { id: "eC-D", source: "C", target: "D" },
      { id: "eD-E", source: "D", target: "E" },
      { id: "eE-F", source: "E", target: "F" },
    ],
  },

  youtube: {
    network: "youtube",
    title: "architecture.flows.youtube.title",
    videos: [
      {
        url: "https://www.youtube.com/watch?v=3d-cRq7gl90",
        title: "architecture.flows.youtube.videos.0.title",
        ariaLabel: "architecture.flows.youtube.videos.0.ariaLabel",
        position: { x: -360, y: 0 },
      },
      {
        url: "https://www.youtube.com/watch?v=1vmpEzdFDfg",
        title: "architecture.flows.youtube.videos.1.title",
        ariaLabel: "architecture.flows.youtube.videos.1.ariaLabel",
        position: { x: -360, y: 600 },
      },
      {
        url: "https://www.youtube.com/watch?v=gNPCoWXJQfc",
        title: "architecture.flows.youtube.videos.2.title",
        ariaLabel: "architecture.flows.youtube.videos.2.ariaLabel",
        position: { x: 900, y: 1200 },
      },
    ],
    nodes: [
      {
        id: "A",
        position: { x: 0, y: 0 },
        data: {
          kind: "start", tag: "architecture.flows.youtube.nodes.A.data.tag",
          image: videoHorizontalLight, imageDark: videoHorizontalDark,
          label: "architecture.flows.youtube.nodes.A.data.label",
          sublabel: "architecture.flows.youtube.nodes.A.data.sublabel",
        },
      },
      {
        id: "A_ADS",
        position: { x: 500, y: 300 },
        data: {
          image: adsLight, imageDark: adsDark,
          kind: "phase", tag: "architecture.flows.youtube.nodes.A_ADS.data.tag",
          label: "architecture.flows.youtube.nodes.A_ADS.data.label",
          sublabel: "architecture.flows.youtube.nodes.A_ADS.data.sublabel",
          details: [
            { id: "ads1", dx: 340, dy: -60, side: "right", tag: "architecture.flows.youtube.nodes.A_ADS.data.details.ads1.tag", label: "architecture.flows.youtube.nodes.A_ADS.data.details.ads1.label", sublabel: "architecture.flows.youtube.nodes.A_ADS.data.details.ads1.sublabel" },
            { id: "ads2", dx: 340, dy: 80, side: "right", tag: "architecture.flows.youtube.nodes.A_ADS.data.details.ads2.tag", label: "architecture.flows.youtube.nodes.A_ADS.data.details.ads2.label", sublabel: "architecture.flows.youtube.nodes.A_ADS.data.details.ads2.sublabel" },
            { id: "ads3", dx: 340, dy: 220, side: "right", tag: "architecture.flows.youtube.nodes.A_ADS.data.details.ads3.tag", label: "architecture.flows.youtube.nodes.A_ADS.data.details.ads3.label", sublabel: "architecture.flows.youtube.nodes.A_ADS.data.details.ads3.sublabel" }
          ],
        },
      },
      {
        id: "A_ORG",
        position: { x: 0, y: 300 },
        data: {
          kind: "phase", tag: "architecture.flows.youtube.nodes.A_ORG.data.tag",
          label: "architecture.flows.youtube.nodes.A_ORG.data.label",
          sublabel: "architecture.flows.youtube.nodes.A_ORG.data.sublabel",
        },
      },
      {
        id: "S",
        position: { x: 1200, y: 300 },
        data: {
          kind: "strategy", tag: "architecture.flows.youtube.nodes.S.data.tag",
          label: "architecture.flows.youtube.nodes.S.data.label",
          sublabel: "architecture.flows.youtube.nodes.S.data.sublabel",
          details: [
            { id: "s1", dx: 340, dy: -20, side: "right", tag: "architecture.flows.youtube.nodes.S.data.details.s1.tag", label: "architecture.flows.youtube.nodes.S.data.details.s1.label", sublabel: "architecture.flows.youtube.nodes.S.data.details.s1.sublabel" },
            { id: "s2", dx: 340, dy: 135, side: "right", tag: "architecture.flows.youtube.nodes.S.data.details.s2.tag", label: "architecture.flows.youtube.nodes.S.data.details.s2.label", sublabel: "architecture.flows.youtube.nodes.S.data.details.s2.sublabel" },
            { id: "s3", dx: 340, dy: 290, side: "right", tag: "architecture.flows.youtube.nodes.S.data.details.s3.tag", label: "architecture.flows.youtube.nodes.S.data.details.s3.label", sublabel: "architecture.flows.youtube.nodes.S.data.details.s3.sublabel" },
          ],
        },
      },
      {
        id: "B",
        position: { x: 0, y: 600 },
        data: {
          kind: "phase", tag: "architecture.flows.youtube.nodes.B.data.tag", confidence: "likely",
          image: vistasLight, imageDark: vistasDark,
          label: "architecture.flows.youtube.nodes.B.data.label",
          sublabel: "architecture.flows.youtube.nodes.B.data.sublabel",
          details: [
            { id: "b1_yt", dx: -440, dy: -40, side: "left", tag: "architecture.flows.youtube.nodes.B.data.details.b1_yt.tag", label: "architecture.flows.youtube.nodes.B.data.details.b1_yt.label", sublabel: "architecture.flows.youtube.nodes.B.data.details.b1_yt.sublabel" }
          ],
        },
      },
      {
        id: "C",
        position: { x: 0, y: 900 },
        data: {
          kind: "decision", tag: "architecture.flows.youtube.nodes.C.data.tag", confidence: "confirmed",
          label: "architecture.flows.youtube.nodes.C.data.label",
          details: [
            { id: "c1", dx: -440, dy: -120, side: "left", tag: "architecture.flows.youtube.nodes.C.data.details.c1.tag", icon: iconPlay, confidence: "confirmed", label: "architecture.flows.youtube.nodes.C.data.details.c1.label", sublabel: "architecture.flows.youtube.nodes.C.data.details.c1.sublabel" },
            { id: "c2", dx: -440, dy: 40, side: "left", tag: "architecture.flows.youtube.nodes.C.data.details.c2.tag", label: "architecture.flows.youtube.nodes.C.data.details.c2.label", sublabel: "architecture.flows.youtube.nodes.C.data.details.c2.sublabel" },
          ],
        },
      },
      {
        id: "D",
        position: { x: -500, y: 1200 },
        data: {
          kind: "fail", tag: "architecture.flows.youtube.nodes.D.data.tag", confidence: "likely",
          image: resNegLight, imageDark: resNegDark,
          label: "architecture.flows.youtube.nodes.D.data.label",
          sublabel: "architecture.flows.youtube.nodes.D.data.sublabel",
        },
      },
      {
        id: "E",
        position: { x: 500, y: 1200 },
        data: {
          kind: "phase", tag: "architecture.flows.youtube.nodes.E.data.tag", confidence: "likely",
          label: "architecture.flows.youtube.nodes.E.data.label",
          sublabel: "architecture.flows.youtube.nodes.E.data.sublabel",
          details: [
            { id: "e1_yt", dx: 340, dy: -40, side: "right", tag: "architecture.flows.youtube.nodes.E.data.details.e1_yt.tag", label: "architecture.flows.youtube.nodes.E.data.details.e1_yt.label", sublabel: "architecture.flows.youtube.nodes.E.data.details.e1_yt.sublabel" }
          ],
        },
      },
      {
        id: "F",
        position: { x: 500, y: 1500 },
        data: {
          kind: "decision", tag: "architecture.flows.youtube.nodes.F.data.tag", confidence: "confirmed",
          label: "architecture.flows.youtube.nodes.F.data.label",
          details: [
            { id: "f1", dx: 340, dy: -120, side: "right", tag: "architecture.flows.youtube.nodes.F.data.details.f1.tag", icon: iconLike, confidence: "confirmed", label: "architecture.flows.youtube.nodes.F.data.details.f1.label", sublabel: "architecture.flows.youtube.nodes.F.data.details.f1.sublabel" },
            { id: "f2", dx: 340, dy: 40, side: "right", tag: "architecture.flows.youtube.nodes.F.data.details.f2.tag", confidence: "likely", label: "architecture.flows.youtube.nodes.F.data.details.f2.label", sublabel: "architecture.flows.youtube.nodes.F.data.details.f2.sublabel" },
          ],
        },
      },
      {
        id: "G",
        position: { x: 500, y: 1800 },
        data: {
          kind: "success", tag: "architecture.flows.youtube.nodes.G.data.tag", confidence: "likely",
          image: resPosLight, imageDark: resPosDark,
          label: "architecture.flows.youtube.nodes.G.data.label",
          sublabel: "architecture.flows.youtube.nodes.G.data.sublabel",
        },
      },
    ],
    edges: [
      { id: "evid-0", source: "video-youtube-0", target: "A", sourceHandle: "r-s", targetHandle: "l-t", dashed: true, animated: true },
      { id: "evid-1", source: "video-youtube-1", target: "B", sourceHandle: "r-s", targetHandle: "l-t", dashed: true, animated: true },
      { id: "evid-2", source: "video-youtube-2", target: "E", sourceHandle: "l-s", targetHandle: "r-t", dashed: true, animated: true },
      { id: "eA-S", source: "A", target: "S", dashed: true },
      { id: "eA-ADS", source: "A", target: "A_ADS", label: "architecture.flows.youtube.edges.eA-ADS.label", dashed: true },
      { id: "eA-TRIAL", source: "A", target: "A_TRIAL", label: "architecture.flows.youtube.edges.eA-TRIAL.label", dashed: true },
      { id: "eA-ORG", source: "A", target: "A_ORG", label: "architecture.flows.youtube.edges.eA-ORG.label" },
      { id: "eORG-B", source: "A_ORG", target: "B" },
      { id: "eB-C", source: "B", target: "C" },
      { id: "eC-D", source: "C", target: "D", label: "architecture.flows.youtube.edges.eC-D.label" },
      { id: "eC-E", source: "C", target: "E", label: "architecture.flows.youtube.edges.eC-E.label" },
      { id: "eE-F", source: "E", target: "F" },
      { id: "eF-D", source: "F", target: "D", sourceHandle: "l-s", targetHandle: "r-t", label: "architecture.flows.youtube.edges.eF-D.label" },
      { id: "eF-G", source: "F", target: "G", label: "architecture.flows.youtube.edges.eF-G.label" },
    ],
  },
};
