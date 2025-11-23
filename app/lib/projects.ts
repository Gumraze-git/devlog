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
  thumbnail?: string;
  published?: boolean;
};

export type Project = ProjectMeta;

const projectsDir = path.join(process.cwd(), "posts/projects");

export function getAllProjects(): ProjectMeta[] {
  if (!fs.existsSync(projectsDir)) return [];

  const files = fs.readdirSync(projectsDir).filter((file) => file.endsWith(".md"));

  const projects = files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(projectsDir, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title ?? slug,
        summary: data.summary ?? "",
        period: data.period ?? "",
        members: data.members ?? "",
        stack: data.stack ?? [],
        highlights: data.highlights ?? [],
        thumbnail: data.thumbnail ?? "/devlog-placeholder.svg",
        published: data.published !== false,
      } as ProjectMeta;
    })
    .filter((p) => p.published);

  return projects;
}

export function getProject(slug: string): Project | null {
  const fullPath = path.join(projectsDir, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data } = matter(fileContents);

  return {
    slug,
    title: data.title ?? slug,
    summary: data.summary ?? "",
    period: data.period ?? "",
    members: data.members ?? "",
    stack: data.stack ?? [],
    highlights: data.highlights ?? [],
    thumbnail: data.thumbnail ?? "/devlog-placeholder.svg",
    published: data.published !== false,
  };
}
