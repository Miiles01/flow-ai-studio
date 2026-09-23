import { useEffect, useRef } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  embedUrl: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onClose: () => void;
};

export default function TrendVideoPlayer({ title, embedUrl, expanded, onExpandedChange, onClose }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <>
      {expanded ? (
        <button
          type="button"
          aria-label="Cerrar vista ampliada"
          className="absolute inset-0 z-40 bg-foreground/45"
          onClick={() => onExpandedChange(false)}
          onPointerDown={(event) => event.stopPropagation()}
        />
      ) : null}

      <motion.section
        role="dialog"
        aria-modal="false"
        aria-label={title}
        initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.2 }}
        onPointerDown={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
        className={`absolute z-50 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl transition-[inset,width,height,transform] duration-300 ${
          expanded
            ? "inset-4 flex flex-col sm:inset-8 md:inset-12"
            : "bottom-24 left-4 right-4 sm:left-auto sm:right-8 sm:w-[min(460px,calc(100%-4rem))]"
        }`}
      >
        <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border px-3">
          <p className="min-w-0 truncate text-sm font-normal text-foreground">{title}</p>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onExpandedChange(!expanded)}
              aria-label={expanded ? "Reducir video" : "Ampliar video"}
              title={expanded ? "Reducir video" : "Ampliar video"}
              className="size-9 rounded-full hover:translate-y-0"
            >
              {expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </Button>
            <Button
              ref={closeButtonRef}
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Cerrar video"
              title="Cerrar video"
              className="size-9 rounded-full hover:translate-y-0"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        <div className={`relative bg-foreground ${expanded ? "min-h-0 flex-1" : "aspect-video"}`}>
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      </motion.section>
    </>
  );
}