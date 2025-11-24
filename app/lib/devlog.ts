import fs from "fs";
import path from "path";

import matter from "gray-matter";

export type DevlogMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  thumbnail?: string;
  tags?: string[];
  views?: number;
  published?: boolean;
};

export type Devlog = DevlogMeta & { content: string };

const devlogDir = path.join(process.cwd(), "posts/devlog");

export function getAllDevlogs(): Devlog[] {
  if (!fs.existsSync(devlogDir)) return [];

  const files = fs.readdirSync(devlogDir).filter((file) => file.endsWith(".md"));

  const posts = files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(devlogDir, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title ?? slug,
        description: data.description ?? "",
        date: data.date ?? "1970-01-01",
        thumbnail: data.thumbnail ?? "/devlog-placeholder.svg",
        tags: data.tags ?? [],
        views: data.views ?? 0,
        published: data.published !== false,
        content,
      } as Devlog;
    })
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

export function getDevlog(slug: string): Devlog | null {
  const fullPath = path.join(devlogDir, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "1970-01-01",
    thumbnail: data.thumbnail ?? "/devlog-placeholder.svg",
    tags: data.tags ?? [],
    views: data.views ?? 0,
    published: data.published !== false,
    content,
  };
}
