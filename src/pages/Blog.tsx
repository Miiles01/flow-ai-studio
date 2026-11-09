import React from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import { usePageSeo } from "@/hooks/usePageSeo";
import { useHeadTags } from "@/hooks/useHeadTags";
import {
  SITE_URL, findPost, formatDate, postPath, publishedPosts, readingMinutes,
  type BlogBlock, type BlogLang, type BlogPost,
} from "@/lib/blog";

const COPY = {
  es: {
    title: "Miiles Blog",
    intro: "Novedades de Miiles, guías para creadores y lo que aprendemos construyendo herramientas de IA.",
    seoTitle: "Miiles Blog: IA para creadores de contenido",
    seoDesc: "Novedades de Miiles, guías para creadores de contenido y freelancers, y cómo usar la IA para tu portafolio, tus clientes y tus campañas.",
    empty: "Muy pronto publicamos el primer artículo.",
    read: "min de lectura",
    back: "Blog",
    draft: "Borrador: aún no está publicado",
  },
  en: {
    title: "Miiles Blog",
    intro: "Miiles news, guides for creators and what we learn building AI tools.",
    seoTitle: "Miiles Blog: AI for content creators",
    seoDesc: "Miiles news, guides for content creators and freelancers, and how to use AI for your portfolio, clients and campaigns.",
    empty: "Our first article is coming soon.",
    read: "min read",
    back: "Blog",
    draft: "Draft: not published yet",
  },
};

const useLang = (): BlogLang => (useParams().lang === "en" ? "en" : "es");

