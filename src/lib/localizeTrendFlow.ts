import type { TFunction } from "i18next";
import type { TrendFlow } from "@/data/trendFlows";

/** Translate display values without changing graph identity, geometry or media. */
export function localizeTrendFlow(flow: TrendFlow, t: TFunction): TrendFlow {
  const optional = (key: string | undefined) => key === undefined ? undefined : t(key);
  return {
    ...flow,
    title: t(flow.title),
    videos: flow.videos?.map(video => ({ ...video, title: t(video.title), ariaLabel: optional(video.ariaLabel) })),
    nodes: flow.nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        label: t(node.data.label),
        sublabel: optional(node.data.sublabel),
        tag: optional(node.data.tag),
        details: node.data.details?.map(detail => ({
          ...detail, label: t(detail.label), sublabel: optional(detail.sublabel), tag: optional(detail.tag),
        })),
      },
    })),
    edges: flow.edges.map(edge => ({ ...edge, label: optional(edge.label) })),
  };
}