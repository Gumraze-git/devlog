import { Skeleton } from "../ui/Skeleton";

export function FeaturedProjectsSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)]/35">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4 border-b border-[var(--border-muted)] px-5 py-7 md:px-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