/** Texto con **negritas** y [enlaces](url). */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**")) return <strong key={i} className="font-normal text-black">{part.slice(2, -2)}</strong>;
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          const external = /^https?:/.test(link[2]);
          return (
            <a key={i} href={link[2]} className="text-black underline underline-offset-4 decoration-miiles-gray-200 hover:decoration-black"
              {...(external && !link[2].startsWith(SITE_URL) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {link[1]}
            </a>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

function Block({ b }: { b: BlogBlock }) {
  if (b.type === "cta") {
    // Llamado a la acción grande al final del artículo
    return (
      <aside className="!mt-16 rounded-[24px] border border-miiles-gray-100 bg-white px-8 py-12 md:px-14 md:py-16 text-center text-black">
        <p className="text-3xl md:text-5xl font-normal leading-tight">
          {b.title.split("\n").map((l, i) => <span key={i} className="block">{l}</span>)}
        </p>
        {b.text && <p className="mx-auto mt-5 max-w-md text-sm md:text-base font-light text-miiles-gray-400">{b.text}</p>}
        <a href={b.href} className="mt-8 inline-flex rounded-full bg-black px-8 py-4 text-base font-normal text-white transition-colors hover:bg-miiles-pink">
          {b.button}
        </a>
      </aside>
    );
  }
  if (b.type === "h2") return <h2 className="pt-6 text-2xl md:text-3xl font-normal leading-tight text-black">{b.text}</h2>;
  if (b.type === "p") return <p className="text-base md:text-lg font-light leading-relaxed text-miiles-gray-600"><Inline text={b.text} /></p>;
  if (b.type === "ul" || b.type === "ol") {
    const Tag = b.type;
    return (
      <Tag className={`space-y-3 pl-5 text-base md:text-lg font-light leading-relaxed text-miiles-gray-600 ${b.type === "ul" ? "list-disc" : "list-decimal"}`}>
        {b.items.map((item, i) => <li key={i}><Inline text={item} /></li>)}
      </Tag>
    );
  }
  // Las capturas sin archivo todavía no se muestran
  if (b.type !== "img" || !b.src) return null;
  return (
    <figure className="py-2">
      <img src={b.src} alt={b.alt} loading="lazy" className="w-full rounded-[24px] bg-miiles-gray-50" />
    </figure>
  );
}

function PostCard({ post, lang }: { post: BlogPost; lang: BlogLang }) {
  const p = post[lang];
  return (
    <Link to={postPath(post, lang)} className="group block rounded-[24px] p-6 md:p-8 transition-colors hover:bg-miiles-gray-50">
      <p className="text-xs font-light text-miiles-gray-400">
        <time dateTime={post.date}>{formatDate(post.date, lang)}</time> · {readingMinutes(p.body)} {COPY[lang].read}
      </p>
      <h2 className="mt-3 text-2xl md:text-3xl font-normal leading-tight text-black">{p.title}</h2>
      <p className="mt-3 max-w-2xl text-sm md:text-base font-light leading-relaxed text-miiles-gray-600">{p.description}</p>
    </Link>
  );
}

export function BlogIndex() {
  const lang = useLang();
  const c = COPY[lang];
  const posts = publishedPosts();
  usePageSeo({ title: c.seoTitle, description: c.seoDesc });
  useHeadTags({
    canonical: `${SITE_URL}/${lang}/blog`,
    alternates: [
      { hreflang: "es", href: `${SITE_URL}/es/blog` },
      { hreflang: "en", href: `${SITE_URL}/en/blog` },
      { hreflang: "x-default", href: `${SITE_URL}/es/blog` },
    ],
    meta: [{ attr: "property", key: "og:type", content: "website" }, { attr: "property", key: "og:url", content: `${SITE_URL}/${lang}/blog` }],
  }, [lang]);

  return (
    <div className="min-h-screen bg-white text-black" lang={lang}>
      <LandingNavbar />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-40 md:pt-48">
        <h1 className="text-4xl md:text-6xl font-normal leading-tight text-black">{c.title}</h1>
        <p className="mt-4 max-w-xl text-base md:text-lg font-light text-miiles-gray-400">{c.intro}</p>
        <div className="mt-14 -mx-6 md:-mx-8 space-y-2">
          {posts.length === 0
            ? <p className="px-6 md:px-8 text-sm font-light text-miiles-gray-400">{c.empty}</p>
            : posts.map((post) => <PostCard key={post.id} post={post} lang={lang} />)}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

export function BlogArticle() {
  const lang = useLang();
  const { slug = "" } = useParams();
  const [search] = useSearchParams();
  const found = findPost(slug);
  const preview = search.get("preview") === "1";
  const post = found?.post;
  const p = post?.[lang];
  const c = COPY[lang];
  const visible = !!post && (post.published || preview);

  usePageSeo({
    title: p ? p.metaTitle ?? p.title : c.seoTitle,
    description: p?.description ?? c.seoDesc,
    robots: post && !post.published ? "noindex, nofollow" : undefined,
  });
  const url = post ? `${SITE_URL}${postPath(post, lang)}` : "";
  const cover = post?.cover ? `${SITE_URL}${post.cover}` : undefined;
  useHeadTags(post && p ? {
    canonical: url,
    alternates: [
      { hreflang: "es", href: `${SITE_URL}${postPath(post, "es")}` },
      { hreflang: "en", href: `${SITE_URL}${postPath(post, "en")}` },
      { hreflang: "x-default", href: `${SITE_URL}${postPath(post, "es")}` },
    ],
    meta: [
      { attr: "property", key: "og:type", content: "article" },
      { attr: "property", key: "og:url", content: url },
      { attr: "property", key: "article:published_time", content: post.date },
      { attr: "property", key: "article:author", content: p.author },
      ...(cover ? [{ attr: "property" as const, key: "og:image", content: cover }, { attr: "name" as const, key: "twitter:image", content: cover }] : []),
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: lang === "en" ? "en-US" : "es-MX",
      mainEntityOfPage: url,
      image: cover,
      author: { "@type": "Organization", name: p.author },
      publisher: { "@type": "Organization", name: "Miiles", logo: { "@type": "ImageObject", url: `${SITE_URL}/app-icon-512.png` } },
    },
  } : {}, [slug, lang]);

  if (!found || !visible) return <Navigate to={`/${lang}/blog`} replace />;
  // Slug del otro idioma: llevar a la versión correcta
  if (found.lang !== lang) return <Navigate to={`${postPath(found.post, lang)}${preview ? "?preview=1" : ""}`} replace />;

  return (
    <div className="min-h-screen bg-white text-black" lang={lang}>
      <LandingNavbar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-40 md:pt-48">
        <Link to={`/${lang}/blog`} className="text-sm font-light text-miiles-gray-400 transition-colors hover:text-black">← {c.back}</Link>
        {!post!.published && (
          <p className="mt-6 inline-flex rounded-full bg-miiles-pink-light px-3 py-1 text-xs font-normal text-black">{c.draft}</p>
        )}
        <article className="mt-8">
          <header>
            <p className="text-xs font-light text-miiles-gray-400">
              <time dateTime={post!.date}>{formatDate(post!.date, lang)}</time> · {p!.author} · {readingMinutes(p!.body)} {c.read}
            </p>
            <h1 className="mt-4 text-4xl md:text-5xl font-normal leading-tight text-black">{p!.title}</h1>
          </header>
          <div className="mt-10 space-y-6">
            {p!.body.map((b, i) => <Block key={i} b={b} />)}
          </div>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}

