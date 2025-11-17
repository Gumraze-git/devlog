export type Project = {
  id: number;
  title: string;
  summary: string;
  period: string;
  members: string;
  stack: string[];
  highlights: string[];
};

export const projects: Project[] = [
  {
    id: 1,
    title: "Portfolio 3.0",
    summary: "Notion API 기반으로 콘텐츠를 자동 동기화하는 포트폴리오 플랫폼",
    period: "2023.11 ~ 진행 중",
    members: "1인 개인 프로젝트",
    stack: ["Next.js", "TypeScript", "Notion API", "Vercel"],
    highlights: [
      "콘텐츠 수정 시 자동 배포 파이프라인 구성",
      "MDX + 노션 하이브리드 렌더링으로 커스텀 컴포넌트 지원",
    ],
  },
  {
    id: 2,
    title: "Team Radar",
    summary: "스터디 팀 컨디션 체크를 위한 모바일 웹 서비스",
    period: "2024.01 ~ 2024.06",
    members: "FE 1, BE 1, 디자이너 1",
    stack: ["Next.js", "Firebase", "Tailwind CSS"],
    highlights: ["실시간 데이터 반영으로 인터뷰 피드백 반영", "모바일 퍼스트 디자인 도입"],
  },
];
