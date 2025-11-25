export type SkillCategory = {
  id: string;
  name: string;
};

export type SkillItem = {
  label: string;
  categoryId: string;
  image: string;
  size?: number;
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
  // 백엔드
  { label: "Java", categoryId: "backend", image: vercelBlob("java-vertical.svg"), size: .8 },
  { label: "Spring", categoryId: "backend", image: vercelBlob("Spring%20Framework_idtAgBcShw_2.png"), size: .8 },

  // 프론트엔드
  { label: "React", categoryId: "frontend", image: vercelBlob("React_Logo_3.svg"), size: .8 },
  { label: "TypeScript", categoryId: "frontend", image: vercelBlob("ts-logo-512.svg"), size: .8 },
  { label: "Next.js", categoryId: "frontend", image: vercelBlob("nextjs-icon-light-background.svg"), size: .8 },
  { label: "Kotlin", categoryId: "frontend", image: vercelBlob("Kotlin%20icon.svg"), size: .8 },
  { label: "Swift", categoryId: "frontend", image: vercelBlob("Swift_logo_color.svg"), size: .8 },
  { label: "Tailwind CSS", categoryId: "frontend", image: vercelBlob("tailwindcss-mark.d52e9897.svg"), size: .8 },

  // 데이터베이스
  { label: "MySQL", categoryId: "database", image: vercelBlob("logo-mysql-170x115.png"), size: 0.8 },
  { label: "MongoDB", categoryId: "database", image: vercelBlob("MongoDB.svg"), size: .8 },
  { label: "PostgreSQL", categoryId: "database", image: vercelBlob("elephant.png"), size: .8 },

  // 환경 및 배포
  { label: "AWS", categoryId: "env", image: vercelBlob("AWS-Cloud-logo_32_Dark.svg"), size: .8 },
  { label: "Vercel", categoryId: "env", image: vercelBlob("vercel-icon-light.svg"), size: .8 },

  // 도구
  { label: "GitHub", categoryId: "tools", image: vercelBlob("GitHub_Logo.png"), size: .8 },
  { label: "Figma", categoryId: "tools", image: vercelBlob("Figma%20Icon%20%28Full-color%29.svg"), size: .8 },

  // AI
  { label: "Python", categoryId: "ai", image: vercelBlob("python-logo-only.svg"), size: .8 },
  { label: "PyTorch", categoryId: "ai", image: vercelBlob("PyTorch.svg"), size: .8 },
  { label: "TensorFlow", categoryId: "ai", image: vercelBlob("FullColorPrimary%20Icon.svg"), size: .8 },
];
