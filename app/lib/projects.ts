import fs from "fs";
import path from "path";

import matter from "gray-matter";

export type ProjectSource = {
  label: string;
  url: string;
};

export type ProjectMeta = {
  slug: string;
  title: string;
  projectTitle?: string;
  summary: string;
  period: string;
  members: string;
  stack: string[];
  highlights: string[];
  date?: string;
  education?: string[];
  role?: string;
  repo?: string;
  sources?: ProjectSource[];
  thumbnail?: string;
  published?: boolean;
};

export type Project = ProjectMeta & { content: string };

const projectsDir = path.join(process.cwd(), "posts/projects");

function normalizeSources(rawSources: unknown, repoFallback?: string): ProjectSource[] {
  const parsed = Array.isArray(rawSources)
    ? rawSources
      .map((item) => {
        if (typeof item === "string") {
          const url = item.trim();
          if (!url) return null;
          return { label: "Source", url };
        }

        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const label = typeof record.label === "string" ? record.label.trim() : "";
          const url = typeof record.url === "string" ? record.url.trim() : "";
          if (!url) return null;
          return { label: label || "Source", url };
        }

        return null;
      })
      .filter((value): value is ProjectSource => value !== null)
    : [];

  if (parsed.length > 0) {
    return parsed;
  }

  if (repoFallback) {
    return [{ label: "GitHub", url: repoFallback }];
  }

  return [];
}

export function getAllProjects(): Project[] {
  if (!fs.existsSync(projectsDir)) return [];

  const files = fs.readdirSync(projectsDir).filter((file) => file.endsWith(".md"));

  const projects = files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(projectsDir, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      const repo = data.repo ?? data.github_link ?? data.githubLink;
      const sources = normalizeSources(data.sources, repo);

      return {
        slug,
        title: data.title ?? slug,
        projectTitle: data.project_title ?? data.projectTitle ?? "",
        summary: data.summary ?? "",
        period: data.period ?? "",
        members: data.members ?? "",
        stack: data.stack ?? [],
        highlights: data.highlights ?? [],
        education: Array.isArray(data.education) ? data.education : data.education ? [data.education] : [],
        date: data.date ?? "",
        role: data.role ?? "",
        repo,
        sources,
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
  const repo = data.repo ?? data.github_link ?? data.githubLink;
  const sources = normalizeSources(data.sources, repo);

  return {
    slug,
    title: data.title ?? slug,
    projectTitle: data.project_title ?? data.projectTitle ?? "",
    summary: data.summary ?? "",
    period: data.period ?? "",
    members: data.members ?? "",
    stack: data.stack ?? [],
    highlights: data.highlights ?? [],
    education: Array.isArray(data.education) ? data.education : data.education ? [data.education] : [],
    date: data.date ?? "",
    role: data.role ?? "",
    repo,
    sources,
    thumbnail: data.thumbnail ?? "/devlog-placeholder.svg",
    published: data.published !== false,
    content,
  };
}
