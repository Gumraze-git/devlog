import type { Project, ProjectHeroImage, ProjectSource } from "../../lib/projects";

export type ProjectSourceLink = Pick<ProjectSource, "label" | "url">;

export function getProjectRoleItems(project: Pick<Project, "roles" | "role">): string[] {
  if (project.roles && project.roles.length > 0) return project.roles;
  return project.role ? [project.role] : [];
}

export function getProjectSourceLinks(
  project: Pick<Project, "sources" | "repo" | "demo">,
): ProjectSourceLink[] {
  if (project.sources && project.sources.length > 0) {
    return project.sources;
  }

  return [
    project.repo ? { label: "GitHub", url: project.repo } : null,
    project.demo ? { label: "Live Demo", url: project.demo } : null,
  ].filter((source): source is ProjectSourceLink => source !== null);
}

export function getProjectHeroImages(
  project: Pick<Project, "heroImages" | "thumbnail" | "title">,
): ProjectHeroImage[] {
  if (project.heroImages && project.heroImages.length > 0) {
    return project.heroImages;
  }

  return project.thumbnail ? [{ src: project.thumbnail, alt: project.title }] : [];
}

export function hasProjectSourceLinks(sourceLinks: ProjectSourceLink[]): boolean {
  return sourceLinks.length > 0;
}
