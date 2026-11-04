import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import i18n from "@/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import type { StudioComponent } from "@/lib/studioComponents";

// Tarjeta de Componentes: mismo contenedor con degradado que la Librería, pero con un marco de celular (Reel 9:16).
// El video se reproduce cuando "playing" es true: la sección activa toda la fila sobre la que está el cursor
// (y se queda en su primer cuadro el resto del tiempo).
export default function StudioComponentCard({ c, playing = false }: { c: StudioComponent; playing?: boolean }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const en = (i18n.language || "es").startsWith("en");
  const open = () => navigate(`/studio/componentes/${c.slug}`);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [playing]);

  return (
    <div className="group">
      <button
        type="button"
        onClick={open}
        aria-label={`${en ? "View" : "Ver"} ${c.title}`}
        className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ background: isDark ? "linear-gradient(180deg, #121212 0%, #0A0A0A 100%)" : "linear-gradient(180deg, #FDFDFD 0%, #F8F9FD 100%)" }}
      >
        {/* Pantalla vertical (Reel 9:16) con el mismo redondeo y sombra que las pantallas de la Librería */}
        <div className={`relative h-[82%] aspect-[9/16] overflow-hidden rounded-[8px] bg-white transition-transform duration-500 ease-out group-hover:scale-[1.03] ${isDark ? "" : "shadow-[0_8px_24px_-10px_rgba(28,30,42,0.10)]"}`}>
          <video
            ref={videoRef}
            src={c.preview_video_url}
            poster={c.poster_url ?? undefined}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="block h-full w-full scale-[1.01] object-cover"
          />
        </div>
      </button>

      <div className="mt-3 flex min-h-10 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-normal text-foreground">{c.title}</p>
          <p className="truncate text-xs font-light text-muted-foreground">{c.category}</p>
        </div>
        <button
          type="button"
          onClick={open}
          tabIndex={-1}
          className={`shrink-0 rounded-full bg-black px-5 py-2 text-sm font-normal text-white transition-all duration-300 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100 ${isDark ? "border border-white/10 hover:bg-zinc-900" : "hover:bg-miiles-pink"}`}
        >
          {en ? "View" : "Ver"}
        </button>
      </div>
    </div>
  );
}
