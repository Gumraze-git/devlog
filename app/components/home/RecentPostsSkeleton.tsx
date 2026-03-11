import { Skeleton } from "../ui/Skeleton";

export function RecentPostsSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)]/35">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4 border-b border-[var(--border-muted)] px-5 py-7 md:px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
