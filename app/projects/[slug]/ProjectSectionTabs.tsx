"use client";

import { useState } from "react";

import MarkdownRenderer from "../../components/MarkdownRenderer";
import { extractHeadings } from "../../lib/markdown";
import type { ProjectContentSection } from "../../lib/markdown";
import ProjectTroubleshootingTab from "./ProjectTroubleshootingTab";

type ProjectSectionTabsProps = {
  sections: ProjectContentSection[];
  codeHtmlByKey?: Record<string, string>;
};

export default function ProjectSectionTabs({
  sections,
  codeHtmlByKey,
}: ProjectSectionTabsProps) {
  const [activeSlug, setActiveSlug] = useState<string>(() => sections[0]?.slug ?? "");
  const activeSection = sections.find((section) => section.slug === activeSlug) ?? sections[0];
  const currentActiveSlug = activeSection?.slug ?? "";
  const isTroubleshootingTab = activeSection?.title.includes("트러블") ?? false;
  const isEvaluationTab = activeSection?.title.includes("평가") ?? false;
  
  const shouldHideToc = isTroubleshootingTab || isEvaluationTab;
  const headings = shouldHideToc ? [] : extractHeadings(activeSection?.content ?? "");

  const getSectionEmoji = (title: string) => {
    if (title.includes("개요")) return "📝";
    if (title.includes("아키텍처")) return "🏗️";
    if (title.includes("DB")) return "💾";
    if (title.includes("API")) return "🔌";
    if (title.includes("트러블") || title.includes("성능")) return "🛠️";
    if (title.includes("평가") || title.includes("예시")) return "✨";
    if (title.includes("회고") || title.includes("Reflections")) return "💡";
    return "📌";
  };

  if (!activeSection) return null;

  return (
    <div className="space-y-4 w-full">
      <div className="sticky top-[calc(3.5rem-1px)] z-30 mb-5 w-full relative">
        {/* Full-bleed background & borders via pseudo-element that breaks out to the right screen edge */}
        <div className="absolute inset-y-0 -left-[50vw] lg:left-[calc(-50vw+16rem)] -right-[50vw] bg-[var(--background)]/90 backdrop-blur-md -z-10" />
        <div className="pointer-events-none absolute bottom-0 -left-[50vw] lg:left-[calc(-50vw+16rem)] -right-[50vw] h-px bg-[var(--border)] z-20" />
        
        <div className="relative z-10 mx-auto w-full max-w-6xl py-4">
          <div
            role="tablist"
            aria-label="Project sections"
            className="flex flex-wrap items-center gap-2 sm:gap-3 w-full"
          >
          {sections.map((section) => {
            const isActive = section.slug === currentActiveSlug;
            const emoji = getSectionEmoji(section.title);

            return (
              <button
                key={section.slug}
                id={`project-tab-${section.slug}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`project-panel-${section.slug}`}
                onClick={() => setActiveSlug(section.slug)}
                className={`flex-none px-4 py-2.5 rounded-full text-[14.5px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
                  isActive
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-md"
                    : "bg-transparent text-[var(--text-muted)] hover:bg-[var(--card-subtle)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-[1.1em]">{emoji}</span>
                  <span>{section.title}</span>
                </div>
              </button>
            );
          })}
          </div>
        </div>
      </div>

      <div
        id={`project-panel-${activeSection.slug}`}
        role="tabpanel"
        aria-labelledby={`project-tab-${activeSection.slug}`}
        className="pt-6 pb-12 w-full mx-auto max-w-6xl animate-in fade-in zoom-in-95 duration-300"
      >
        {activeSection.content.trim().length > 0 ? (
          isTroubleshootingTab || isEvaluationTab ? (
            <ProjectTroubleshootingTab
              title={activeSection.title}
              content={activeSection.content}
              codeHtmlByKey={codeHtmlByKey}
            />
          ) : (
            <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch">
              <div className="flex-1 min-w-0 space-y-6">
                <h2 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] md:text-3xl">
                  {activeSection.title}
                </h2>

                <MarkdownRenderer
                  content={activeSection.content}
                  codeHtmlByKey={codeHtmlByKey}
                  className="project-md-readable max-w-none mx-0 prose-p:leading-[1.8] prose-li:my-2.5 prose-li:leading-[1.75]"
                />
              </div>

              {headings.length > 0 && (
                <aside className="hidden lg:block w-56 shrink-0 relative">
                  <div className="sticky top-[140px] space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto no-scrollbar pb-6 relative">
                    <div className="mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-soft)]">
                        Contents
                      </h3>
                    </div>
                    <ul className="space-y-2.5 border-l-2 border-[var(--border-muted)] pl-4">
                      {headings.map((heading, idx) => (
                        <li key={`${heading.slug}-${idx}`} style={{ paddingLeft: `${(heading.depth - 2) * 0.75}rem` }}>
                          <a
                            href={`#${heading.slug}`}
                            className="block text-[14px] font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors leading-snug break-keep"
                          >
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              )}
            </div>
          )
        ) : (
          <p className="text-base text-[var(--text-muted)]">표시할 내용이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
