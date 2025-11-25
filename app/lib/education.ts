import fs from "fs";
import path from "path";

import matter from "gray-matter";

export type EducationMeta = {
  slug: string;
  title: string;
  organization: string;
  period: string;
  details?: string[];
  published?: boolean;
};

export type Education = EducationMeta;

const educationDir = path.join(process.cwd(), "posts/education");

export function getAllEducations(): EducationMeta[] {
  if (!fs.existsSync(educationDir)) return [];

  const files = fs.readdirSync(educationDir).filter((file) => file.endsWith(".md"));

  const educations = files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(educationDir, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title ?? slug,
        organization: data.organization ?? "",
        period: data.period ?? "",
        details: data.details ?? [],
        published: data.published !== false,
      } as EducationMeta;
    })
    .filter((item) => item.published)
    .sort((a, b) => a.slug.localeCompare(b.slug));

  return educations;
}

export function getEducation(slug: string): Education | null {
  const fullPath = path.join(educationDir, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data } = matter(fileContents);

  return {
    slug,
    title: data.title ?? slug,
    organization: data.organization ?? "",
    period: data.period ?? "",
    details: data.details ?? [],
    published: data.published !== false,
  };
}
