import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";

const highlights = [
  { label: "경력", value: "4년차 프론트엔드" },
  { label: "주요 스택", value: "Next.js · TypeScript · Tailwind" },
  { label: "관심사", value: "DX · 접근성 · 문서화" },
];

export default function AboutSection() {
  return (
    <SectionWatcher id="about" className="scroll-mt-32">
      <SlideUpInView>
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white/80 px-8 mt-40 py-6 shadow-sm">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">About</p>
            <h2 className="text-3xl font-bold text-slate-900">소개</h2>
            <p className="text-slate-600">
              디자인 시스템과 개발자 경험(DX)에 관심이 많은 프론트엔드 개발자입니다. 읽기 쉬운 코드, 재사용 가능한
              컴포넌트, 그리고 안정된 배포 파이프라인에 집중합니다.
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
