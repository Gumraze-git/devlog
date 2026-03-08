import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ExternalLink, Github } from "lucide-react";

import MarkdownRenderer from "../../components/MarkdownRenderer";
import ProjectTocLinks from "../../components/ProjectTocLinks";
import BackToPreviousLink from "./BackToPreviousLink";
import ProjectHeroCarousel from "./ProjectHeroCarousel";

import { buildCodeHtmlByKey } from "../../lib/codeHighlight";
import { createPageMetadata } from "../../lib/metadata";
import { extractHeadings, type HeadingItem } from "../../lib/markdown";
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

function getPrimaryNavItems(headings: HeadingItem[]): HeadingItem[] {
  if (headings.length === 0) return [];
  const minDepth = Math.min(...headings.map((heading) => heading.depth));
  return headings.filter((heading) => heading.depth === minDepth);
}

function getRailTocItems(headings: HeadingItem[]): HeadingItem[] {
  if (headings.length === 0) return [];
  const minDepth = Math.min(...headings.map((heading) => heading.depth));
  return headings.filter((heading) => heading.depth <= Math.min(minDepth + 1, 4));
}

function sourceIconFor(label: string, url: string) {
  const normalized = `${label} ${url}`.toLowerCase();
  return normalized.includes("github") ? Github : ExternalLink;
}

