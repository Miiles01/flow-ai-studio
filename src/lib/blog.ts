import posts from "@/data/blog-posts.json";

// Miiles Blog: los artículos viven en src/data/blog-posts.json (español e inglés en el mismo registro).
// "published": false los deja fuera del blog, del sitemap y de buscadores; se ven con ?preview=1.
export type BlogLang = "es" | "en";
export type BlogBlock =
  | { type: "p" | "h2"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "img"; src: string; alt: string }
  | { type: "cta"; title: string; text?: string; button: string; href: string };
export type BlogLocale = { slug: string; title: string; metaTitle?: string; description: string; author: string; body: BlogBlock[] };
export type BlogPost = { id: string; date: string; published: boolean; cover?: string } & Record<BlogLang, BlogLocale>;

export const SITE_URL = "https://miiles.app";
export const BLOG_POSTS = posts as BlogPost[];

export const publishedPosts = () =>
  BLOG_POSTS.filter((p) => p.published).sort((a, b) => b.date.localeCompare(a.date));

/** Busca por slug en el idioma pedido o en el otro (para redirigir al idioma correcto). */
export function findPost(slug: string): { post: BlogPost; lang: BlogLang } | null {
  for (const post of BLOG_POSTS) {
    if (post.es.slug === slug) return { post, lang: "es" };
    if (post.en.slug === slug) return { post, lang: "en" };
  }
  return null;
}

export const postPath = (post: BlogPost, lang: BlogLang) => `/${lang}/blog/${post[lang].slug}`;

export function formatDate(date: string, lang: BlogLang) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(lang === "en" ? "en-US" : "es-MX", { day: "numeric", month: "long", year: "numeric" });
}

/** Tiempo de lectura aproximado (200 palabras por minuto). */
export function readingMinutes(body: BlogBlock[]) {
  const words = body
    .map((b) => (b.type === "cta" ? "" : "text" in b ? b.text : "items" in b ? b.items.join(" ") : ""))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
