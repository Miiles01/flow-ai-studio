import { useTranslation } from "react-i18next";
import dashboardI18n from "@/i18n";
const dt = (key: string, options?: Record<string, unknown>): string => dashboardI18n.t(key, options) as string;
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { type StudioTemplate } from "@/lib/studio";

// Tarjeta de la Librería: contenedor con el degradado de Descubrimientos, la pantalla de la plantilla dentro
// y, fuera del contenedor, el nombre con un botón Ver que aparece al pasar el cursor (siempre visible en táctil).
// Si la plantilla tiene video de vista previa, al pasar el cursor la miniatura se reproduce (el video vive en wearemiiles.com
// y solo se descarga la primera vez que alguien pasa el cursor).
export default function StudioLibraryCard({ t }: { t: StudioTemplate }) {
  useTranslation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const open = () => navigate(`/studio/${t.slug}`);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const hovered = useRef(false);
  const hasVideo = !!t.preview_video_url;

  const start = () => {
    hovered.current = true;
    if (!hasVideo || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setArmed(true);
    const v = videoRef.current;
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
  };
  const stop = () => {
    hovered.current = false;
    const v = videoRef.current;
    setPlaying(false);
    if (v) { v.pause(); v.currentTime = 0; }
  };

  return (
    <div className="group" onMouseEnter={start} onMouseLeave={stop}>
      <button
        type="button"
        onClick={open}
        aria-label={dt("dashboard.dynamic268", { value1: t.title })}
        className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
        style={{
          background: isDark
            ? "linear-gradient(180deg, #121212 0%, #0A0A0A 100%)"
            : "linear-gradient(180deg, #FDFDFD 0%, #F8F9FD 100%)",
        }}
      >
        <div
          className={`relative w-[76%] overflow-hidden rounded-[8px] transition-transform duration-500 ease-out group-hover:scale-[1.03] ${isDark ? "" : "shadow-[0_8px_24px_-10px_rgba(28,30,42,0.10)]"}`}
        >
          {t.thumbnail_url && (
            <img src={t.thumbnail_url} alt={t.title} className="block aspect-[4/3] h-auto w-full object-cover" loading="lazy" />
          )}
          {hasVideo && armed && (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              poster={t.thumbnail_url ?? undefined}
              onPlaying={(e) => { if (hovered.current) setPlaying(true); else e.currentTarget.pause(); }}
              aria-hidden="true"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-0"}`}
            >
              {t.preview_video_webm_url && <source src={t.preview_video_webm_url} type="video/webm" />}
              <source src={t.preview_video_url ?? undefined} type="video/mp4" />
            </video>
          )}
        </div>
      </button>

      <div className="mt-3 flex min-h-10 items-center justify-between gap-3">
        <p className="truncate text-base font-normal text-foreground">{t.title}</p>
        <button
          type="button"
          onClick={open}
          tabIndex={-1}
          className={`shrink-0 rounded-full bg-black px-5 py-2 text-sm font-normal text-white transition-all duration-300 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100 ${isDark ? "border border-white/10 hover:bg-zinc-900" : "hover:bg-miiles-pink"}`}
        >
          {dt("dashboard.studioView")}
        </button>
      </div>
    </div>
  );
}
