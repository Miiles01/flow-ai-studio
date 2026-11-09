// Genera public/sitemap.xml con las páginas públicas (es/en) y los artículos publicados de Miiles Blog.
// Corre solo antes de cada build (npm run build → prebuild). Para regenerarlo a mano: node scripts/build-sitemap.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://miiles.app";
const PAGES = ["", "funciones", "precios", "acerca-de", "afiliados", "blog", "terminos", "privacidad"];
const posts = JSON.parse(fs.readFileSync(path.join(root, "src/data/blog-posts.json"), "utf8")).filter((p) => p.published);

const entry = (paths, lastmod) => {
  const alt = Object.entries(paths)
    .map(([lang, p]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${SITE}${p}"/>`)
    .join("\n");
  return Object.values(paths)
    .map((p) => `  <url>\n    <loc>${SITE}${p}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}${alt}\n  </url>`)
    .join("\n");
};

const urls = [
  ...PAGES.map((p) => entry({ es: `/es/${p}`, en: `/en/${p}` })),
  ...posts.map((p) => entry({ es: `/es/blog/${p.es.slug}`, en: `/en/blog/${p.en.slug}` }, p.date)),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(root, "public/sitemap.xml"), xml);
console.log(`sitemap.xml: ${PAGES.length * 2 + posts.length * 2} URLs`);
