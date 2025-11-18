"use client";

import Link from "next/link";

import { useSectionWatch } from "../layout/SectionWatchProvider";

export default function ScrollIndicator() {
  const { markInteracted } = useSectionWatch();

  return (
    <div className="flex justify-center">
      <Link
        href="#about"
        className="group mt-4 flex flex-col items-center gap-3 text-xs font-semibold uppercase tracking-[0.4em] text-slate-400 transition hover:text-emerald-500"
        aria-label="소개 섹션으로 이동"
        onClick={markInteracted}
      >
        <span>Scroll</span>
        <div className="flex flex-col items-center gap-2">
          {[0, 1, 2].map((idx) => (
            <span
              key={idx}
              className="h-3 w-3 animate-bounce rounded-full bg-slate-300 transition group-hover:bg-emerald-400 group-hover:shadow-[0_0_8px_rgba(16,185,129,0.6)]"
              style={{ animationDelay: `${idx * 120}ms` }}
            />
          ))}
        </div>
      </Link>
    </div>
  );
}
