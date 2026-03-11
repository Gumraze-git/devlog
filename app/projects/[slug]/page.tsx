import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildCodeHtmlByKey } from "../../lib/codeHighlight";
import { createPageMetadata } from "../../lib/metadata";
import { splitMarkdownIntoSections } from "../../lib/markdown";
import { getAllProjects, getProject } from "../../lib/projects";
import ProjectDetailBody from "./ProjectDetailBody";
import ProjectDetailOverview from "./ProjectDetailOverview";

import {
  getProjectHeroImages,
  getProjectRoleItems,
  getProjectSourceLinks,
  hasProjectSourceLinks,
} from "./projectDetail.helpers";

type Params = {
  slug: string;
};

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getAllProjects().map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const resolved = await params;
  const project = getProject(resolved.slug);
  if (!project) {
    return {
      title: "Projects",
    };
  }

  const openGraphImage = project.heroImages?.[0]?.src ?? project.thumbnail;
  const publishedTime = project.date ? new Date(project.date).toISOString() : undefined;

  return createPageMetadata({
    title: project.title,
    description: project.summary,
    path: `/projects/${project.slug}`,
    keywords: project.stack,
    type: "article",
    images: openGraphImage ? [{ url: openGraphImage, alt: project.title }] : undefined,
    publishedTime,
  });
}

export default async function ProjectDetailPage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const project = getProject(resolved.slug);
  if (!project) return notFound();

  const sections = splitMarkdownIntoSections(project.content);
  const codeHtmlByKey = await buildCodeHtmlByKey(project.content);
  const roleItems = getProjectRoleItems(project);
  const sourceLinks = getProjectSourceLinks(project);
  const heroImages = getProjectHeroImages(project);
  const hasSourceLinks = hasProjectSourceLinks(sourceLinks);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-28">
      <ProjectDetailOverview
        project={project}
        heroImages={heroImages}
        roleItems={roleItems}
        sourceLinks={sourceLinks}
        hasSourceLinks={hasSourceLinks}
      />
      <ProjectDetailBody sections={sections} codeHtmlByKey={codeHtmlByKey} content={project.content} />
    </div>
  );
}
