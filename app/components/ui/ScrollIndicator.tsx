"use client";

import Link from "next/link";

export default function ScrollIndicator() {
  return (
    <div className="flex justify-center">
      <Link
        href="#about"
        className="group mt-4 flex flex-col items-center gap-3 text-xs font-semibold uppercase tracking-[0.4em] text-[var(--text-soft)] transition hover:text-[var(--accent-strong)]"
        aria-label="소개 섹션으로 이동"
      >
        <span>Scroll</span>
        <div className="flex flex-col items-center gap-2">
          {[0, 1, 2].map((idx) => (
            <span
              key={idx}
              className="h-3 w-3 animate-bounce rounded-full bg-[var(--border-muted)] transition group-hover:bg-[var(--accent)] group-hover:shadow-[0_0_8px_rgba(16,185,129,0.6)]"
              style={{ animationDelay: `${idx * 120}ms` }}
            />
          ))}
        </div>
      </Link>
    </div>
  );
}
