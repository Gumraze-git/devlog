export type EducationItem = {
    school: string;
    major: string;
    faculty?: string; // e.g. "College of Engineering"
    degree?: string;  // e.g. "Bachelor of Science"
    period: string;
    gpa?: string;
};

export const educationItems: EducationItem[] = [
    {
        school: "현대오토에버/DX캠퍼스",
        major: "모빌리티 SW 스쿨 2기",
        faculty: "Full Stack 과정",
        period: "2025.04 - 2025.11",
        degree: "수료",
    },
];
