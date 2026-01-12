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
        company: "Tech Company A",
        position: "Backend Engineer",
        period: "2023.01 - Present",
        description: "Developed scalable microservices using Spring Boot and Kafka. Optimized database queries improving performance by 30%.",
    },
    {
        id: "2",
        company: "Startup B",
        position: "Junior Developer",
        period: "2021.06 - 2022.12",
        description: "Built RESTful APIs with Node.js and Express. Managed CI/CD pipelines using GitHub Actions.",
    },
];
