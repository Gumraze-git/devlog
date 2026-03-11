import type { ReactNode } from "react";

type ProjectMetaGroupProps = {
  label: string;
  dotClassName: string;
  children: ReactNode;
  className?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function ProjectMetaGroup({
  label,
  dotClassName,
  children,
  className,
}: ProjectMetaGroupProps) {
  return (
    <div className={cx("flex items-center gap-3", className)}>
      <h3 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.15em] text-[var(--text-soft)]">
        <span className={cx("h-1.5 w-1.5 rounded-full opacity-70", dotClassName)}></span>
        {label}
      </h3>
      {children}
    </div>
  );
}
