import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { pickLang } from "@/i18n";

type L = { es: string; en: string; pt: string; fr: string };

// Video de referencia: una edición completa hecha combinando escenas.
const REFERENCIA = {
  src: "/studio/ugc-pro.mp4#t=0.1",
  tag: { es: "Nuevo", en: "New", pt: "Novo", fr: "Nouveau" },
  title: { es: "Escenas", en: "Scenes", pt: "Cenas", fr: "Scènes" },
  sub: {
    es: "Partes de un Reel listas para copiar y pegar en tu asistente de IA.",
    en: "Reel parts ready to copy and paste into your AI assistant.",
    pt: "Partes de um Reel prontas para copiar e colar no seu assistente de IA.",
    fr: "Des parties de Reel prêtes à copier-coller dans votre assistant IA.",
  },
  hint: {
    es: "En el video, UGC · Pro: captions al ritmo de su voz, split, carrusel, contadores y texto detrás de ella.",
    en: "In the video, UGC · Pro: captions timed to her voice, split screen, carousel, counters and text behind her.",
    pt: "No vídeo, UGC · Pro: legendas no ritmo da voz dela, tela dividida, carrossel, contadores e texto atrás dela.",
    fr: "Dans la vidéo, UGC · Pro : sous-titres au rythme de sa voix, écran partagé, carrousel, compteurs et texte derrière elle.",
  },
};

/** Video que solo se reproduce mientras su tarjeta está a la vista (ahorra datos en el carrusel). */
function SceneVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.6 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload={poster ? "none" : "metadata"}
      className="h-full w-full object-cover"
    />
  );
}

/** Mismo fondo de puntos que Arquitectura algorítmica. */
function Dots({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: isDark
          ? "radial-gradient(circle at center, #2A2A2A 0%, rgba(140, 134, 162, 0.15) 59%, #121212 100%)"
          : "radial-gradient(circle at center, #FFFFFF 0%, rgba(140, 134, 162, 0.15) 59%, #FFFFFF 100%)",
        maskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
        maskSize: "20px 20px",
        WebkitMaskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
        WebkitMaskSize: "20px 20px",
      }}
    />
  );
}

const panelBg = (isDark: boolean) => (isDark ? "linear-gradient(180deg, #121212 0%, #0A0A0A 100%)" : "linear-gradient(180deg, #FDFDFD 0%, #F8F9FD 100%)");

/** Banner principal de la sección Escenas (título, etiqueta Nuevo, subtítulo) con el video de referencia UGC · Pro. */
export function ScenesBanner() {
  const { i18n } = useTranslation();
  const { isDark } = useTheme();
  const t = (o: L) => pickLang(o, i18n.language);
  return (
    <div className="relative w-full overflow-hidden rounded-[20px] md:rounded-[24px]" style={{ background: panelBg(isDark) }}>
      <Dots isDark={isDark} />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 p-8 md:p-12">
        <div className="flex-1 min-w-0">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-normal ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>{t(REFERENCIA.tag)}</span>
          <h2 className="mt-4 text-3xl md:text-5xl font-normal leading-[1.05] text-foreground">{t(REFERENCIA.title)}</h2>
          <p className="mt-4 max-w-md text-sm md:text-base font-light leading-relaxed text-muted-foreground">{t(REFERENCIA.sub)}</p>
          <p className="mt-3 max-w-md text-xs md:text-sm font-light leading-relaxed text-muted-foreground">{t(REFERENCIA.hint)}</p>
        </div>
        <div className={`h-[420px] md:h-[480px] aspect-[9/16] shrink-0 rounded-[24px] overflow-hidden border ${isDark ? "bg-black border-white/10" : "bg-[#F4F4F5] border-black/5"}`} style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }}>
          <SceneVideo src={REFERENCIA.src} />
        </div>
      </div>
    </div>
  );
}
