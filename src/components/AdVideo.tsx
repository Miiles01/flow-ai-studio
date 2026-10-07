import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

const formatTime = (t: number) => {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const sec = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

const AdVideo = ({ src, poster }: { src: string; poster?: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    // Si está en silencio con volumen 0, restaura a un volumen audible
    if (v.muted && v.volume === 0) {
      v.volume = 1;
      setVolume(1);
    }
    v.muted = !v.muted;
  };

  const changeVolume = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
  };

  const seek = (val: number) => {
    const v = videoRef.current;
    if (v) v.currentTime = val;
  };

  const fullscreen = () => {
    const el = boxRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  const btn =
    "w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors shrink-0";
  const range =
    "h-1 appearance-none rounded-full bg-white/30 cursor-pointer accent-white";

  return (
    <div ref={boxRef} className="relative group bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-auto block cursor-pointer"
        loop
        playsInline
        preload="metadata"
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => {
          setMuted(e.currentTarget.muted);
          setVolume(e.currentTarget.volume);
        }}
      />

      {!playing && (
        <button
          onClick={toggle}
          aria-label="Reproducir"
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/90 text-black flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Play className="w-6 h-6 fill-current" />
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-10 bg-gradient-to-t from-black/70 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Progreso del video"
          className={`${range} w-full block mb-2`}
        />
        <div className="flex items-center gap-1 text-white">
          <button onClick={toggle} aria-label={playing ? "Pausar" : "Reproducir"} className={btn}>
            {playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
          <button onClick={toggleMute} aria-label={muted ? "Activar sonido" : "Silenciar"} className={btn}>
            {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            aria-label="Volumen"
            className={`${range} w-16 sm:w-20`}
          />
          <span className="ml-2 text-[11px] font-light tabular-nums text-white/80">
            {formatTime(time)} / {formatTime(duration)}
          </span>
          <button onClick={fullscreen} aria-label="Pantalla completa" className={`${btn} ml-auto`}>
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdVideo;
