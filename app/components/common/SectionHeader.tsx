import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  action?: ReactNode;
  className?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function SectionHeader({
  eyebrow,
  title,
  action,
  className,
}: SectionHeaderProps) {
  if (eyebrow || action) {
    return (
      <div
        className={cx(
          "flex items-end justify-between gap-4 border-b border-[var(--border)] pb-4",
          className,
        )}
      >
        <div>
          {eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    );
  }

  return (
    <div className={cx("border-b border-[var(--border)] pb-4", className)}>
      <h2 className="text-3xl font-bold tracking-tight uppercase">{title}</h2>
    </div>
  );
}
