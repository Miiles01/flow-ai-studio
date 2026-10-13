import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";

const formatTime = (t: number) => {
  if (!isFinite(t) || isNaN(t)) return "0:00";
  const m = Math.floor(t / 60);
  const sec = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

const AdVideo = ({ src, poster }: { src: string; poster?: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Limpiar temporizador de ocultar
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // Programar ocultamiento de controles
  const scheduleHide = useCallback(() => {
    clearHideTimer();
    if (playing && !isScrubbing) {
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [playing, isScrubbing, clearHideTimer]);

  // Mostrar controles e iniciar cuenta regresiva
  const revealControls = useCallback(() => {
    setShowControls(true);
    scheduleHide();
  }, [scheduleHide]);

  // Manejar cambio de estado de pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      clearHideTimer();
    };
  }, [clearHideTimer]);

  // Cuando cambia el estado de reproducción
  useEffect(() => {
    if (playing) {
      scheduleHide();
    } else {
      clearHideTimer();
      setShowControls(true);
    }
  }, [playing, scheduleHide, clearHideTimer]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
  };

  // Manejar clic en el contenedor del video
  const handleContainerClick = () => {
    if (!playing) {
      togglePlay();
      return;
    }

    // Si está reproduciendo y los controles están ocultos, los mostramos primero
    if (!showControls) {
      revealControls();
    } else {
      // Si ya están visibles, pausamos
      togglePlay();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.muted && v.volume === 0) {
      v.volume = 1;
      setVolume(1);
    }
    v.muted = !v.muted;
    revealControls();
  };

  const changeVolume = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
    revealControls();
  };

  const seek = (val: number) => {
    const v = videoRef.current;
    if (v) {
      v.currentTime = val;
      setTime(val);
    }
    revealControls();
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = boxRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.();
    }
    revealControls();
  };

  const progressPercent = duration > 0 ? (time / duration) * 100 : 0;

  const controlBtn =
    "w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all shrink-0 cursor-pointer";

  return (
    <div
      ref={boxRef}
      className="relative group bg-black select-none overflow-hidden"
      onMouseMove={revealControls}
      onMouseEnter={revealControls}
      onMouseLeave={() => {
        if (playing && !isScrubbing) {
          clearHideTimer();
          setShowControls(false);
        }
      }}
      onClick={handleContainerClick}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-auto block cursor-pointer"
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => {
          setMuted(e.currentTarget.muted);
          setVolume(e.currentTarget.volume);
        }}
      />

      {/* Botón Central Grande: Blanco y minimalista */}
      {!playing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          aria-label="Reproducir video"
          className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-black flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.45)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer z-20"
        >
          <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-black text-black ml-1" />
        </button>
      )}

      {/* Barra de progreso ambiente delgada (solo cuando reproduce y controles ocultos) */}
      <div
        className={`absolute inset-x-0 bottom-0 h-1 bg-white/20 transition-opacity duration-300 pointer-events-none z-10 ${
          playing && !showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="h-full bg-white transition-[width] duration-150 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Controles Completos con Gradiente Glassmórfico */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute inset-x-0 bottom-0 px-3.5 pb-3 pt-12 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-300 z-20 ${
          showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Barra de Progreso Interactivo */}
        <div className="relative w-full h-4 flex items-center mb-1 group/slider">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            onMouseDown={() => setIsScrubbing(true)}
            onTouchStart={() => setIsScrubbing(true)}
            onMouseUp={() => {
              setIsScrubbing(false);
              scheduleHide();
            }}
            onTouchEnd={() => {
              setIsScrubbing(false);
              scheduleHide();
            }}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Progreso del video"
            className="w-full h-1.5 appearance-none rounded-full bg-white/30 cursor-pointer accent-white transition-all group-hover/slider:h-2"
            style={{
              background: `linear-gradient(to right, #ffffff ${progressPercent}%, rgba(255,255,255,0.3) ${progressPercent}%)`,
            }}
          />
        </div>

        {/* Fila de Controles */}
        <div className="flex items-center gap-1.5 text-white">
          {/* Play / Pause */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
              revealControls();
            }}
            aria-label={playing ? "Pausar" : "Reproducir"}
            className={controlBtn}
          >
            {playing ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Mute / Volumen */}
          <div className="flex items-center group/vol">
            <button
              onClick={toggleMute}
              aria-label={muted || volume === 0 ? "Activar sonido" : "Silenciar"}
              className={controlBtn}
            >
              {muted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <div className="w-0 group-hover/vol:w-16 sm:group-hover/vol:w-20 overflow-hidden transition-all duration-200 flex items-center pr-1">
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                aria-label="Volumen"
                className="h-1 w-16 sm:w-20 appearance-none rounded-full bg-white/30 cursor-pointer accent-white"
              />
            </div>
          </div>

          {/* Tiempo */}
          <span className="ml-1 text-[11px] font-mono font-light tabular-nums text-white/80">
            {formatTime(time)} / {formatTime(duration)}
          </span>

          {/* Pantalla Completa */}
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            className={`${controlBtn} ml-auto`}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdVideo;
