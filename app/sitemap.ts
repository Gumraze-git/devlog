import type { MetadataRoute } from "next";
import { getAllDevlogs } from "./lib/devlog";
import { getAllProjects } from "./lib/projects";
import { getCanonicalUrl } from "./lib/site";

function toValidDate(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function getLatestDate(values: Array<Date | undefined>) {
  const timestamps = values
    .filter((value): value is Date => value instanceof Date)
    .map((value) => value.getTime());

  if (timestamps.length === 0) return undefined;
  return new Date(Math.max(...timestamps));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/projects",
    "/devlog",
  ];
  const projects = getAllProjects();
  const devlogs = getAllDevlogs();
  const latestContentDate = getLatestDate([
    ...projects.map((project) => toValidDate(project.date)),
    ...devlogs.map((post) => toValidDate(post.date)),
  ]);

  const staticEntries = staticRoutes.map((route) => ({
    url: getCanonicalUrl(route),
    lastModified: latestContentDate,
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : 0.8,
  }));

  const projectEntries = projects.map((project) => ({
    url: getCanonicalUrl(`/projects/${project.slug}`),
    lastModified: toValidDate(project.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const devlogEntries = devlogs.map((post) => ({
    url: getCanonicalUrl(`/devlog/${post.slug}`),
    lastModified: toValidDate(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...projectEntries,
    ...devlogEntries,
  ];
}
