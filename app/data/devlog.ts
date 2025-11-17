export type DevlogPost = {
  id: number;
  title: string;
  description: string;
  date: string;
  views: number;
};

export const devlogPosts: DevlogPost[] = [
  {
    id: 1,
    title: "Next.js App Router 전환기",
    description: "App Router 구조를 도입하며 마주친 문제와 해결 과정, 폴더 전략을 정리했습니다.",
    date: "2024-05-12",
    views: 1240,
  },
  {
    id: 2,
    title: "MDX 기반 문서화 파이프라인 구축",
    description: "기존 Markdown 포스트를 MDX로 이관하고 컴포넌트 기반으로 재사용하는 방식을 정리했습니다.",
    date: "2024-04-28",
    views: 980,
  },
  {
    id: 3,
    title: "Tailwind 디자인 시스템 다듬기",
    description: "디자이너 없이도 일관된 색/여백 시스템을 유지하기 위한 Token 전략을 공유합니다.",
    date: "2024-04-09",
    views: 742,
  },
  {
    id: 4,
    title: "Vercel 배포 자동화 경험담",
    description: "프리뷰/프로덕션 파이프라인을 자동화하면서 생긴 이슈와 처리 과정을 기록했습니다.",
    date: "2024-03-21",
    views: 563,
  },
];
