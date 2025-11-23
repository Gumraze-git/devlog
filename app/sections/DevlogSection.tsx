"use client";

import { useMemo, useState } from "react";

import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";
import { devlogPosts } from "../data/devlog";

const filters = [
  { id: "latest", label: "최신순" },
  { id: "popular", label: "조회순" },
];

export default function DevlogSection() {
  const [activeFilter, setActiveFilter] = useState<string>("latest");

  const sortedPosts = useMemo(() => {
    if (activeFilter === "popular") {
      return [...devlogPosts].sort((a, b) => b.views - a.views);
    }
    return [...devlogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeFilter]);

  return (
    <SectionWatcher id="devlog" className="scroll-mt-32">
      <SlideUpInView>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">Devlog</p>
              <h2 className="text-3xl font-bold text-[var(--foreground)]">최근 기록</h2>
              <p className="mt-2 text-[var(--text-muted)]">실험, 트러블슈팅, 발표 내용 등을 Devlog에 기록합니다.</p>
            </div>
            <div className="flex gap-2 rounded-full border border-[var(--border)] bg-[var(--card-muted)] p-1 text-sm font-semibold text-[var(--text-muted)]">
              {filters.map((filter) => {
                const isActive = filter.id === activeFilter;
                return (
                  <button
                    key={filter.id}
                    className={`rounded-full px-4 py-1 transition ${isActive ? "bg-[var(--accent)] text-white" : ""}`}
                    onClick={() => setActiveFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
            {sortedPosts.map((post) => (
              <article
                key={post.id}
                className="min-w-[280px] flex-1 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">
                  {new Date(post.date).toLocaleDateString("ko-KR")}
                </p>
                <h3 className="mt-4 text-xl font-semibold text-[var(--foreground)]">{post.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{post.description}</p>
                <p className="mt-4 text-xs text-[var(--text-soft)]">조회수 {post.views.toLocaleString()}</p>
              </article>
            ))}
          </div>
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}
