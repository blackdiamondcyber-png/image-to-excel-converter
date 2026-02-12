"use client";

export function SkeletonCard() {
  return (
    <div className="bg-snap-surface border border-snap-border rounded-xl p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="h-4 bg-snap-card rounded w-3/4 mb-2" />
          <div className="h-3 bg-snap-card rounded w-1/3" />
        </div>
        <div className="h-5 bg-snap-card rounded-full w-16" />
      </div>
      <div className="flex gap-4 mb-3">
        <div className="h-8 bg-snap-card rounded w-12" />
        <div className="h-8 bg-snap-card rounded w-12" />
        <div className="h-8 bg-snap-card rounded w-12" />
      </div>
      <div className="h-8 bg-snap-card rounded w-full mt-2" />
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
