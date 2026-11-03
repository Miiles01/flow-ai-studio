import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import i18n from "@/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePageSeo } from "@/hooks/usePageSeo";
import { STUDIO_COMPONENTS, buildComponentPrompt, fetchComponentCode } from "@/lib/studioComponents";
import antigravityLogo from "@/assets/ai-logos/antigravity.png.asset.json";
import codexLogo from "@/assets/ai-logos/codex.png.asset.json";
import cursorLogo from "@/assets/ai-logos/cursor.png.asset.json";

const AI_TOOLS: { name: string; logo: string; rounded?: boolean }[] = [
  { name: "Claude", logo: "/logos/claude.svg" },
  { name: "Codex", logo: codexLogo.url },
  { name: "Gemini", logo: "/logos/gemini.svg" },
  { name: "Cursor", logo: cursorLogo.url, rounded: true },
  { name: "Antigravity", logo: antigravityLogo.url },
];

const COPY = {
  es: {
    back: "Estudio", notFound: "No encontramos este componente", toStudio: "Volver al Estudio", kind: "Componente de video",
    copyPrompt: "Copiar prompt", copied: "Prompt copiado", download: "Descargar código", loading: "Cargando…",
    copyError: "No se pudo copiar. Intenta descargar el código.",
    promptNote: "El prompt incluye el código completo y una instrucción breve para que tu IA lo implemente.",
    compatible: "Compatible con tu asistente", compatibleText: "Pega el prompt en cualquier IA que escriba código.",
    howTo: "Cómo usarla", steps: ["Copia el prompt.", "Pégalo en tu asistente de IA (Claude, Codex, Gemini…).", "Pídele los cambios: textos, colores, duración.", "Renderiza tu video y súbelo como Reel o TikTok."],
    customize: "Cómo personalizarla", faq: "Preguntas frecuentes",
    baseFaq: [
      { q: "¿Necesito saber programar?", a: "No. Copias el prompt, lo pegas en tu IA y le pides los cambios con tus palabras; ella escribe el código." },
      { q: "¿En qué formato sale el video?", a: "Está pensada en vertical 9:16 para Reels, TikTok y Shorts, pero puedes pedirle a tu IA otro tamaño." },
      { q: "¿Puedo usarla en contenido para marcas?", a: "Sí. Es para que la uses en tu contenido, propio o de tus clientes." },
    ],
  },
  en: {
    back: "Studio", notFound: "We couldn't find this component", toStudio: "Back to Studio", kind: "Video component",
    copyPrompt: "Copy prompt", copied: "Prompt copied", download: "Download code", loading: "Loading…",
    copyError: "Couldn't copy. Try downloading the code.",
    promptNote: "The prompt includes the full code and a short instruction so your AI can implement it.",
    compatible: "Works with your assistant", compatibleText: "Paste the prompt into any AI that writes code.",
    howTo: "How to use it", steps: ["Copy the prompt.", "Paste it into your AI assistant (Claude, Codex, Gemini…).", "Ask for changes: texts, colors, duration.", "Render your video and post it as a Reel or TikTok."],
    customize: "How to customize it", faq: "FAQ",
    baseFaq: [
      { q: "Do I need to know how to code?", a: "No. Copy the prompt, paste it into your AI and ask for changes in your own words; it writes the code." },
      { q: "What format is the video?", a: "It is made for vertical 9:16 (Reels, TikTok and Shorts), but you can ask your AI for another size." },
      { q: "Can I use it in brand content?", a: "Yes. It is meant for your content, your own or your clients'." },
    ],
  },
} as const;

