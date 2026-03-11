import Image from "next/image";

import { getTechIconMeta } from "../../data/skills";

type TechStackListProps = {
  items: string[];
  variant: "compact" | "detailed";
  maxItems?: number;
  className?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function TechStackList({
  items,
  variant,
  maxItems,
  className,
}: TechStackListProps) {
  const visibleItems = typeof maxItems === "number" ? items.slice(0, maxItems) : items;

  if (visibleItems.length === 0) return null;

  return (
    <div
      className={cx(
        variant === "compact"
          ? "flex flex-wrap gap-2"
          : "flex flex-wrap items-center gap-x-3 gap-y-2.5",
        className,
      )}
    >
      {visibleItems.map((item) => {
        const meta = getTechIconMeta(item);

        if (variant === "compact") {
          if (meta?.icon) {
            return (
              <div key={item} className="relative h-6 w-6" title={meta.label}>
                <Image
                  src={meta.icon}
                  alt={meta.label}
                  fill
                  sizes="24px"
                  className="object-contain"
                />
              </div>
            );
          }

          return (
            <span
              key={item}
              className="rounded border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-xs font-medium text-[var(--text-muted)]"
            >
              {item}
            </span>
          );
        }

        if (meta?.icon) {
          return (
            <div key={item} className="flex flex-col items-center gap-1.5">
              <div className="relative h-10 w-10 p-1 md:h-11 md:w-11" title={meta.label}>
                <Image
                  src={meta.icon}
                  alt={meta.label}
                  fill
                  className="object-contain p-1 opacity-90 transition-opacity"
                />
              </div>
              <span className="text-center text-[10px] font-semibold tracking-tight text-[var(--text-muted)] sm:text-[11px]">
                {meta.label}
              </span>
            </div>
          );
        }

        return (
          <div key={item} className="flex items-center">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card-subtle)]/40 px-3 py-1.5 shadow-sm">
              <span className="whitespace-nowrap text-[11px] font-bold tracking-wide text-[var(--text-muted)] sm:text-xs">
                {item}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
