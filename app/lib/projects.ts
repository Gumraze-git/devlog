import fs from "fs";
import path from "path";

import matter from "gray-matter";

export type ProjectMeta = {
  slug: string;
  title: string;
  summary: string;
  period: string;
  members: string;
  stack: string[];
  highlights: string[];
  date?: string;
  role?: string;
  repo?: string;
  thumbnail?: string;
  published?: boolean;
};

export type Project = ProjectMeta & { content: string };

const projectsDir = path.join(process.cwd(), "posts/projects");

export function getAllProjects(): Project[] {
  if (!fs.existsSync(projectsDir)) return [];

  const files = fs.readdirSync(projectsDir).filter((file) => file.endsWith(".md"));

  const projects = files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(projectsDir, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title ?? slug,
        summary: data.summary ?? "",
        period: data.period ?? "",
        members: data.members ?? "",
        stack: data.stack ?? [],
        highlights: data.highlights ?? [],
        date: data.date ?? "",
        role: data.role ?? "",
        repo: data.repo,
        thumbnail: data.thumbnail ?? "/devlog-placeholder.svg",
        published: data.published !== false,
        content,
      } as Project;
    })
    .filter((p) => p.published)
    .sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0;
      const bTime = b.date ? new Date(b.date).getTime() : 0;
      return bTime - aTime;
    });

  return projects;
}

export function getProject(slug: string): Project | null {
  const fullPath = path.join(projectsDir, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title ?? slug,
    summary: data.summary ?? "",
    period: data.period ?? "",
    members: data.members ?? "",
    stack: data.stack ?? [],
    highlights: data.highlights ?? [],
    date: data.date ?? "",
    role: data.role ?? "",
    repo: data.repo,
    thumbnail: data.thumbnail ?? "/devlog-placeholder.svg",
    published: data.published !== false,
    content,
  };
}
