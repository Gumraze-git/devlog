"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";
import { type EducationMeta } from "../lib/education";

type EducationSectionClientProps = {
  educations: EducationMeta[];
};

export default function EducationSectionClient({ educations }: EducationSectionClientProps) {
  const [selected, setSelected] = useState<EducationMeta | null>(null);

  useEffect(() => {
    if (!selected) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selected]);

  return (
    <SectionWatcher id="education" className="scroll-mt-32">
      <SlideUpInView>
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">Education</p>
          <h2 className="text-3xl font-bold text-[var(--foreground)]">교육</h2>
          <p className="text-[var(--text-muted)]">이수한 교육 과정을 정리했습니다.</p>
        </div>

        <div className="mt-6 space-y-4">
          {educations.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card-subtle)] p-6 text-[var(--text-muted)]">
              등록된 교육 이력이 없습니다.
            </div>
          ) : (
            educations.map((item) => (
              <button
                key={item.slug}
                onClick={() => setSelected(item)}
                className="w-full text-left"
                aria-label={`${item.title} 상세 보기`}
              >
                <article className="rounded-3xl border border-[var(--border)] bg-[var(--card-muted)] p-6 shadow-sm transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg">
                  <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">{item.organization}</p>
                  <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">{item.title}</h3>
                  <p className="text-sm text-[var(--text-soft)]">{item.period}</p>
                  {item.details && item.details.length > 0 && (
                    <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-[var(--text-muted)]">
                      {item.details.slice(0, 3).map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                      {item.details.length > 3 && (
                        <li className="text-[var(--text-soft)]">자세히 보려면 클릭하세요</li>
                      )}
                    </ul>
                  )}
                </article>
              </button>
            ))
          )}
        </div>
      </SlideUpInView>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="education-modal-title"
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
            <button
              className="absolute right-4 top-4 text-[var(--text-soft)]"
              onClick={() => setSelected(null)}
              aria-label="닫기"
            >
              <X size={20} />
            </button>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">{selected.organization}</p>
              <h3 id="education-modal-title" className="text-2xl font-bold text-[var(--foreground)]">
                {selected.title}
              </h3>
              <p className="text-sm text-[var(--text-soft)]">{selected.period}</p>
              {selected.details && selected.details.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-[var(--text-muted)]">
                  {selected.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--text-soft)]">추가 설명이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </SectionWatcher>
  );
}
