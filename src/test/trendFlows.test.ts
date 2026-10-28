import { describe, expect, it } from "vitest";
import i18next from "i18next";
import es from "@/locales/es/architecture.json";
import en from "@/locales/en/architecture.json";
import { TREND_FLOWS } from "@/data/trendFlows";
import { localizeTrendFlow } from "@/lib/localizeTrendFlow";

describe("localized algorithmic architecture", () => {
  for (const language of ["es", "en"]) {
    it(`resolves every graph resource in ${language} without fallback`, async () => {
      const i18n = i18next.createInstance();
      await i18n.init({ lng: language, fallbackLng: false, resources: { es: { translation: { architecture: es } }, en: { translation: { architecture: en } } } });
      for (const flow of Object.values(TREND_FLOWS)) {
        const displayKeys = [flow.title, ...flow.nodes.flatMap(node => [node.data.label, node.data.sublabel, node.data.tag, ...(node.data.details ?? []).flatMap(detail => [detail.label, detail.sublabel, detail.tag])]), ...flow.edges.map(edge => edge.label), ...(flow.videos ?? []).flatMap(video => [video.title, video.ariaLabel])];
        for (const key of displayKeys) if (key) expect(i18n.exists(key), key).toBe(true);
        const localized = localizeTrendFlow(flow, i18n.t.bind(i18n));
        expect(localized.network).toBe(flow.network);
        expect(localized.nodes.map(node => node.id)).toEqual(flow.nodes.map(node => node.id));
        expect(localized.nodes.map(node => node.position)).toEqual(flow.nodes.map(node => node.position));
        expect(localized.edges.map(edge => [edge.id, edge.source, edge.target])).toEqual(flow.edges.map(edge => [edge.id, edge.source, edge.target]));
        expect(localized.videos?.map(video => video.url)).toEqual(flow.videos?.map(video => video.url));
        expect(localized.nodes.flatMap(node => node.data.details?.map(detail => [detail.id, detail.dx, detail.dy]) ?? [])).toEqual(flow.nodes.flatMap(node => node.data.details?.map(detail => [detail.id, detail.dx, detail.dy]) ?? []));
      }
    });
  }
});