export default function StudioComponentPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const c = STUDIO_COMPONENTS.find((x) => x.slug === slug) ?? null;
  const t = COPY[(i18n.language || "es").startsWith("en") ? "en" : "es"];
  const [busy, setBusy] = useState<"" | "copy" | "download">("");
  const [copied, setCopied] = useState(false);

  usePageSeo({ title: c ? `${c.title} — Miiles Estudio` : "Miiles Estudio", description: c?.description || "" });

  async function copyPrompt() {
    if (!c || busy) return;
    setBusy("copy");
    try {
      const code = await fetchComponentCode(c);
      await navigator.clipboard.writeText(buildComponentPrompt(c, code));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { toast.error(t.copyError); }
    finally { setBusy(""); }
  }

  async function download() {
    if (!c || busy) return;
    setBusy("download");
    try {
      const code = await fetchComponentCode(c);
      const url = URL.createObjectURL(new Blob([code], { type: "text/plain;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url; a.download = c.code_filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { toast.error(t.copyError); }
    finally { setBusy(""); }
  }

  if (!c) {
    return (
      <div className={`${isDark ? "dark" : ""} flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground`}>
        <p className="text-sm font-light">{t.notFound}</p>
        <Button onClick={() => navigate("/studio")}>{t.toStudio}</Button>
      </div>
    );
  }

  const faq = [...(c.faq ?? []), ...t.baseFaq];

  return (
    <div className={`${isDark ? "dark" : ""} min-h-screen bg-background text-foreground`}>
      <main className="mx-auto max-w-6xl px-5 pb-12 pt-6 md:px-8 md:pt-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => navigate("/studio")} className="-ml-3 text-muted-foreground hover:text-foreground"><ArrowLeft /> {t.back}</Button>
          <Button variant="outline" onClick={download} disabled={!!busy} className="shrink-0 rounded-full hover:translate-y-0"><Download /> {busy === "download" ? t.loading : t.download}</Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-6">
            {/* Vista previa en marco de celular */}
            <div
              className="flex items-center justify-center rounded-[24px] px-6 py-10"
              style={{ background: isDark ? "linear-gradient(180deg, #121212 0%, #0A0A0A 100%)" : "linear-gradient(180deg, #FDFDFD 0%, #F8F9FD 100%)" }}
            >
              <div className={`relative aspect-[9/16] h-[min(72vh,680px)] overflow-hidden rounded-[10px] bg-black ${isDark ? "" : "shadow-[0_8px_24px_-10px_rgba(28,30,42,0.10)]"}`}>
                <video src={c.preview_video_url} poster={c.poster_url ?? undefined} autoPlay muted loop playsInline className="h-full w-full object-cover" aria-label={c.title} />
              </div>
            </div>

            <section className="rounded-[24px] border border-border bg-card p-6">
              <h2 className="mb-2 text-lg font-normal text-foreground">{t.faq}</h2>
              <Accordion type="single" collapsible defaultValue="q0">
                {faq.map((f, i) => (
                  <AccordionItem key={i} value={`q${i}`} className="border-border">
                    <AccordionTrigger className="text-left text-sm font-normal text-foreground hover:no-underline">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-sm font-light leading-6 text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>

          <aside className="h-fit space-y-6 rounded-[24px] border border-border bg-card p-6 lg:sticky lg:top-6">
            <span className="inline-block rounded-full border border-border px-3 py-1 text-xs font-light text-muted-foreground">{c.category || t.kind}</span>
            <div>
              <h1 className="break-words text-2xl font-normal text-foreground md:text-3xl">{c.title}</h1>
              <p className="mt-3 whitespace-pre-line text-sm font-light leading-6 text-muted-foreground">{c.description}</p>
            </div>
            <div className="space-y-2">
              <Button size="lg" onClick={copyPrompt} disabled={!!busy} className="h-12 w-full rounded-full hover:translate-y-0">
                {copied ? <Check /> : <Copy />} {busy === "copy" ? t.loading : copied ? t.copied : t.copyPrompt}
              </Button>
              <p className="text-xs font-light leading-5 text-muted-foreground">{t.promptNote}</p>
            </div>
            <div className="border-t border-border pt-5">
              <p className="text-sm font-normal text-foreground">{t.compatible}</p>
              <p className="mt-1 text-xs font-light text-muted-foreground">{t.compatibleText}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {AI_TOOLS.map((a) => (
                  <span key={a.name} className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-light text-foreground">
                    <img src={a.logo} alt="" className={`h-4 w-4 shrink-0 object-contain ${a.rounded ? "rounded-full" : ""}`} /> {a.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t border-border pt-5">
              <p className="mb-3 text-sm font-normal text-foreground">{t.howTo}</p>
              <ol className="space-y-2 text-sm font-light leading-6 text-muted-foreground">
                {t.steps.map((s, i) => (
                  <li key={i} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-foreground">{i + 1}</span>{s}</li>
                ))}
              </ol>
            </div>
            {c.customize.length > 0 && (
              <div className="border-t border-border pt-5">
                <p className="mb-3 text-sm font-normal text-foreground">{t.customize}</p>
                <ul className="space-y-2 text-sm font-light leading-6 text-muted-foreground">
                  {c.customize.map((s, i) => <li key={i} className="flex gap-3"><span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />{s}</li>)}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
