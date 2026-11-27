import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { pickLang } from "@/i18n";
import { AvatarGroup } from "@/components/AvatarGroup";

type L = { es: string; en: string; pt: string; fr: string };

// Asistentes de IA con los que se editan las escenas (logos en public/logos/)
const ASISTENTES = [
  { nombre: "Claude", logo: "/logos/claude.svg" },
  { nombre: "Gemini", logo: "/logos/gemini.svg" },
  { nombre: "ChatGPT", logo: "/logos/chatgpt.svg" },
];

// Video de referencia: una edición completa hecha combinando escenas.
const REFERENCIA = {
  src: "/studio/ugc-pro.mp4#t=0.1",
  tag: { es: "Nuevo", en: "New", pt: "Novo", fr: "Nouveau" },
  title: { es: "Edita tus reels más rápido", en: "Edit your Reels faster", pt: "Edite seus Reels mais rápido", fr: "Montez vos Reels plus vite" },
  sub: {
    es: "Usa Claude, Gemini o ChatGPT para editar más rápido con estos componentes.",
    en: "Use Claude, Gemini or ChatGPT to edit faster with these components.",
    pt: "Use Claude, Gemini ou ChatGPT para editar mais rápido com estes componentes.",
    fr: "Utilisez Claude, Gemini ou ChatGPT pour monter plus vite avec ces composants.",
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

const BANNER_CSS = `
.scenes-banner { container-type: inline-size; }
.scenes-banner__inner { display: flex; flex-direction: column; gap: 28px; padding: 28px; }
.scenes-banner__title { font-size: clamp(2rem, 9cqw, 2.75rem); }
.scenes-banner__video { width: min(100%, 320px); aspect-ratio: 9 / 16; align-self: center; border-radius: 22px;
  transition: width .45s cubic-bezier(.22,1,.36,1), border-radius .45s cubic-bezier(.22,1,.36,1); }
@container (min-width: 620px) {
  .scenes-banner__inner { flex-direction: row; align-items: center; gap: clamp(28px, 6cqw, 56px); padding: clamp(32px, 6cqw, 48px); }
  .scenes-banner__text { flex: 1; }
  .scenes-banner__title { font-size: clamp(2.5rem, 6.5cqw, 3.5rem); }
  .scenes-banner__video { width: clamp(220px, 32cqw, 290px); align-self: auto; border-radius: 24px; }
}
`;

/** Banner principal de la sección Escenas (título, etiqueta Nuevo, subtítulo) con el video de referencia UGC · Pro. */
export function ScenesBanner() {
  const { i18n } = useTranslation();
  const { isDark } = useTheme();
  const t = (o: L) => pickLang(o, i18n.language);
  return (
    // Se acomoda según el ancho real del banner (container query), no el de la ventana:
    // con el sidebar abierto o en pantallas medianas el video baja y el texto usa todo el ancho.
    <div className="scenes-banner relative w-full overflow-hidden rounded-[20px] md:rounded-[24px]" style={{ background: panelBg(isDark) }}>
      <style>{BANNER_CSS}</style>
      <Dots isDark={isDark} />
      <div className="scenes-banner__inner relative z-10">
        <div className="scenes-banner__text min-w-0">
          {/* etiqueta Nuevo y, junto, los logos de IA: arriba del título */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-normal ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>{t(REFERENCIA.tag)}</span>
            {/* logos de IA con la transición «Avatar group hover» de transitions.dev */}
            <AvatarGroup
              className="flex items-center"
              items={ASISTENTES.map((a, i) => (
                <span
                  key={a.nombre}
                  title={a.nombre}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border bg-white ${isDark ? "border-white/10" : "border-[#E5E7EB]"} ${i > 0 ? "-ml-2" : ""}`}
                >
                  <img src={a.logo} alt={a.nombre} className="h-4 w-4" />
                </span>
              ))}
            />
          </div>
          <h2 className="scenes-banner__title mt-4 font-normal leading-[1.05] text-foreground">{t(REFERENCIA.title)}</h2>
          <p className="mt-4 max-w-md text-sm md:text-base font-light leading-relaxed text-muted-foreground">{t(REFERENCIA.sub)}</p>
        </div>
        <div
          className={`scenes-banner__video shrink-0 overflow-hidden border ${isDark ? "bg-black border-white/10" : "bg-[#F4F4F5] border-black/5"}`}
          style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }}
        >
          <SceneVideo src={REFERENCIA.src} />
        </div>
      </div>
    </div>
  );
}
