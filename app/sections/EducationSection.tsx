import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";
import { getAllEducations } from "../lib/education";

export default function EducationSection() {
  const educations = getAllEducations();

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
              <article key={item.slug} className="rounded-3xl border border-[var(--border)] bg-[var(--card-muted)] p-6 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">{item.organization}</p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">{item.title}</h3>
                <p className="text-sm text-[var(--text-soft)]">{item.period}</p>
                {item.details && item.details.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-[var(--text-muted)]">
                    {item.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))
          )}
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}
