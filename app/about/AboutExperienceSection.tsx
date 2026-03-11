import { SectionHeader } from "../components/common/SectionHeader";
import type { ExperienceItem } from "../data/experience";

type AboutExperienceSectionProps = {
  items: ExperienceItem[];
};

export function AboutExperienceSection({ items }: AboutExperienceSectionProps) {
  return (
    <section className="space-y-8">
      <SectionHeader title="Experience" />

      <div className="space-y-12">
        {items.map((item) => (
          <div key={item.id} className="grid gap-8 md:grid-cols-[250px_1fr]">
            <div className="space-y-2">
              <h3 className="text-lg font-bold">{item.company}</h3>
              <p className="text-sm text-[var(--text-soft)]">{item.period}</p>
              <p className="whitespace-pre-line text-sm font-semibold text-[var(--accent-strong)]">
                {item.position}
              </p>
            </div>

            <div className="space-y-6 pt-1">
              <p className="whitespace-pre-line text-base leading-relaxed text-[var(--text-muted)]">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
