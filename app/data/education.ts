export type EducationItem = {
  id: number;
  type: "education" | "certification";
  name: string;
  organization: string;
  period: string;
  details?: string[];
};

export const educationItems: EducationItem[] = [
  {
    id: 1,
    type: "education",
    name: "코드스테이츠 웹 풀스택 부트캠프",
    organization: "CodeStates",
    period: "2022.01 ~ 2022.07",
    details: ["JavaScript/TypeScript 심화", "팀 프로젝트 2회, 실무 멘토링 진행"],
  },
  {
    id: 2,
    type: "education",
    name: "Google UX Writing 온라인 과정",
    organization: "Google",
    period: "2023.03",
  },
  {
    id: 3,
    type: "certification",
    name: "정보처리기사",
    organization: "한국산업인력공단",
    period: "2021.11 취득",
  },
];
