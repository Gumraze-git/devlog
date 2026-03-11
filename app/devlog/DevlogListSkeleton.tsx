import { Skeleton } from "../components/ui/Skeleton";

export function DevlogListSkeleton() {
  return (
    <div className="space-y-12">
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-full" />
        ))}
      </div>

      <div className="space-y-10 group">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-3 border-b border-[var(--border-muted)] pb-10">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
