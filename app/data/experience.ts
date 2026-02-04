export type ExperienceItem = {
    id: string;
    company: string;
    position: string;
    period: string;
    description: string;
};

export const experienceItems: ExperienceItem[] = [
    {
        id: "1",
        company: "현대오토에버 SW 스쿨 2기",
        position: "백엔드 개발자 (교육 과정)",
        period: "2025.04 - 2025.11",
        description: "풀스택 교육 과정을 수료하고, 팀 프로젝트에서 백엔드 리드 역할을 수행함.\nERD 기반 도메인 설계와 REST API 구조 설계를 담당했으며,\n프론트엔드와의 협업을 고려한 API 명세 및 개발 프로세스를 주도함.",
    },
];
