import { cn } from "@/lib/utils";

type Variant = "text" | "circular" | "rectangular" | "rounded";
type Animation = "wave" | "pulse" | false;

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  animation?: Animation;
}

/** Skeleton estilo MUI: variantes text/circular/rectangular/rounded y animación wave/pulse. */
function Skeleton({ className, variant = "rounded", animation = "wave", ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden bg-muted",
        variant === "text" && "h-[0.9em] rounded-md scale-y-[0.75] origin-left",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-none",
        variant === "rounded" && "rounded-md",
        animation === "pulse" && "animate-pulse",
        animation === "wave" && "skeleton-wave",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
