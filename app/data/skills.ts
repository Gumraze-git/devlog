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
  `https://lh8zlkkhlslw0zyz.public.blob.vercel-storage.com/skills/${file}`;

export const skills: SkillItem[] = [
  // 프론트엔드
  { label: "React", categoryId: "frontend", image: vercelBlob("react-VS4Vwy6It1uAZy63ihXuYvHqqYkY1X.png") },
  { label: "TypeScript", categoryId: "frontend", image: vercelBlob("typescript-50YJFG5dzDLgPyvDvGxy6XZ6oMqjKi.png") },
  { label: "Next.js", categoryId: "frontend", image: vercelBlob("Next.js-AhWeuPpDe5INDWIBXqSbbsxoV0OvzS.png") },
  { label: "Kotlin", categoryId: "frontend", image: vercelBlob("kotlin.png") },
  { label: "Swift", categoryId: "frontend", image: vercelBlob("swift.png") },
  { label: "Tailwind CSS", categoryId: "frontend", image: vercelBlob("tailwind-css-Ac4YsB1L03P1CGQqjaJlIYKcWjAxtf.png") },

  // 백엔드
  { label: "Java", categoryId: "backend", image: vercelBlob("java.png") },
  { label: "Spring", categoryId: "backend", image: vercelBlob("spring.png") },

  // 데이터베이스
  { label: "MySQL", categoryId: "database", image: vercelBlob("mysql.png") },
  { label: "MongoDB", categoryId: "database", image: vercelBlob("mongodb.png") },
  { label: "PostgreSQL", categoryId: "database", image: vercelBlob("postgresql-vHh9QofCCRP4CTqOeIziGQ1mQ4YxOj.png") },

  // 환경 및 배포
  { label: "AWS", categoryId: "env", image: vercelBlob("aws-EfjHi6naHo8QZ1Ct3co51BD8bdvnFx.png") },
  { label: "Vercel", categoryId: "env", image: vercelBlob("Vercel-ALWOzGwrKtAkAFDgkaL3WGbPchkpSF.png") },

  // 도구
  { label: "GitHub", categoryId: "tools", image: vercelBlob("github-Mxif6CX9Gaip3dXvGCrgX7casaJM3D.png") },
  { label: "Figma", categoryId: "tools", image: vercelBlob("figma-IiFO7yrdgnjBSjpxsCokIusUg6AoGO.png") },

  // AI
  { label: "Python", categoryId: "ai", image: vercelBlob("python.png") },
  { label: "PyTorch", categoryId: "ai", image: vercelBlob("pytorch.png") },
  { label: "TensorFlow", categoryId: "ai", image: vercelBlob("tensorflow.png") },
];
