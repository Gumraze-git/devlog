import type { MetadataRoute } from "next";
import { getAllDevlogs } from "./lib/devlog";
import { getAllProjects } from "./lib/projects";
import { getSiteUrl } from "./lib/site";

function toValidDate(value?: string) {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  const staticRoutes = [
    "",
    "/about",
    "/projects",
    "/devlog",
  ];

  const staticEntries = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  const projectEntries = getAllProjects().map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: toValidDate(project.date),
  }));

  const devlogEntries = getAllDevlogs().map((post) => ({
    url: `${siteUrl}/devlog/${post.slug}`,
    lastModified: toValidDate(post.date),
  }));

  return [
    ...staticEntries,
    ...projectEntries,
    ...devlogEntries,
  ];
}
