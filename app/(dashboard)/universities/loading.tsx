import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function UniversitiesLoading() {
  return (
    <div className="mx-auto max-w-lg space-y-4">

      {/* Heading */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full shrink-0" />
        ))}
      </div>

      {/* Search bar */}
      <Skeleton className="h-11 w-full rounded-xl" />

      {/* University cards */}
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} className="space-y-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-6 rounded-md shrink-0" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}
