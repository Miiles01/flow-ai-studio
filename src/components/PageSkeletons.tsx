import { Skeleton } from "@/components/ui/skeleton";

const wrap = "p-8 md:px-12 md:pb-12 md:pt-48 max-w-5xl mx-auto space-y-8";

export function DashboardSkeleton() {
  return (
    <div className={wrap} aria-busy="true">
      <div className="space-y-3">
        <Skeleton variant="text" className="h-9 w-64" />
        <Skeleton variant="text" className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton variant="text" className="h-6 w-40" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-72 shrink-0 rounded-[24px]" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton variant="text" className="h-6 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BoardsSkeleton() {
  return (
    <div className={wrap} aria-busy="true">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-9 w-48" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] rounded-[24px]" />
        ))}
      </div>
    </div>
  );
}

export function StudioGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton variant="text" className="h-5 w-40" />
          <Skeleton className="aspect-[4/3] rounded-[24px]" />
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="p-8 md:px-12 md:pb-12 md:pt-48 max-w-2xl mx-auto space-y-8" aria-busy="true">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="h-20 w-20" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-7 w-48" />
          <Skeleton variant="text" className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-32 rounded-xl" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="text" className="h-4 w-24" />
            <Skeleton className="h-10" />
          </div>
        ))}
      </div>
    </div>
  );
}
