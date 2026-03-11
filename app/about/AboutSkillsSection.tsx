import { SectionHeader } from "../components/common/SectionHeader";

const skillGroups = [
  {
    category: "Overall",
    items: [
      "나보다는 상대가 듣고 싶은 말이 무엇인지 궁금해하는 협업 방식으로 요구사항을 파악하는데 집중합니다.",
      "근거를 기반한 개발과 소통으로 긴밀하고 정확한 의사결정 과정을 추구합니다.",
      "공식 문서를 꾸준히 읽고, 기술을 학습합니다.",
      "끊임없이 학습하고 기록하여 경험을 기록으로 전환하려고 합니다.",
      "이런 것들을 하는게 재밌고 잘하고 싶습니다.",
    ],
  },
  {
    category: "Communication",
    items: [
      "문서를 기반한 소통으로 불필요한 시간을 줄이고 다음 단계에 집중합니다.",
      "지식 공유 세션으로 프로젝트 팀의 생산성 향상을 도모합니다.",
    ],
  },
  {
    category: "Backend",
    items: [
      "테스트 코드를 기반으로 기능을 개발합니다.",
      "공식문서를 꾸준히 읽으며, 최신 기술을 학습합니다.",
      "Spring Boot, Fast API 기반의 개발 프로젝트 경험이 있습니다.",
      "배포 환경과 개발 환경을 통합하여, 배포 시에도 정상 작동하는 비즈니스를 개발하는데 집중합니다.",
    ],
  },
  {
    category: "DevOps",
    items: [
      "배포 환경과 개발 환경을 동일하게 구축하여, 중단 없는 개발 프로세스가 이어지도록 합니다.",
      "AWS EC2 배포 경험이 있습니다.",
    ],
  },
];

export function AboutSkillsSection() {
  return (
    <section className="space-y-10">
      <SectionHeader title="Skills" />

      <div className="grid gap-10 md:grid-cols-2">
        {skillGroups.map((skill) => (
          <div key={skill.category} className="space-y-4">
            <h3 className="border-l-4 border-[var(--accent)] pl-4 text-lg font-bold uppercase tracking-tight text-[var(--foreground)]">
              {skill.category}
            </h3>
            <ul className="list-outside list-disc space-y-2 pl-5 text-base leading-relaxed text-[var(--text-muted)]">
              {skill.items.map((item) => (
                <li key={item} className="pl-1">{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
