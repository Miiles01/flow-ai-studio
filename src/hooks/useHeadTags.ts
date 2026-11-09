import { useEffect } from "react";

type HeadTags = {
  canonical?: string;
  alternates?: { hreflang: string; href: string }[];
  meta?: { attr: "name" | "property"; key: string; content: string }[];
  jsonLd?: object;
};

/** Agrega canonical, hreflang, metas extra y JSON-LD a <head>; los quita al salir de la página. */
export function useHeadTags(tags: HeadTags, deps: unknown[]) {
  useEffect(() => {
    const added: Element[] = [];
    const restores: Array<() => void> = [];
    const link = (rel: string, href: string, extra?: Record<string, string>) => {
      const el = document.createElement("link");
      el.setAttribute("rel", rel);
      el.setAttribute("href", href);
      Object.entries(extra ?? {}).forEach(([k, v]) => el.setAttribute(k, v));
      el.setAttribute("data-page-head", "");
      document.head.appendChild(el);
      added.push(el);
    };
    if (tags.canonical) {
      document.head.querySelectorAll('link[rel="canonical"]:not([data-page-head])').forEach((el) => {
        el.remove();
        restores.push(() => document.head.appendChild(el));
      });
      link("canonical", tags.canonical);
    }
    tags.alternates?.forEach((a) => link("alternate", a.href, { hreflang: a.hreflang }));
    tags.meta?.forEach(({ attr, key, content }) => {
      const existing = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (existing) {
        const prev = existing.getAttribute("content");
        existing.setAttribute("content", content);
        restores.push(() => (prev === null ? existing.removeAttribute("content") : existing.setAttribute("content", prev)));
      } else {
        const el = document.createElement("meta");
        el.setAttribute(attr, key);
        el.setAttribute("content", content);
        document.head.appendChild(el);
        added.push(el);
      }
    });
    if (tags.jsonLd) {
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.text = JSON.stringify(tags.jsonLd);
      document.head.appendChild(el);
      added.push(el);
    }
    return () => {
      added.forEach((el) => el.remove());
      restores.forEach((r) => r());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
