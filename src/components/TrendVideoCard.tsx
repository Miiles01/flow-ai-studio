import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TrendVideoCardData = {
  title: string;
  thumbnailUrl?: string;
  ariaLabel?: string;
  onPlay: (trigger: HTMLButtonElement) => void;
};

const TrendVideoCard = ({ data }: NodeProps) => {
  const video = data as TrendVideoCardData;

  return (
    <div className="relative group">
      <Handle type="source" position={Position.Right} id="r-s" className="opacity-0 w-1 h-1" />
      <Handle type="target" position={Position.Right} id="r-t" className="opacity-0 w-1 h-1" />
      <Handle type="source" position={Position.Left} id="l-s" className="opacity-0 w-1 h-1" />
      <Handle type="target" position={Position.Left} id="l-t" className="opacity-0 w-1 h-1" />
      
      <Button
        type="button"
        variant="ghost"
        onClick={(event) => {
          event.stopPropagation();
          video.onPlay(event.currentTarget);
        }}
        onPointerDown={(event) => event.stopPropagation()}
        aria-label={video.ariaLabel ?? `Reproducir ${video.title}`}
        className="nodrag nopan h-auto w-[280px] flex-col items-stretch gap-0 overflow-hidden rounded-2xl border border-border bg-card p-0 text-left text-card-foreground shadow-md hover:translate-y-0 hover:bg-card"
      >
        <span className="relative block aspect-video w-full overflow-hidden bg-muted">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt=""
              draggable={false}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : null}
          <span className="absolute inset-0 flex items-center justify-center bg-foreground/10">
            <span className="flex size-12 items-center justify-center rounded-full bg-background text-foreground shadow-lg transition-transform duration-200 group-hover:scale-105">
              <Play size={19} className="ml-0.5" fill="currentColor" />
            </span>
          </span>
        </span>
        <span className="flex w-full items-center gap-2 px-4 py-3">
          <span className="rounded-full bg-miiles-blue-light px-2 py-0.5 text-[9px] font-normal uppercase text-miiles-blue dark:bg-miiles-blue/20 dark:text-miiles-blue-light">
            Video
          </span>
          <span className="min-w-0 truncate text-xs font-normal text-foreground">{video.title}</span>
        </span>
      </Button>
    </div>
  );
};

export default memo(TrendVideoCard);