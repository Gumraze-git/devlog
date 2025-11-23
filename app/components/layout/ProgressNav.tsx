"use client";

import Link from "next/link";

import { useSectionWatch } from "./SectionWatchProvider";

type NavItem = {
  id: string;
  label: string;
  abbr: string;
};

const PROGRESS_MAP: Record<string, number> = {
  home: 5,
  about: 23,
  devlog: 43,
  projects: 59,
  education: 77,
  contact: 100,
};

type ProgressNavProps = {
  items: NavItem[];
};

export default function ProgressNav({ items }: ProgressNavProps) {
  const { activeId, activate } = useSectionWatch();

  const progress = PROGRESS_MAP[activeId] ?? 0;


  return (
    <nav className="sticky top-4 z-50 mx-auto w-full max-w-4xl">
      <div className="relative rounded-full border border-[var(--border)] bg-[var(--card-muted)] px-4 py-3 shadow-sm backdrop-blur">
        <div className="absolute left-12 right-12 top-4 h-1 rounded-full bg-[var(--border-muted)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-20 text-xs font-semibold uppercase text-[var(--text-soft)]">
          {items.map(({ id, label, abbr }) => {
            const isActive = id === activeId;
            return (
              <Link
                key={id}
                href={`#${id}`}
                onClick={() => activate(id)}
                className={`flex flex-col items-center text-[11px] tracking-wide transition ${
                  isActive ? "text-[var(--accent-strong)]" : "text-[var(--text-soft)]"
                }`}
              >
                {/*NavItem의 abbr*/}
                <span className="text-[10px] font-bold opacity-70">
                  {abbr}
                </span>

                {/*NavItem의 label*/}
                <span className="text-sm">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
