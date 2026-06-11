import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-lg space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Today group */}
      <section className="space-y-2">
        <Skeleton className="h-3 w-12" />
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
          </SkeletonCard>
        ))}
      </section>

      {/* Earlier group */}
      <section className="space-y-2">
        <Skeleton className="h-3 w-14" />
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
          </SkeletonCard>
        ))}
      </section>
    </div>
  );
}
