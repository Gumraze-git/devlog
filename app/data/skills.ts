export type SkillCategory = {
  id: string;
  name: string;
};

export type SkillItem = {
  label: string;
  categoryId: string;
  icon: string;
};

export const skillCategories: SkillCategory[] = [
  { id: "lang", name: "언어" },
  { id: "framework", name: "프레임워크" },
  { id: "style", name: "스타일링" },
  { id: "infra", name: "인프라 & 도구" },
];

export const skills: SkillItem[] = [
  { label: "TypeScript", categoryId: "lang", icon: "📘" },
  { label: "JavaScript", categoryId: "lang", icon: "📘" },
  { label: "Python", categoryId: "lang", icon: "📘" },
  { label: "Go", categoryId: "lang", icon: "📘" },
  { label: "Next.js", categoryId: "framework", icon: "🧩" },
  { label: "React", categoryId: "framework", icon: "🧩" },
  { label: "Node.js", categoryId: "framework", icon: "🧩" },
  { label: "Express", categoryId: "framework", icon: "🧩" },
  { label: "Tailwind CSS", categoryId: "style", icon: "🎨" },
  { label: "Styled Components", categoryId: "style", icon: "🎨" },
  { label: "Framer Motion", categoryId: "style", icon: "🎨" },
  { label: "Vercel", categoryId: "infra", icon: "⚙️" },
  { label: "AWS", categoryId: "infra", icon: "⚙️" },
  { label: "Docker", categoryId: "infra", icon: "⚙️" },
  { label: "GitHub Actions", categoryId: "infra", icon: "⚙️" },
];
