import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-lg space-y-6">

      {/* Greeting + APS badge */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-16 w-20 rounded-xl shrink-0" />
      </div>

      {/* Stat cards 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i}>
            <Skeleton className="h-8 w-10 mb-1.5" />
            <Skeleton className="h-3 w-28" />
          </SkeletonCard>
        ))}
      </div>

      {/* Section label */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-36" />

        {/* Application cards */}
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
