'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-border/60 ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 flex items-center gap-3.5">
      <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-3">
      <Skeleton className="w-9 h-9 rounded-[10px] shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-20 shrink-0" />
    </div>
  );
}
