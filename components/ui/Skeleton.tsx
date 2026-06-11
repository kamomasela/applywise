interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
    />
  );
}

// Convenience: full-width text line
export function SkeletonText({ className = '' }: SkeletonProps) {
  return <Skeleton className={`h-4 w-full ${className}`} />;
}

// Convenience: card container
export function SkeletonCard({ className = '', children }: SkeletonProps & { children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-white p-4 ${className}`}>
      {children}
    </div>
  );
}
