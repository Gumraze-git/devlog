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
  { id: "env", name: "환경 및 배포" },
  { id: "design", name: "디자인" },
];

const vercelBlob = (file: string) =>
  `https://lh8zlkkhlslw0zyz.public.blob.vercel-storage.com/skills/${file}`;

export const skills: SkillItem[] = [
  { label: "NestJS", categoryId: "backend", image: vercelBlob("nestjs-A4aT9Yw4MXZ148erSOxC9CpHXnZKBM.png") },
  { label: "Node.js", categoryId: "backend", image: vercelBlob("nodejs-rEoKmLz0cHVW8q1k0nMl6SZ7e0J8kr.png") },
  { label: "PostgreSQL", categoryId: "backend", image: vercelBlob("postgresql-vHh9QofCCRP4CTqOeIziGQ1mQ4YxOj.png") },
  { label: "Prisma", categoryId: "backend", image: vercelBlob("prisma-xvhQX6wEfTFxnJqyW8g9yonC5uHpcc.png") },
  { label: "Next.js", categoryId: "frontend", image: vercelBlob("Next.js-AhWeuPpDe5INDWIBXqSbbsxoV0OvzS.png") },
  { label: "React", categoryId: "frontend", image: vercelBlob("react-VS4Vwy6It1uAZy63ihXuYvHqqYkY1X.png") },
  { label: "TypeScript", categoryId: "frontend", image: vercelBlob("typescript-50YJFG5dzDLgPyvDvGxy6XZ6oMqjKi.png") },
  { label: "Framer Motion", categoryId: "frontend", image: vercelBlob("framer-CCbvOAkl7edZKmqh3ZCL1G1MjmE9mG.png") },
  { label: "Docker", categoryId: "env", image: vercelBlob("docker-Fk2t4QeHKC2dVEPxW48pRhS0Gva8Q1.png") },
  { label: "AWS", categoryId: "env", image: vercelBlob("aws-EfjHi6naHo8QZ1Ct3co51BD8bdvnFx.png") },
  { label: "Vercel", categoryId: "env", image: vercelBlob("Vercel-ALWOzGwrKtAkAFDgkaL3WGbPchkpSF.png") },
  { label: "GitHub Actions", categoryId: "env", image: vercelBlob("github-Mxif6CX9Gaip3dXvGCrgX7casaJM3D.png") },
  { label: "Figma", categoryId: "design", image: vercelBlob("figma-IiFO7yrdgnjBSjpxsCokIusUg6AoGO.png") },
  { label: "Tailwind CSS", categoryId: "design", image: vercelBlob("tailwind-css-Ac4YsB1L03P1CGQqjaJlIYKcWjAxtf.png") },
  { label: "Storybook", categoryId: "design", image: vercelBlob("Storybook-kGdPF5HNm19qyTpA0b4dcsOvVDRN0F.png") },
  { label: "Chakra UI", categoryId: "design", image: vercelBlob("Chakra-UI-s50fm8LjGHbhhGdljw6C7DLRGuHrvG.png") },
];
