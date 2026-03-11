import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  bordered?: boolean;
  className?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function PageIntro({
  eyebrow,
  title,
  description,
  bordered = false,
  className,
}: PageIntroProps) {
  const hasEyebrow = Boolean(eyebrow);

  return (
    <header
      className={cx(
        "space-y-4",
        bordered && "border-b border-[var(--border-muted)] pb-8",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">
          {eyebrow}
        </p>
      ) : null}

      <div className={hasEyebrow ? "space-y-3" : "space-y-4"}>
        <h1
          className={
            hasEyebrow
              ? "text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
              : "text-4xl font-bold tracking-tight leading-[1.1] md:text-5xl lg:text-6xl"
          }
        >
          {title}
        </h1>

        {description ? (
          <p
            className={
              hasEyebrow
                ? "max-w-3xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg"
                : "text-lg font-medium leading-[1.6] text-[var(--foreground)] md:text-xl"
            }
          >
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
