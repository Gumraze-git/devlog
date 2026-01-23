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

export type TechIconMeta = {
  key: string;
  label: string;
  icon: string | null;
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

const normalize = (value: string) => value.trim().toLowerCase();

// Build a base map from skills list
const baseTechIconMap: Record<string, TechIconMeta> = skills.reduce((acc, item) => {
  const key = normalize(item.label);
  acc[key] = { key, label: item.label, icon: item.image ?? null };
  return acc;
}, {} as Record<string, TechIconMeta>);

// Additional aliases / tools not listed in skills array but used in projects
const extraTechIconMap: Record<string, TechIconMeta> = {
  "spring boot": { key: "spring boot", label: "Spring Boot", icon: "https://htmacgfeigx1pttr.public.blob.vercel-storage.com/icon/spring-boot.svg" },
  "aws ecs": { key: "aws ecs", label: "AWS ECS", icon: baseTechIconMap["aws"]?.icon ?? vercelBlob("AWS-Cloud-logo_32_Dark.svg") },
  ec2: { key: "ec2", label: "Amazon EC2", icon: "https://htmacgfeigx1pttr.public.blob.vercel-storage.com/icon/EC2.svg" },
  redis: { key: "redis", label: "Redis", icon: null },
  firebase: { key: "firebase", label: "Firebase", icon: vercelBlob("firebase.svg") },
  "react native": { key: "react native", label: "React Native", icon: baseTechIconMap["react"]?.icon ?? vercelBlob("React_Logo_3.svg") },
  "react query": { key: "react query", label: "React Query", icon: null },
  recoil: { key: "recoil", label: "Recoil", icon: null },
  "next.js": { key: "next.js", label: "Next.js", icon: baseTechIconMap["next.js"]?.icon ?? vercelBlob("nextjs-icon-light-background.svg") },
  "tailwind css": { key: "tailwind css", label: "Tailwind CSS", icon: baseTechIconMap["tailwind css"]?.icon ?? vercelBlob("tailwindcss-mark.d52e9897.svg") },
  typescript: { key: "typescript", label: "TypeScript", icon: baseTechIconMap["typescript"]?.icon ?? vercelBlob("ts-logo-512.svg") },
  "type script": { key: "type script", label: "TypeScript", icon: baseTechIconMap["typescript"]?.icon ?? vercelBlob("ts-logo-512.svg") },
  junit: { key: "junit", label: "JUnit", icon: "https://htmacgfeigx1pttr.public.blob.vercel-storage.com/icon/junit-logo.svg" },
  "github actions": { key: "github actions", label: "Github Actions", icon: "https://htmacgfeigx1pttr.public.blob.vercel-storage.com/icon/GitHub_Invertocat_Black.svg" },
  docker: { key: "docker", label: "Docker", icon: "https://htmacgfeigx1pttr.public.blob.vercel-storage.com/icon/docker-mark-blue.svg" },
  kafka: { key: "kafka", label: "Kafka", icon: "https://htmacgfeigx1pttr.public.blob.vercel-storage.com/apache_kafka_logo_icon_167866.svg" },
  oauth: { key: "oauth", label: "OAuth", icon: "https://htmacgfeigx1pttr.public.blob.vercel-storage.com/Oauth_logo.png" },
  fastapi: { key: "fastapi", label: "FastAPI", icon: "https://htmacgfeigx1pttr.public.blob.vercel-storage.com/icon/Fast%20API.svg" },
  "aws ec2": { key: "aws ec2", label: "Amazon EC2", icon: "https://htmacgfeigx1pttr.public.blob.vercel-storage.com/icon/EC2.svg" },
};

export function getTechIconMeta(name: string): TechIconMeta | null {
  const key = normalize(name);
  return extraTechIconMap[key] ?? baseTechIconMap[key] ?? null;
}

export function hasTechIcon(name: string): boolean {
  return Boolean(getTechIconMeta(name));
}

export function listTechIcons(): TechIconMeta[] {
  const merged = { ...baseTechIconMap, ...extraTechIconMap };
  return Object.values(merged);
}
