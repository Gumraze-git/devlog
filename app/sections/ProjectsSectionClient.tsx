"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { X } from "lucide-react";

import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";
import ItemCardList from "../components/ui/ItemCardList";
import { type Project } from "../lib/projects";

type ProjectsSectionClientProps = {
  projects: Project[];
};

export default function ProjectsSectionClient({ projects }: ProjectsSectionClientProps) {
  const [selected, setSelected] = useState<Project | null>(null);

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
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">사이드 프로젝트</h2>
              <p className="text-sm md:text-base text-[var(--text-muted)]">진행 중 혹은 완료한 프로젝트의 하이라이트를 모았습니다.</p>
            </div>
            <Link
              href="/projects"
              className="rounded-full border border-[var(--border)] bg-[var(--card-muted)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
            >
              모든 프로젝트 보기
            </Link>
          </div>

          <ItemCardList
            items={cards}
            onSelect={(item) => {
              const found = projects.find((p) => p.slug === item.slug);
              if (found) setSelected(found);
            }}
            renderTitle={(item) => (
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base md:text-lg font-semibold text-[var(--foreground)] line-clamp-2">{item.title}</h3>
                {item.meta && <span className="text-[11px] font-normal text-[var(--text-soft)]">{item.meta}</span>}
              </div>
            )}
          />
        </div>
      </SlideUpInView>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div className="relative max-h-[85vh] w-full max-w-xl md:max-w-2xl overflow-y-auto rounded-3xl bg-[var(--card)] p-5 md:p-6 shadow-2xl border border-[var(--border)]">
            <button
              className="absolute right-3 top-3 md:right-4 md:top-4 text-[var(--text-soft)] p-2"
              onClick={() => setSelected(null)}
              aria-label="닫기"
            >
              <X size={20} />
            </button>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">{selected.period}</p>
              <h3 className="text-xl md:text-2xl font-bold text-[var(--foreground)]">{selected.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{selected.summary}</p>
              <div className="relative h-40 md:h-48 overflow-hidden rounded-2xl bg-[var(--card-subtle)]">
                <Image
                  src={selected.thumbnail ?? "/devlog-placeholder.svg"}
                  alt={selected.title}
                  fill
                  sizes="600px"
                  className="object-cover"
                />
              </div>
              {selected.content && (
                <div
                  className="prose prose-sm prose-invert text-[var(--text-muted)] max-w-none"
                  dangerouslySetInnerHTML={{ __html: selected.content }}
                />
              )}
              <dl className="grid gap-2 text-sm text-[var(--text-muted)]">
                <div className="flex justify-between">
                  <dt className="font-semibold text-[var(--text-soft)]">인원</dt>
                  <dd className="text-[var(--foreground)]">{selected.members}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--text-soft)]">기술 스택</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {selected.stack.map((tech) => (
                      <span key={tech} className="rounded-full bg-[var(--border-muted)] px-2 py-0.5 text-xs font-semibold text-[var(--foreground)]">
                        {tech}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
              <div className="space-y-2">
                {selected.highlights.map((h, idx) => (
                  <p key={idx} className="rounded-2xl bg-[var(--card-muted)] p-2 text-sm text-[var(--text-muted)]">
                    {h}
                  </p>
                ))}
              </div>
              <Link
                href={`/projects/${selected.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
              >
                자세히 보기
              </Link>
            </div>
          </div>
        </div>
      )}
    </SectionWatcher>
  );
}
