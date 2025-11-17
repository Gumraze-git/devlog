import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";

export default function ContactSection() {
  return (
    <SectionWatcher id="contact" className="scroll-mt-32">
      <SlideUpInView>
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Contact</p>
            <h2 className="text-3xl font-bold text-slate-900">편하게 연락 주세요</h2>
            <p className="text-slate-600">프로젝트 제안, 커피챗 등 어떤 대화든 환영합니다.</p>
          </div>
          <div className="mx-auto grid max-w-lg grid-cols-2 gap-4 rounded-3xl bg-white/90 p-6 text-sm shadow-sm md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">전화번호</p>
              <p className="mt-1 text-base font-semibold text-slate-900">010-1234-5678</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">이메일</p>
              <a href="mailto:dkim@example.com" className="mt-1 inline-block text-base font-semibold text-emerald-600">
                dkim@example.com
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">GitHub</p>
              <a
                href="https://github.com/dkim"
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-base font-semibold text-emerald-600"
              >
                @dkim
              </a>
            </div>
          </div>
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}