export default async function ProjectDetailPage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const project = getProject(resolved.slug);
  if (!project) return notFound();

  const headings = extractHeadings(project.content);
  const primaryNavItems = getPrimaryNavItems(headings);
  const railTocItems = getRailTocItems(headings);
  const codeHtmlByKey = await buildCodeHtmlByKey(project.content);
  const roleItems = project.roles && project.roles.length > 0 ? project.roles : project.role ? [project.role] : [];
  const sourceLinks = project.sources && project.sources.length > 0
    ? project.sources
    : project.repo
      ? [{ label: "GitHub", url: project.repo }]
      : project.demo
        ? [{ label: "Live Demo", url: project.demo }]
        : [];
  const heroImages = project.heroImages && project.heroImages.length > 0
    ? project.heroImages
    : project.thumbnail
      ? [{ src: project.thumbnail, alt: project.title }]
      : [];
  const heroFeatureCards: Array<{ title: string; description?: string }> = (project.featureCards && project.featureCards.length > 0
    ? project.featureCards
    : project.highlights.map((item) => ({ title: item }))).slice(0, 3);
  const railResults = (project.results && project.results.length > 0 ? project.results : project.highlights).slice(0, 4);
  const heroMeta = [project.projectType, project.category, project.status].filter(Boolean);

  const renderTechIcons = (techs: string[]) => {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-2.5 items-start">
        {techs.map((tech, index) => {
          const meta = getTechIconMeta(tech);
          if (meta?.icon) {
            return (
              <div key={index} className="flex min-w-14 flex-col items-center gap-1 group">
                <div className="relative h-8 w-8 md:h-9 md:w-9" title={meta.label}>
                  <Image
                    src={meta.icon}
                    alt={meta.label}
                    fill
                    className="object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                <span className="text-center text-[10px] font-medium uppercase leading-tight tracking-tight text-[var(--text-soft)]">
                  {meta.label}
                </span>
              </div>
            );
          }
          return (
            <div key={index} className="flex min-w-14 flex-col items-center gap-1">
              <div className="rounded-md border border-[var(--border)] bg-[var(--card-subtle)] px-2.5 py-1">
                <span className="whitespace-nowrap text-[11px] font-semibold text-[var(--text-muted)]">{tech}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-28">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <BackToPreviousLink
          fallbackHref="/projects"
          className="inline-flex items-center text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
        >
          ← Back
        </BackToPreviousLink>

        <section className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,420px)] xl:items-start">
          <div className="space-y-6">
            {heroMeta.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {heroMeta.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-soft)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="space-y-4">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tighter leading-[1.05] md:text-5xl xl:text-6xl">
                  {project.title}
                </h1>
                {project.projectTitle ? (
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)] md:text-base">
                    {project.projectTitle}
                  </p>
                ) : null}
              </div>

              <p className="max-w-3xl text-base font-medium leading-loose text-[var(--text-muted)] md:text-lg">
                {project.summary}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-4">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-soft)]">기간</h2>
                <p className="mt-2 text-sm font-semibold text-[var(--foreground)] md:text-base">{project.period || "진행중"}</p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-4">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-soft)]">팀 구성</h2>
                <p className="mt-2 text-sm font-semibold text-[var(--foreground)] md:text-base">{project.members || "개인 프로젝트"}</p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-4 sm:col-span-2 xl:col-span-1">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-soft)]">담당 역할</h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {roleItems.length > 0 ? roleItems.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/8 px-2.5 py-1 text-sm font-semibold text-[var(--accent-strong)]"
                    >
                      {role}
                    </span>
                  )) : (
                    <span className="text-sm text-[var(--text-muted)]">역할 정보 없음</span>
                  )}
                </div>
              </div>
            </div>

            {sourceLinks.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {sourceLinks.map((source) => {
                  const Icon = sourceIconFor(source.label, source.url);
                  return (
                    <a
                      key={`${source.label}-${source.url}`}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--accent)]/35 hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                    >
                      <Icon size={15} aria-hidden />
                      {source.label}
                    </a>
                  );
                })}
              </div>
            ) : null}

            {heroFeatureCards.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {heroFeatureCards.map((card) => (
                  <article key={`${card.title}-${card.description ?? ""}`} className="rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)]/70 p-4">
                    <h2 className="text-base font-semibold tracking-tight text-[var(--foreground)]">{card.title}</h2>
                    {card.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{card.description}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : null}
          </div>

          <div className="min-w-0 xl:pt-2">
            {heroImages.length > 0 ? (
              <ProjectHeroCarousel images={heroImages} projectTitle={project.title} />
            ) : null}
          </div>
        </section>

        {primaryNavItems.length > 0 ? (
          <div className="sticky top-14 z-20 -mx-1 rounded-2xl border border-[var(--border)] bg-[var(--background)]/88 px-3 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
            <ProjectTocLinks items={primaryNavItems} variant="horizontal" />
          </div>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] xl:gap-14">
          <aside className="order-first lg:order-none">
            <div className="space-y-5 lg:sticky lg:top-28">
              <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/90 p-5 shadow-sm shadow-black/5">
                <div className="space-y-5">
                  <div>
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-soft)]">Project Meta</h2>
                    <div className="mt-3 space-y-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-soft)]">유형</p>
                        <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                          {project.projectType || project.category || "Project"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-soft)]">기술 스택</p>
                        <div className="mt-3">{renderTechIcons(project.stack)}</div>
                      </div>
                      {sourceLinks.length > 0 ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-soft)]">링크</p>
                          <div className="mt-2 flex flex-col gap-2">
                            {sourceLinks.map((source) => {
                              const Icon = sourceIconFor(source.label, source.url);
                              return (
                                <a
                                  key={`rail-${source.label}-${source.url}`}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-subtle)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--accent)]/35 hover:text-[var(--accent-strong)]"
                                >
                                  <Icon size={14} aria-hidden />
                                  {source.label}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>

              {railResults.length > 0 ? (
                <section className="rounded-3xl border border-[var(--border)] bg-[var(--card-subtle)]/70 p-5">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-soft)]">Key Results</h2>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--text-muted)]">
                    {railResults.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {railTocItems.length > 0 ? (
                <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/90 p-5 shadow-sm shadow-black/5">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-soft)]">On this page</h2>
                  <div className="relative mt-4 pl-4 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-[var(--border)]">
                    <ProjectTocLinks items={railTocItems} className="space-y-1" />
                  </div>
                </section>
              ) : null}
            </div>
          </aside>

          <div className="min-w-0">
            <MarkdownRenderer
              content={project.content}
              codeHtmlByKey={codeHtmlByKey}
              className="project-md-readable max-w-4xl prose-p:leading-[1.72] prose-li:my-2 prose-li:leading-[1.65] prose-h2:scroll-mt-36 prose-h3:scroll-mt-36 prose-h4:scroll-mt-36"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
