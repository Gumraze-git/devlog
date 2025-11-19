import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";

const highlights = [
  { label: "주요 스택", value: "Next.js · TypeScript · Tailwind" },
  { label: "관심사", value: "DX · 접근성 · 문서화" },
];

export default function AboutSection() {
  return (
    <SectionWatcher id="about" className="scroll-mt-32">
      <SlideUpInView>
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white/80 px-8 mt-15 py-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">About</p>
            <h2 className="text-3xl font-bold text-slate-900">소개</h2>
            <p className="text-slate-900">

              컴퓨터에 대한 원리를 이해하고, 이해를 기반으로 근거있는 개발을 하는 개발자를 지향합니다.

              사용자 요구를 데이터와 프로덕트 관점에서 해석하여 확장 가능한 백엔드 서비스를 설계합니다.
              문제의 원인을 기록하고 재사용 가능한 솔루션으로 환원하는 과정을 즐깁니다!

            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}
