"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { X } from "lucide-react";

import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";
import OverlayCard from "../components/ui/OverlayCard";
import { type Project } from "../lib/projects";
import { useEffect } from "react";
import { getTechIconMeta } from "../data/skills";
import ReactMarkdown from "react-markdown";

type ProjectsSectionClientProps = {
  projects: Project[];
};

export default function ProjectsSectionClient({ projects }: ProjectsSectionClientProps) {
  const [selected, setSelected] = useState<Project | null>(null);
  useEffect(() => {
    if (!selected) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    // prevent layout shift when scrollbar disappears (approx 16px)
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [selected]);

  const cards = useMemo(
    () =>
      projects.map((project) => ({
        slug: project.slug,
        title: project.title,
        summary: project.summary,
        thumbnail: project.thumbnail,
        tags: project.stack,
        meta: project.period,
      })),
    [projects],
  );

  return (
    <SectionWatcher id="projects" className="scroll-mt-24 md:scroll-mt-32">
      <SlideUpInView>
        <div className="space-y-6 md:space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">Projects</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">프로젝트</h2>
              <p className="text-sm md:text-base text-[var(--text-muted)]">완료한 프로젝트의 하이라이트를 모았습니다.</p>
            </div>
            <Link
              href="/projects"
              className="rounded-full border border-[var(--border)] bg-[var(--card-muted)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
            >
              모든 프로젝트 보기
            </Link>
          </div>

          <div className="no-scrollbar flex gap-3 md:gap-4 overflow-x-auto overflow-y-visible pb-4 pt-2 px-1 md:px-2">
            {cards.map((item) => (
              <OverlayCard
                key={item.slug}
                as="button"
                title={item.title}
                date={item.meta ?? ""}
                thumbnail={item.thumbnail}
                ariaLabel={`Project ${item.title}`}
                onSelect={() => {
                  const found = projects.find((p) => p.slug === item.slug);
                  if (found) setSelected(found);
                }}
              />
            ))}
          </div>
        </div>
      </SlideUpInView>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.title} 상세보기`}
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-xl md:max-w-2xl overflow-y-auto no-scrollbar rounded-[28px] bg-[var(--card)] p-5 md:p-6 shadow-2xl border border-[var(--border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-3 top-3 md:right-4 md:top-4 text-[var(--text-soft)] p-2"
              onClick={() => setSelected(null)}
              aria-label="닫기"
            >
              <X size={20} />
            </button>
            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl font-bold text-[var(--foreground)]">{selected.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{selected.summary}</p>

              <div className="relative h-44 md:h-56 overflow-hidden rounded-2xl bg-[var(--card-subtle)]">
                <Image
                  src={selected.thumbnail ?? "/devlog-placeholder.svg"}
                  alt={selected.title}
                  fill
                  sizes="700px"
                  className="object-cover"
                />
              </div>

              {/* 기술 스택 아이콘 그리드 */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">기술 스택</p>
                <div className="mt-3 grid grid-cols-4 gap-3 md:grid-cols-5">
                  {selected.stack.map((tech) => {
                    const meta = getTechIconMeta(tech);
                    return (
                      <div
                        key={tech}
                        className="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-[var(--card-muted)] p-2 text-xs text-[var(--text-muted)] shadow-sm"
                        aria-label={meta?.label ?? tech}
                        title={meta?.label ?? tech}
                      >
                        {meta?.icon ? (
                          <div className="relative h-7 w-7 md:h-8 md:w-8">
                            <Image
                              src={meta.icon}
                              alt={meta.label}
                              fill
                              sizes="64px"
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <span className="rounded-full bg-[var(--border-muted)] px-2 py-1 text-[11px] font-semibold text-[var(--foreground)]">
                            {meta?.label ?? tech}
                          </span>
                        )}
                        <span className="text-[11px] text-[var(--text-soft)] leading-tight">{meta?.label ?? tech}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <dl className="space-y-3 text-sm text-[var(--text-muted)]">
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-semibold text-[var(--text-soft)]">인원</dt>
                  <dd className="text-[var(--foreground)]">{selected.members}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-semibold text-[var(--text-soft)]">기간</dt>
                  <dd className="text-[var(--foreground)]">{selected.period}</dd>
                </div>
                {selected.repo && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="font-semibold text-[var(--text-soft)]">Repo</dt>
                    <dd>
                      <Link
                        href={selected.repo}
                        className="text-[var(--accent-strong)] underline underline-offset-2 hover:text-[var(--accent)]"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {selected.repo}
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>

              {/* 본문을 Markdown으로 렌더 */}
              {selected.content && (
                <div className="prose prose-sm prose-invert max-w-none text-[var(--text-muted)]">
                  <ReactMarkdown>{selected.content}</ReactMarkdown>
                </div>
              )}

              <div className="space-y-2">
                {selected.highlights.map((h, idx) => (
                  <p key={idx} className="rounded-2xl bg-[var(--card-muted)] p-2 text-sm text-[var(--text-muted)]">
                    {h}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </SectionWatcher>
  );
}
