import { SectionHeader } from "../components/common/SectionHeader";

const visionSteps = [
  {
    period: "입사 초기",
    goal: "Precision Learner",
    desc: "주니어 개발자로서 팀의 컨벤션과 개발 원칙을 준수하며 기본기를 탄탄하게 다져 신뢰받는 개발자로 성장하는 단계",
  },
  {
    period: "3년 후",
    goal: "Knowledge Sharer",
    desc: "경험을 지식으로 전환하여 동료와 공유하고 성장을 돕는 핵심 개발자",
  },
  {
    period: "5년 후",
    goal: "Domain Expert",
    desc: "습득한 기술 기술력을 공유하고 신뢰받는 기술적 의사결정을 내릴 수 있는 전문가",
  },
  {
    period: "10년 후",
    goal: "Influential Leader",
    desc: "새로운 문제를 발견하고 도전 과제를 제안하며 팀과 함께 성장하는 리더",
  },
];

export function AboutVisionSection() {
  return (
    <section className="space-y-10">
      <SectionHeader title="Visions & Career Plan" />

      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {visionSteps.map((step) => (
          <div key={step.period} className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] font-mono">{step.period}</span>
            <h4 className="text-lg font-bold text-[var(--foreground)]">{step.goal}</h4>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)] pt-10">
        <div className="max-w-5xl space-y-8 text-base leading-[1.8] text-[var(--text-muted)]">
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
              몰입과 기록을 통해 경험을 지식으로 전환하는 개발자
            </h3>
            <p>
              저는 주어진 일에 몰입하며 원리를 파악하는 과정에서 성장의 동기를 얻습니다. 5년간 꾸준히 이어온 배드민턴을 통해 &apos;몰입과 성장&apos;의 가치를 배웠고, 이는 개발을 대하는 저의 태도가 되었습니다. 현대오토에버 SW스쿨 과정에서도 공식 문서를 통해 기술의 동작 원리를 파악하며 개발하는 과정을 거쳤으며, 이러한 경험은 문제를 간결하게 해결할 수 있는 기반이 되었습니다.
            </p>
            <p>
              저는 팀의 컨벤션과 개발 원칙을 준수하며, 기본기에 충실한 코드를 작성하는 것을 개발의 최우선 가치로 삼습니다. 단순히 기능을 구현하는 것을 넘어, 요구사항의 본질을 이해하며 유지보수가 용이하도록 견고한 코드를 작성하는 데 집중합니다. 이러한 원칙을 바탕으로 동료들이 믿고 협업할 수 있는 문제 해결사가 되고자 합니다.
            </p>
            <p>
              또한, 매일의 기술적 경험을 기록하고 &apos;지식&apos;으로 전환하기 위해 노력합니다. 학습한 내용을 문서화하여 동료들과 공유하고 토론하는 과정에서 지식의 선순환과 성장을 경험했습니다. 앞으로도 꾸준한 학습을 통해 특정 분야의 전문가로 거듭나고, 제가 쌓은 지식을 공동체에 환원할 수 있는 리더로 성장하고자 합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
