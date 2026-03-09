import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ExternalLink, Github } from "lucide-react";

import MarkdownRenderer from "../../components/MarkdownRenderer";
import BackToPreviousLink from "./BackToPreviousLink";
import ProjectHeroCarousel from "./ProjectHeroCarousel";
import ProjectSectionTabs from "./ProjectSectionTabs";

import { buildCodeHtmlByKey } from "../../lib/codeHighlight";
import { createPageMetadata } from "../../lib/metadata";
import { splitMarkdownIntoSections } from "../../lib/markdown";
import { getAllProjects, getProject } from "../../lib/projects";
import { getTechIconMeta } from "../../data/skills";

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

function sourceIconFor(label: string, url: string) {
  const normalized = `${label} ${url}`.toLowerCase();
  return normalized.includes("github") ? Github : ExternalLink;
}

export default async function ProjectDetailPage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const project = getProject(resolved.slug);
  if (!project) return notFound();

  const sections = splitMarkdownIntoSections(project.content);
  const hasTabbedSections = sections.length >= 2;
  const codeHtmlByKey = await buildCodeHtmlByKey(project.content);
  const roleItems = project.roles && project.roles.length > 0 ? project.roles : project.role ? [project.role] : [];
  const sourceLinks = project.sources && project.sources.length > 0
    ? project.sources
    : [
        project.repo ? { label: "GitHub", url: project.repo } : null,
        project.demo ? { label: "Live Demo", url: project.demo } : null,
      ].filter((source): source is { label: string; url: string } => source !== null);
  const heroImages = project.heroImages && project.heroImages.length > 0
    ? project.heroImages
    : project.thumbnail
      ? [{ src: project.thumbnail, alt: project.title }]
      : [];
  const hasSourceLinks = sourceLinks.length > 0;

  const renderTechIcons = (techs: string[]) => {
    return (
      <div className="flex flex-wrap gap-x-3 gap-y-2.5 items-center">
        {techs.map((tech, index) => {
          const meta = getTechIconMeta(tech);
          if (meta?.icon) {
            return (
              <div key={index} className="flex flex-col items-center gap-1.5 group">
                <div className="relative h-10 w-10 md:h-11 md:w-11 p-1" title={meta.label}>
                  <Image
                    src={meta.icon}
                    alt={meta.label}
                    fill
                    className="object-contain p-1 opacity-90 transition-opacity"
                  />
                </div>
                <span className="text-center text-[10px] sm:text-[11px] font-semibold tracking-tight text-[var(--text-muted)] transition-colors">
                  {meta.label}
                </span>
              </div>
            );
          }
          return (
            <div key={index} className="flex items-center">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card-subtle)]/40 px-3 py-1.5 shadow-sm">
                <span className="whitespace-nowrap text-[11px] sm:text-xs font-bold tracking-wide text-[var(--text-muted)]">{tech}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-28">
      <div className="mx-auto w-full max-w-6xl">
        <section className="mb-2 space-y-8 md:space-y-10 relative">
          <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-[var(--accent)]/10 blur-[100px] rounded-full opacity-60 pointer-events-none" />
          <div className="absolute top-40 left-0 -z-10 w-72 h-72 bg-purple-500/10 blur-[80px] rounded-full opacity-50 pointer-events-none" />

          <BackToPreviousLink
            fallbackHref="/projects"
            className="group inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <span aria-hidden="true" className="text-base leading-none transition-transform group-hover:-translate-x-1">←</span>
            <span className="border-b border-transparent group-hover:border-[var(--foreground)] transition-colors pb-0.5">Back to Projects</span>
          </BackToPreviousLink>

          <div className="relative z-10 pt-2 text-pretty">
             <div className="space-y-5 mb-5">
               <div className="space-y-3">
                 <h1 className="text-4xl font-extrabold tracking-tight leading-[1.1] md:text-5xl xl:text-[4rem] bg-gradient-to-br from-[var(--foreground)] via-[var(--foreground)] to-[var(--text-muted)] dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent drop-shadow-sm">
                   {project.title}
                 </h1>
                 {project.projectTitle ? (
                   <p className="text-base font-bold uppercase tracking-[0.25em] text-[var(--accent)] md:text-lg">
                     {project.projectTitle}
                   </p>
                 ) : null}
               </div>

               <p className="max-w-4xl text-base font-medium leading-[1.6] text-[var(--text-muted)] md:text-lg">
                 {project.summary}
               </p>
             </div>

             {heroImages.length > 0 ? (
               <div className="w-full relative group mt-6 xl:mt-8">
                  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[var(--accent)]/10 to-purple-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className="relative z-10 overflow-hidden rounded-3xl shadow-2xl shadow-[var(--shadow)] ring-1 ring-[var(--border)]/50 bg-[var(--card)] w-full">
                    <ProjectHeroCarousel images={heroImages} projectTitle={project.title} />
                  </div>
               </div>
             ) : (
               <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card-subtle)]/50 p-8 text-center text-sm font-medium text-[var(--text-soft)] backdrop-blur-sm max-w-4xl">
                 대표 이미지가 없습니다.
               </div>
             )}
          </div>

          <div className="!mt-7 space-y-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <div className="flex items-center gap-3">
                <h3 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.15em] text-[var(--text-soft)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] opacity-70"></span>
                  기간
                </h3>
                <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 shadow-sm">
                  <p className="font-mono text-[13px] font-bold text-[var(--foreground)] tracking-tight">{project.period}</p>
                </div>
              </div>

              {roleItems.length > 0 && (
                <div className="flex items-center gap-3">
                  <h3 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.15em] text-[var(--text-soft)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 opacity-70"></span>
                    역할
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {roleItems.map((roleItem) => (
                      <span
                        key={roleItem}
                        className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[13px] font-bold text-[var(--foreground)] shadow-sm"
                      >
                        {roleItem}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hasSourceLinks && (
                <div className="flex items-center gap-3">
                  <h3 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.15em] text-[var(--text-soft)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-70"></span>
                    소스
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {sourceLinks.map((source) => {
                      const Icon = sourceIconFor(source.label, source.url);
                      return (
                        <a
                           key={`${source.label}-${source.url}`}
                           href={source.url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[13px] font-bold text-[var(--foreground)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50"
                           aria-label={source.label}
                        >
                           <Icon size={15} aria-hidden className="opacity-90" />
                           {source.label}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-0">
              <h3 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.15em] text-[var(--text-soft)] mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 opacity-70"></span>
                기술 스택
              </h3>
              {renderTechIcons(project.stack)}
            </div>
          </div>
        </section>
      </div>

      <section className="space-y-8 w-full">
        {hasTabbedSections ? (
          <ProjectSectionTabs sections={sections} codeHtmlByKey={codeHtmlByKey} />
        ) : (
          <div className="mx-auto w-full max-w-6xl">
            <MarkdownRenderer
              content={project.content}
              codeHtmlByKey={codeHtmlByKey}
              className="project-md-readable max-w-4xl prose-p:leading-[1.72] prose-li:my-2 prose-li:leading-[1.65]"
            />
          </div>
        )}
      </section>
    </div>
  );
}
