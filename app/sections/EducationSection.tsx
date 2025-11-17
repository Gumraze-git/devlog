import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";
import { educationItems } from "../data/education";

export default function EducationSection() {
  const educations = educationItems.filter((item) => item.type === "education");
  const certifications = educationItems.filter((item) => item.type === "certification");

  return (
    <SectionWatcher id="education" className="scroll-mt-32">
      <SlideUpInView>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Education</p>
            <h2 className="text-3xl font-bold text-slate-900">교육 & 자격</h2>
            <p className="text-slate-600">학습 이력과 자격증을 구분해 정리했습니다.</p>
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              {educations.map((item) => (
                <article key={item.id} className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{item.organization}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{item.name}</h3>
                  <p className="text-sm text-slate-500">{item.period}</p>
                  {item.details && (
                    <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-600">
                      {item.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-700">
              <p className="text-xs uppercase tracking-wide text-slate-500">Certification</p>
              <ul className="mt-2 space-y-2">
                {certifications.map((cert) => (
                  <li key={cert.id} className="flex justify-between">
                    <span>{cert.name}</span>
                    <span className="text-slate-500">{cert.period}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}
