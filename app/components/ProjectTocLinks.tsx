"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { HeadingItem } from "../lib/markdown";

type ProjectTocLinksProps = {
  items: HeadingItem[];
  className?: string;
};

export default function ProjectTocLinks({ items, className = "space-y-1.5" }: ProjectTocLinksProps) {
  const clickLockRef = useRef<{ slug: string; expiresAt: number } | null>(null);
  const [activeSlug, setActiveSlug] = useState<string>(() => items[0]?.slug ?? "");

  useEffect(() => {
    if (items.length === 0) return;

    let rafId = 0;
    let ticking = false;
    const offsetTop = 140;
    const clickLockDurationMs = 800;
    const setActive = (slug: string) => {
      setActiveSlug((prev) => (prev === slug ? prev : slug));
    };
    const readHashSlug = () => {
      try {
        return decodeURIComponent(window.location.hash.replace(/^#/, ""));
      } catch {
        return "";
      }
    };

    const updateActiveSlug = () => {
      const targets = items
        .map((item) => ({ slug: item.slug, element: document.getElementById(item.slug) }))
        .filter((entry): entry is { slug: string; element: HTMLElement } => Boolean(entry.element));

      if (targets.length === 0) return;

      const lock = clickLockRef.current;
      if (lock && lock.expiresAt > window.performance.now()) {
        setActive(lock.slug);
        const lockedTarget = targets.find((target) => target.slug === lock.slug);
        if (lockedTarget && lockedTarget.element.getBoundingClientRect().top - offsetTop <= 4) {
          clickLockRef.current = null;
        }
        return;
      }
      clickLockRef.current = null;

      let current = targets[0].slug;

      for (const target of targets) {
        if (target.element.getBoundingClientRect().top - offsetTop <= 0) {
          current = target.slug;
        } else {
          break;
        }
      }

      setActive(current);
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      rafId = window.requestAnimationFrame(() => {
        updateActiveSlug();
        ticking = false;
      });
    };

    const initialHash = readHashSlug();
    if (initialHash && items.some((item) => item.slug === initialHash)) {
      clickLockRef.current = {
        slug: initialHash,
        expiresAt: window.performance.now() + clickLockDurationMs,
      };
      setActive(initialHash);
    } else {
      setActive(items[0]?.slug ?? "");
    }

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    const handleHashChange = () => {
      const hash = readHashSlug();
      if (hash) {
        clickLockRef.current = {
          slug: hash,
          expiresAt: window.performance.now() + clickLockDurationMs,
        };
      }
      requestUpdate();
    };
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [items]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, slug: string) => {
    clickLockRef.current = {
      slug,
      expiresAt: window.performance.now() + 800,
    };
    setActiveSlug(slug);

    const details = event.currentTarget.closest("details");
    if (details instanceof HTMLDetailsElement) {
      details.open = false;
    }
  };

  return (
    <div className={className}>
      {items.map((item, index) => {
        const isActive = activeSlug === item.slug;
        const indentClass = item.depth === 2 ? "ml-3" : item.depth === 3 ? "ml-6" : "";

        return (
          <a
            key={`${item.slug}-${index}`}
            href={`#${item.slug}`}
            aria-current={isActive ? "location" : undefined}
            onClick={(event) => handleClick(event, item.slug)}
            className={`group relative flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
              isActive
                ? "border-[var(--accent)]/40 bg-[color-mix(in_srgb,var(--accent)_10%,var(--card))] font-semibold text-[var(--foreground)]"
                : "border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--card-subtle)]/70 hover:text-[var(--foreground)]"
            }`}
          >
            <span
              aria-hidden
              className={`mt-1 h-4 w-1 shrink-0 rounded-full transition-colors ${
                isActive ? "bg-[var(--accent)]" : "bg-transparent group-hover:bg-[var(--border)]"
              }`}
            />
            <span className={`block leading-relaxed ${indentClass}`}>{item.text}</span>
          </a>
        );
      })}
    </div>
  );
}
