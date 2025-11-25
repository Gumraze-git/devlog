"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useSectionWatch } from "./SectionWatchProvider";

type NavItem = {
  id: string;
  label: string;
  abbr: string;
};

type ProgressNavProps = {
  items: NavItem[];
};

export default function ProgressNav({ items }: ProgressNavProps) {
  const { activeId, activate } = useSectionWatch();

  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const compute = () => {
      if (!trackRef.current || items.length < 2) {
        return 0;
      }

      const centers = itemRefs.current
        .map((el) => el?.getBoundingClientRect())
        .filter(Boolean)
        .map((rect) => (rect as DOMRect).left + (rect as DOMRect).width / 2);

      if (centers.length < 2) {
        return 0;
      }

      const first = centers[0];
      const last = centers[centers.length - 1];
      const range = last - first;
      if (range <= 0) {
        return 0;
      }

      const activeIdx = items.findIndex((item) => item.id === activeId);
      const targetRect = activeIdx >= 0 ? itemRefs.current[activeIdx]?.getBoundingClientRect() : null;

      if (targetRect) {
        const center = targetRect.left + targetRect.width / 2;
        const ratio = ((center - first) / range) * 100;
        return Math.max(0, Math.min(ratio, 100));
      }

      return 0;
    };

    setProgress(compute());
  }, [activeId, items]);


  return (
    <nav className="sticky top-2 md:top-4 z-50 mx-auto w-full max-w-5xl px-8 md:px-48">
      <div className="relative rounded-full border border-[var(--border)] bg-[var(--card-muted)] px-2.5 md:px-3 py-1.5 md:py-3 shadow-sm backdrop-blur">
        <div
          className="hidden md:block absolute left-10 right-10 top-4 h-1 rounded-full bg-[var(--border-muted)]"
          aria-hidden="true"
          ref={trackRef}
        >
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 md:mt-6 flex flex-wrap md:flex-nowrap items-center justify-center gap-2 sm:gap-3 md:gap-5 lg:gap-8 xl:gap-10 px-1 md:px-0 text-[11px] font-semibold uppercase text-[var(--text-soft)]">
          {items.map(({ id, label, abbr }, idx) => {
            const isActive = id === activeId;
            return (
              <Link
                key={id}
                href={`#${id}`}
                onClick={() => activate(id)}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                className={`flex flex-col items-center py-1 md:py-0 text-[10px] md:text-[11px] tracking-wide transition ${
                  isActive
                    ? "text-[var(--accent-strong)] scale-[1.05]"
                    : "text-[var(--text-soft)] opacity-80"
                }`}
              >
                {/*NavItem의 abbr*/}
                <span className="text-[10px] font-bold opacity-70 md:text-[10px] md:opacity-70">
                  {abbr}
                </span>

                {/*NavItem의 label (모바일에서는 숨김)*/}
                <span className="hidden md:block text-xs md:text-sm">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
