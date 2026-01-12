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
        school: "Korea University",
        major: "Computer Science",
        faculty: "College of Engineering",
        degree: "Bachelor of Science",
        period: "2015.03 - 2021.02",
        gpa: "3.8/4.5",
    },
];
