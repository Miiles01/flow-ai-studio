import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { pickLang } from "@/i18n";
import type { StudioComponent } from "@/lib/studioComponents";

type L = { es: string; en: string; pt: string; fr: string };

// Título corto y subtítulo de cada escena en los cuatro idiomas (los datos del repo solo traen español).
const COPY: Record<string, { title: L; sub: L }> = {
  "escena-split-rebote": {
    title: { es: "Pantalla dividida · Rebote", en: "Split screen · Bounce", pt: "Tela dividida · Quique", fr: "Écran partagé · Rebond" },
    sub: { es: "El panel cae con rebote y parallax mientras hablas.", en: "The panel drops in with a bounce and parallax while you talk.", pt: "O painel cai com quique e parallax enquanto você fala.", fr: "Le panneau tombe avec un rebond et un parallaxe pendant que vous parlez." },
  },
  "escena-split-suave": {
    title: { es: "Pantalla dividida · Suave", en: "Split screen · Smooth", pt: "Tela dividida · Suave", fr: "Écran partagé · Doux" },
    sub: { es: "Entra y sale lenta, sin rebote, con la cámara acompañando.", en: "Slides in and out slowly, no bounce, with the camera following.", pt: "Entra e sai devagar, sem quique, com a câmera acompanhando.", fr: "Entre et sort lentement, sans rebond, avec la caméra qui suit." },
  },
  "escena-split-tiras": {
    title: { es: "Pantalla dividida · Tiras", en: "Split screen · Strips", pt: "Tela dividida · Faixas", fr: "Écran partagé · Bandes" },
    sub: { es: "El panel de arriba cae en cuatro tiras, una tras otra.", en: "The top panel drops in as four strips, one after another.", pt: "O painel de cima cai em quatro faixas, uma após a outra.", fr: "Le panneau du haut tombe en quatre bandes, l'une après l'autre." },
  },
  "escena-split-tarjeta": {
    title: { es: "Pantalla dividida · Tarjeta", en: "Split screen · Card", pt: "Tela dividida · Cartão", fr: "Écran partagé · Carte" },
    sub: { es: "Nace como una pastilla al centro y crece hasta llenar la mitad.", en: "Starts as a pill in the center and grows to fill half the screen.", pt: "Nasce como uma pílula no centro e cresce até ocupar metade.", fr: "Naît comme une pastille au centre et grandit jusqu'à remplir la moitié." },
  },
  "escena-split-linea": {
    title: { es: "Pantalla dividida · Línea", en: "Split screen · Line", pt: "Tela dividida · Linha", fr: "Écran partagé · Ligne" },
    sub: { es: "Se dibuja una línea en el corte y el panel se despliega desde ahí.", en: "A line draws across the cut and the panel unfolds from it.", pt: "Uma linha é desenhada no corte e o painel se abre a partir dela.", fr: "Une ligne se dessine sur la coupe et le panneau se déploie depuis elle." },
  },
  "escena-grafica-curva": {
    title: { es: "Gráfica · Curva", en: "Chart · Curve", pt: "Gráfico · Curva", fr: "Graphique · Courbe" },
    sub: { es: "Corte a blanco y una curva que crece al ritmo de tu voz.", en: "Cut to white and a curve that grows in time with your voice.", pt: "Corte para o branco e uma curva que cresce no ritmo da sua voz.", fr: "Coupe vers le blanc et une courbe qui monte au rythme de votre voix." },
  },
  "escena-grafica-dona": {
    title: { es: "Gráfica · Dona", en: "Chart · Donut", pt: "Gráfico · Rosca", fr: "Graphique · Anneau" },
    sub: { es: "Corte a blanco con una dona; la cámara visita cada parte.", en: "Cut to white with a donut chart; the camera visits each slice.", pt: "Corte para o branco com uma rosca; a câmera visita cada parte.", fr: "Coupe vers le blanc avec un anneau ; la caméra visite chaque part." },
  },
  "escena-libro": {
    title: { es: "Libro · Página por página", en: "Book · Page by page", pt: "Livro · Página por página", fr: "Livre · Page par page" },
    sub: { es: "Un libro pasa sus hojas y la cámara hace zoom en cada idea.", en: "A book flips its pages and the camera zooms into each idea.", pt: "Um livro vira as páginas e a câmera dá zoom em cada ideia.", fr: "Un livre tourne ses pages et la caméra zoome sur chaque idée." },
  },
};

/** Video que solo se reproduce mientras su tarjeta está a la vista (ahorra datos en el carrusel). */
function SceneVideo({ c }: { c: StudioComponent }) {
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
      src={c.preview_video_url}
      poster={c.poster_url ?? undefined}
      muted
      loop
      playsInline
      preload="none"
      className="h-full w-full object-cover"
    />
  );
}

/** Escenas con el mismo panel que Arquitectura algorítmica: tarjetas en carrusel con texto a la izquierda y video a la derecha. */
export function ScenesBoard({ items }: { items: StudioComponent[] }) {
  const { i18n } = useTranslation();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const t = (o: L) => pickLang(o, i18n.language);

  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px] md:rounded-[24px]"
      style={{
        height: "443px",
        background: isDark ? "linear-gradient(180deg, #121212 0%, #0A0A0A 100%)" : "linear-gradient(180deg, #FDFDFD 0%, #F8F9FD 100%)",
      }}
    >
      {/* Mismo fondo de puntos que Arquitectura algorítmica */}
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

      <div className="relative z-10 h-full w-full flex items-center overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-6 px-8 md:px-12">
        {items.map((c) => {
          const copy = COPY[c.slug];
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => navigate(`/studio/componentes/${c.slug}`)}
              className={`group w-[340px] sm:w-[440px] h-[299px] shrink-0 snap-center rounded-[24px] border overflow-hidden flex text-left transition-shadow hover:shadow-md ${
                isDark ? "bg-[#1A1A1A] border-white/5" : "bg-white border-black/5"
              }`}
            >
              <div className="flex-1 min-w-0 p-6 flex flex-col">
                <h3 className="text-lg font-normal leading-snug text-foreground">{copy ? t(copy.title) : c.title}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground line-clamp-4">{copy ? t(copy.sub) : c.description}</p>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-normal text-foreground opacity-60 transition-opacity group-hover:opacity-100">
                  {t({ es: "Ver escena", en: "View scene", pt: "Ver cena", fr: "Voir la scène" })}
                  <ArrowUpRight size={14} strokeWidth={1.6} />
                </span>
              </div>
              <div className="py-4 pr-4 shrink-0">
                <div className={`h-full aspect-[9/16] rounded-[18px] overflow-hidden ${isDark ? "bg-black" : "bg-[#F4F4F5]"}`}>
                  <SceneVideo c={c} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
