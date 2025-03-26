import { Skeleton } from "../../../components/skeleton/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Skeleton */}
      <Skeleton className="h-8 w-1/2" />

      {/* Paragraph Skeletons */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />

      {/* Content Block Skeletons */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}
