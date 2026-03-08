import fs from "fs";
import path from "path";

import matter from "gray-matter";

export type ProjectSource = {
  label: string;
  url: string;
};

export type ProjectHeroImage = {
  src: string;
  caption?: string;
  alt?: string;
};

export type ProjectFeatureCard = {
  title: string;
  description?: string;
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
  roles?: string[];
  category?: string;
  projectType?: string;
  status?: string;
  demo?: string;
  repo?: string;
  sources?: ProjectSource[];
  heroImages?: ProjectHeroImage[];
  thumbnail?: string;
  featureCards?: ProjectFeatureCard[];
  results?: string[];
  published?: boolean;
  aboutDescription?: string;
  aboutTasks?: string[];
  aboutOrganization?: string;
};

export type Project = ProjectMeta & { content: string };
export type AboutProject = {
  slug: string;
  title: string;
  period: string;
  organization: string;
  description: string;
  tasks: string[];
  stack: string[];
};

const projectsDir = path.join(process.cwd(), "posts/projects");

function normalizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizeRoleList(rawRoles: unknown, roleFallback?: string): string[] {
  const fromArray = normalizeStringArray(rawRoles);
  if (fromArray.length > 0) {
    return Array.from(new Set(fromArray));
  }

  if (!roleFallback) return [];

  return Array.from(
    new Set(
      roleFallback
        .split(/\s*,\s*|\s+\/\s+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function normalizeSources(rawSources: unknown, repoFallback?: string, demoFallback?: string): ProjectSource[] {
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

  const fallbacks: ProjectSource[] = [];
  if (repoFallback) {
    fallbacks.push({ label: "GitHub", url: repoFallback });
  }
  if (demoFallback) {
    fallbacks.push({ label: "Live Demo", url: demoFallback });
  }

  const combined = [...parsed, ...fallbacks];
  const seen = new Set<string>();

  return combined.filter((source) => {
    if (seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}

function normalizeHeroImages(rawHeroImages: unknown): ProjectHeroImage[] {
  if (!Array.isArray(rawHeroImages)) return [];

  const parsed = rawHeroImages
    .map((item) => {
      if (typeof item === "string") {
        const src = item.trim();
        if (!src) return null;
        return { src };
      }

      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const src = typeof record.src === "string" ? record.src.trim() : "";
        if (!src) return null;

        const caption = typeof record.caption === "string" ? record.caption.trim() : "";
        const alt = typeof record.alt === "string" ? record.alt.trim() : "";

        return {
          src,
          ...(caption ? { caption } : {}),
          ...(alt ? { alt } : {}),
        };
      }

      return null;
    })
    .filter((value): value is ProjectHeroImage => value !== null);

  const uniqueImages: ProjectHeroImage[] = [];
  const seen = new Set<string>();

  parsed.forEach((image) => {
    if (seen.has(image.src)) return;
    seen.add(image.src);
    uniqueImages.push(image);
  });

  return uniqueImages;
}

function normalizeFeatureCards(rawFeatureCards: unknown, fallbackHighlights: string[]): ProjectFeatureCard[] {
  const parsed = Array.isArray(rawFeatureCards)
    ? rawFeatureCards
      .map((item) => {
        if (typeof item === "string") {
          const title = item.trim();
          if (!title) return null;
          return { title };
        }

        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const title = typeof record.title === "string" ? record.title.trim() : "";
          const description = typeof record.description === "string" ? record.description.trim() : "";
          if (!title && !description) return null;
          return {
            title: title || description,
            ...(title && description ? { description } : {}),
          };
        }

        return null;
      })
      .filter((value): value is ProjectFeatureCard => value !== null)
    : [];

  if (parsed.length > 0) return parsed;

  return fallbackHighlights.map((item) => ({ title: item }));
}

function normalizeEducation(rawEducation: unknown): string[] {
  if (Array.isArray(rawEducation)) {
    return rawEducation
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof rawEducation === "string") {
    const trimmed = rawEducation.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
}

function parseProjectFile(slug: string, fileContents: string): Project {
  const { data, content } = matter(fileContents);
  const repoRaw = data.repo ?? data.github_link ?? data.githubLink;
  const repo = typeof repoRaw === "string" ? repoRaw.trim() || undefined : undefined;
  const demoRaw = data.demo;
  const demo = typeof demoRaw === "string" ? demoRaw.trim() || undefined : undefined;
  const sources = normalizeSources(data.sources, repo, demo);
  const heroImages = normalizeHeroImages(data.hero_images ?? data.heroImages);
  const highlights = normalizeStringArray(data.highlights);
  const results = normalizeStringArray(data.results);
  const aboutDescriptionRaw = data.about_description ?? data.aboutDescription;
  const aboutOrganizationRaw = data.about_organization ?? data.aboutOrganization;
  const aboutTasksRaw = data.about_tasks ?? data.aboutTasks;
  const role = typeof data.role === "string" ? data.role.trim() : "";

  return {
    slug,
    title: typeof data.title === "string" ? data.title.trim() || slug : slug,
    projectTitle: typeof data.project_title === "string"
      ? data.project_title.trim()
      : typeof data.projectTitle === "string"
        ? data.projectTitle.trim()
        : "",
    summary: typeof data.summary === "string" ? data.summary.trim() : "",
    period: typeof data.period === "string" ? data.period.trim() : "",
    members: typeof data.members === "string" ? data.members.trim() : "",
    stack: normalizeStringArray(data.stack),
    highlights,
    featureCards: normalizeFeatureCards(data.feature_cards ?? data.featureCards, highlights),
    results: results.length > 0 ? results : highlights,
    education: normalizeEducation(data.education),
    date: typeof data.date === "string" ? data.date.trim() : "",
    role,
    roles: normalizeRoleList(data.roles, role),
    category: typeof data.category === "string" ? data.category.trim() || undefined : undefined,
    projectType: typeof (data.project_type ?? data.projectType) === "string"
      ? String(data.project_type ?? data.projectType).trim() || undefined
      : undefined,
    status: typeof data.status === "string" ? data.status.trim() || undefined : undefined,
    demo,
    repo,
    sources,
    heroImages,
    thumbnail: typeof data.thumbnail === "string"
      ? data.thumbnail.trim() || heroImages[0]?.src || "/devlog-placeholder.svg"
      : heroImages[0]?.src || "/devlog-placeholder.svg",
    published: data.published !== false,
    aboutDescription: typeof aboutDescriptionRaw === "string" ? aboutDescriptionRaw.trim() : undefined,
    aboutTasks: Array.isArray(aboutTasksRaw) ? normalizeStringArray(aboutTasksRaw) : undefined,
    aboutOrganization: typeof aboutOrganizationRaw === "string" ? aboutOrganizationRaw.trim() : undefined,
    content,
  };
}

export function getAllProjects(): Project[] {
  if (!fs.existsSync(projectsDir)) return [];

  const files = fs.readdirSync(projectsDir).filter((file) => file.endsWith(".md"));

  const projects = files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(projectsDir, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      return parseProjectFile(slug, fileContents);
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
  return parseProjectFile(slug, fileContents);
}

export function getAboutProjects(): AboutProject[] {
  return getAllProjects().map((project) => ({
    slug: project.slug,
    title: project.title,
    period: project.period,
    organization: project.aboutOrganization !== undefined
      ? project.aboutOrganization
      : project.education?.[0] ?? "",
    description: project.aboutDescription !== undefined
      ? project.aboutDescription
      : project.summary,
    tasks: project.aboutTasks !== undefined
      ? project.aboutTasks
      : project.highlights,
    stack: project.stack,
  }));
}
