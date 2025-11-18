"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useSectionWatch } from "./SectionWatchProvider";

type NavItem = {
  id: string;
  label: string;
  abbr: string;
};

const PROGRESS_MAP: Record<string, number> = {
  home: 2,
  about: 17,
  devlog: 32,
  skill: 47,
  projects: 62,
  education: 80,
  contact: 100,
};

type ProgressNavProps = {
  items: NavItem[];
};

export default function ProgressNav({ items }: ProgressNavProps) {
  const { activeId, activate } = useSectionWatch();

  const activeIndex = useMemo(() => items.findIndex((item) => item.id === activeId), [items, activeId]);
  const progress = PROGRESS_MAP[activeId] ?? 0;


  return (
    <nav className="sticky top-4 z-50 mx-auto w-full max-w-4xl">
      <div className="relative rounded-full border border-slate-200 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
        <div className="absolute left-12 right-12 top-4 h-1 rounded-full bg-slate-200/80">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-20 text-xs font-semibold uppercase text-slate-500">
          {items.map(({ id, label, abbr }) => {
            const isActive = id === activeId;
            return (
              <Link
                key={id}
                href={`#${id}`}
                onClick={() => activate(id)}
                className={`flex flex-col items-center text-[11px] tracking-wide transition ${
                  isActive ? "text-emerald-600" : "text-slate-500"
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
