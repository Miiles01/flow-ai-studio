import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import i18n from "@/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import type { StudioComponent } from "@/lib/studioComponents";

// Tarjeta de Componentes: mismo contenedor con degradado que la Librería, pero con un marco de celular (Reel 9:16).
// El video se reproduce al pasar el cursor (y se queda en su primer cuadro el resto del tiempo).
export default function StudioComponentCard({ c }: { c: StudioComponent }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const en = (i18n.language || "es").startsWith("en");
  const open = () => navigate(`/studio/componentes/${c.slug}`);

  const start = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    videoRef.current?.play().catch(() => {});
  };
  const stop = () => {
    const v = videoRef.current;
    if (v) { v.pause(); v.currentTime = 0; }
  };

  return (
    <div className="group" onMouseEnter={start} onMouseLeave={stop}>
      <button
        type="button"
        onClick={open}
        aria-label={`${en ? "View" : "Ver"} ${c.title}`}
        className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ background: isDark ? "linear-gradient(180deg, #121212 0%, #0A0A0A 100%)" : "linear-gradient(180deg, #FDFDFD 0%, #F8F9FD 100%)" }}
      >
        {/* Marco de celular */}
        <div className={`relative h-[82%] aspect-[9/19.5] rounded-[26px] p-[5px] transition-transform duration-500 ease-out group-hover:scale-[1.03] ${isDark ? "bg-zinc-800" : "bg-black shadow-[0_14px_32px_-14px_rgba(28,30,42,0.35)]"}`}>
          <div className="relative h-full w-full overflow-hidden rounded-[21px] bg-black">
            <video
              ref={videoRef}
              src={c.preview_video_url}
              poster={c.poster_url ?? undefined}
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
            <span className="absolute left-1/2 top-[7px] h-[10px] w-[34%] -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
          </div>
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
