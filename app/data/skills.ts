export type SkillCategory = {
  id: string;
  name: string;
};

export type SkillItem = {
  label: string;
  categoryId: string;
  image: string;
};

export const skillCategories: SkillCategory[] = [
  { id: "all", name: "전체" },
  { id: "backend", name: "백엔드" },
  { id: "frontend", name: "프론트엔드" },
  { id: "database", name: "데이터베이스" },
  { id: "env", name: "환경 및 배포" },
  { id: "tools", name: "도구" },
  { id: "ai", name: "AI" },
];

const vercelBlob = (file: string) =>
  `https://htmacgfeigx1pttr.public.blob.vercel-storage.com/icon/${file}`;

export const skills: SkillItem[] = [
  // 프론트엔드
  { label: "React", categoryId: "frontend", image: vercelBlob("React_Logo_3.svg") },
  { label: "TypeScript", categoryId: "frontend", image: vercelBlob("ts-logo-512.svg") },
  { label: "Next.js", categoryId: "frontend", image: vercelBlob("nextjs-icon-light-background.svg") },
  { label: "Kotlin", categoryId: "frontend", image: vercelBlob("Kotlin%20icon.svg") },
  { label: "Swift", categoryId: "frontend", image: vercelBlob("Swift_logo_color.svg") },
  { label: "Tailwind CSS", categoryId: "frontend", image: vercelBlob("tailwindcss-mark.d52e9897.svg") },

  // 백엔드
  { label: "Java", categoryId: "backend", image: vercelBlob("java-vertical.svg") },
  { label: "Spring", categoryId: "backend", image: vercelBlob("Spring%20Framework_idtAgBcShw_2.png") },

  // 데이터베이스
  { label: "MySQL", categoryId: "database", image: vercelBlob("logo-mysql-170x115.png") },
  { label: "MongoDB", categoryId: "database", image: vercelBlob("MongoDB.svg") },
  { label: "PostgreSQL", categoryId: "database", image: vercelBlob("elephant.png") },

  // 환경 및 배포
  { label: "AWS", categoryId: "env", image: vercelBlob("AWS-Cloud-logo_32_Dark.svg") },
  { label: "Vercel", categoryId: "env", image: vercelBlob("vercel-icon-light.svg") },

  // 도구
  { label: "GitHub", categoryId: "tools", image: vercelBlob("GitHub_Logo.png") },
  { label: "Figma", categoryId: "tools", image: vercelBlob("Figma%20Icon%20%28Full-color%29.svg") },

  // AI
  { label: "Python", categoryId: "ai", image: vercelBlob("python-logo-only.svg") },
  { label: "PyTorch", categoryId: "ai", image: vercelBlob("PyTorch.svg") },
  { label: "TensorFlow", categoryId: "ai", image: vercelBlob("FullColorPrimary%20Icon.svg") },
];
