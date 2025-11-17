"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useSectionWatch } from "./SectionWatchProvider";

type NavItem = {
  id: string;
  label: string;
};

type ProgressNavProps = {
  items: NavItem[];
};

export default function ProgressNav({ items }: ProgressNavProps) {
  const { activeId, activate } = useSectionWatch();

  const activeIndex = useMemo(() => items.findIndex((item) => item.id === activeId), [items, activeId]);
  const progress = activeIndex >= 0 && items.length ? ((activeIndex + 1) / items.length) * 100 : 0;

  return (
    <nav className="sticky top-4 z-50 mx-auto w-full max-w-4xl">
      <div className="relative rounded-full border border-slate-200 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
        <div className="absolute left-6 right-6 top-4 h-1 rounded-full bg-slate-200/80">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase text-slate-500">
          {items.map(({ id, label }) => {
            const isActive = id === activeId;
            return (
              <Link
                key={id}
                href={`#${id}`}
                onClick={() => activate(id)}
                className={`flex flex-col items-center gap-1 text-[11px] tracking-wide transition ${
                  isActive ? "text-emerald-600" : "text-slate-500"
                }`}
              >
                <span className="text-[10px] font-bold opacity-70">{label.slice(0, 3).toUpperCase()}</span>
                <span className="text-sm">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
