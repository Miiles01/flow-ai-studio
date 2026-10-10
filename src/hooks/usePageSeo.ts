import { useEffect } from "react";

type PageSeo = {
  title: string;
  description: string;
  robots?: string;
};

const META_TARGETS: Array<[attr: "name" | "property", key: string, field: keyof PageSeo]> = [
  ["name", "description", "description"],
  ["name", "robots", "robots"],
  ["property", "og:title", "title"],
  ["property", "og:description", "description"],
  ["name", "twitter:title", "title"],
  ["name", "twitter:description", "description"],
];

/** Título, descripción y robots de la página; restaura los de index.html al salir. */
export function usePageSeo(seo: PageSeo) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = seo.title;

    const restores: Array<() => void> = [];
    for (const [attr, key, field] of META_TARGETS) {
      const value = seo[field];
      if (!value) continue;
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (el) {
        const prev = el.getAttribute("content");
        el.setAttribute("content", value);
        const node = el;
        restores.push(() => (prev === null ? node.removeAttribute("content") : node.setAttribute("content", prev)));
      } else {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        el.setAttribute("content", value);
        document.head.appendChild(el);
        const node = el;
        restores.push(() => node.remove());
      }
    }

    return () => {
      document.title = prevTitle;
      restores.forEach((restore) => restore());
    };
  }, [seo.title, seo.description, seo.robots]);
}
