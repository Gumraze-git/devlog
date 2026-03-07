import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ExternalLink, Github } from "lucide-react";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import ProjectTocLinks from "../../components/ProjectTocLinks";
import BackToPreviousLink from "./BackToPreviousLink";
import ProjectHeroCarousel from "./ProjectHeroCarousel";

import { createPageMetadata } from "../../lib/metadata";
import { getAllProjects, getProject } from "../../lib/projects";
import { createCodeKey, extractCodeBlocks, extractHeadings } from "../../lib/markdown";
import { getTechIconMeta } from "../../data/skills";
import { bundledLanguages, codeToHtml } from "shiki";

type Params = {
  slug: string;
};

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getAllProjects().map((project) => ({
    slug: project.slug,
  }));
}

const codeHtmlCache = new Map<string, string>();
const shikiThemes = { light: "github-dark-high-contrast", dark: "github-dark-high-contrast" } as const;
const shikiFallbackLang = "md";
const shikiBundledLangSet = new Set<string>(Object.keys(bundledLanguages));
const troubleshootingLangs = new Set(["troubleshooting", "trouble", "troubleshoot"]);
const customRenderedLangs = new Set([
  "mermaid",
  "chips",
  "chip",
  "steps",
  "step",
  "reflections",
  "reflection",
  ...troubleshootingLangs,
]);

function resolveShikiLang(lang: string): string {
  const normalized = lang.trim().toLowerCase();
  if (!normalized) return shikiFallbackLang;

  const alias =
    normalized === "text" ||
    normalized === "txt" ||
    normalized === "plain" ||
    normalized === "plaintext"
      ? shikiFallbackLang
      : normalized;

  return shikiBundledLangSet.has(alias) ? alias : shikiFallbackLang;
}

function extractBacktickCodeBlocks(source: string): Array<{ lang: string; code: string }> {
  const blocks: Array<{ lang: string; code: string }> = [];
  const lines = source.split("\n");
  let inFence = false;
  let lang = "text";
  let buffer: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const fenceMatch = /^```(.*)$/.exec(trimmed);

    if (!inFence) {
      if (!fenceMatch) continue;
      inFence = true;
      const info = fenceMatch[1].trim();
      const token = info.split(/\s+/)[0] ?? "";
      lang = token.replace(/^language-/, "") || "text";
      buffer = [];
      continue;
    }

    if (fenceMatch) {
      blocks.push({ lang, code: buffer.join("\n").replace(/\n$/, "") });
      inFence = false;
      lang = "text";
      buffer = [];
      continue;
    }

    buffer.push(line);
  }

  return blocks;
}

async function highlightCode(code: string, lang: string) {
  const safeLang = resolveShikiLang(lang);
  try {
    return await codeToHtml(code, { lang: safeLang, themes: shikiThemes });
  } catch {
    return await codeToHtml(code, { lang: shikiFallbackLang, themes: shikiThemes });
  }
}

async function buildCodeHtmlByKey(content: string): Promise<Record<string, string>> {
  const blocks = extractCodeBlocks(content).flatMap((block) => {
    const normalizedLang = block.lang.trim().toLowerCase();

    if (troubleshootingLangs.has(normalizedLang)) {
      return extractBacktickCodeBlocks(block.code).filter((innerBlock) => {
        const innerLang = innerBlock.lang.trim().toLowerCase();
        return !customRenderedLangs.has(innerLang);
      });
    }

    if (customRenderedLangs.has(normalizedLang)) {
      return [];
    }

    return [block];
  });

  if (blocks.length === 0) return {};

  const entries = await Promise.all(
    blocks.map(async (block) => {
      const lang = block.lang && block.lang.trim().length > 0 ? block.lang : "text";
      const key = createCodeKey(lang, block.code);
      const cached = codeHtmlCache.get(key);
      if (cached) return [key, cached] as const;
      const html = await highlightCode(block.code, lang);
      codeHtmlCache.set(key, html);
      return [key, html] as const;
    })
  );

  return Object.fromEntries(entries);
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
  const headings = extractHeadings(project.content);
  const tocItems = headings.filter((heading) => heading.depth >= 2 && heading.depth <= 3);
  const codeHtmlByKey = await buildCodeHtmlByKey(project.content);
  const allowedRoleItems = ["백엔드 개발", "데이터 모델링"] as const;
  const roleItems = (project.role ?? "")
    .split(/\s*,\s*|\s\/\s/g)
    .map((item) => item.trim())
    .filter((item): item is (typeof allowedRoleItems)[number] =>
      (allowedRoleItems as readonly string[]).includes(item)
    );
  const displayedRoleItems = roleItems.length > 0 ? roleItems : [...allowedRoleItems];
  const sourceLinks =
    project.sources && project.sources.length > 0
      ? project.sources
      : project.repo
        ? [{ label: "GitHub", url: project.repo }]
        : [];
  const hasSourceLinks = sourceLinks.length > 0;
  const overviewGridColsClass = hasSourceLinks ? "lg:grid-cols-3" : "lg:grid-cols-2";
  const stackSectionSpanClass = hasSourceLinks ? "sm:col-span-2 lg:col-span-3" : "sm:col-span-2 lg:col-span-2";
  const detailContainerClass = tocItems.length > 0 ? "max-w-4xl lg:max-w-6xl" : "max-w-4xl";
  const heroImages =
    project.heroImages && project.heroImages.length > 0
      ? project.heroImages
      : project.thumbnail
        ? [{ src: project.thumbnail, alt: project.title }]
        : [];

  const renderTechIcons = (techs: string[]) => {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-2.5 items-start">
        {techs.map((tech, index) => {
          const meta = getTechIconMeta(tech);
          if (meta?.icon) {
            return (
              <div key={index} className="flex flex-col items-center gap-1 group min-w-14">
                <div className="relative w-8 h-8 md:w-9 md:h-9" title={meta.label}>
                  <Image
                    src={meta.icon}
                    alt={meta.label}
                    fill
                    className="object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                <span className="text-[10px] font-medium text-[var(--text-soft)] uppercase tracking-tight text-center leading-tight">
                  {meta.label}
                </span>
              </div>
            );
          }
          return (
            <div key={index} className="flex flex-col items-center gap-1 min-w-14">
              <div className="bg-[var(--card-subtle)] border border-[var(--border)] px-2.5 py-1 rounded-md">
                <span className="text-[11px] font-semibold text-[var(--text-muted)] whitespace-nowrap">{tech}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-28">
      <div className={`${detailContainerClass} mx-auto w-full`}>
        <section className="space-y-6 mb-12">
          <BackToPreviousLink
            fallbackHref="/projects"
            className="inline-flex items-center text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors uppercase tracking-widest"
          >
            ← Back
          </BackToPreviousLink>

          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-[1.1]">
              {project.title}
            </h1>
            {project.projectTitle && (
              <p className="mt-4 text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">
                {project.projectTitle}
              </p>
            )}
            <p
              className={`text-base md:text-lg text-[var(--text-muted)] font-medium leading-loose max-w-4xl ${project.projectTitle ? "mt-3" : "mt-4"
                }`}
            >
              {project.summary}
            </p>
          </div>

          {heroImages.length > 0 && (
            <ProjectHeroCarousel images={heroImages} projectTitle={project.title} />
          )}

          <div className="!mt-4 rounded-2xl border border-[var(--border-muted)] bg-[var(--card-subtle)]/40 p-3 md:p-4">
            <div className="mb-3 border-b border-[var(--border-muted)] pb-2">
              <h2 className="text-base md:text-lg font-bold text-[var(--foreground)] tracking-tight">프로젝트 개요</h2>
            </div>

            <div className={`grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2 ${overviewGridColsClass}`}>
              <div className="space-y-1 rounded-xl border border-[var(--border)] bg-[var(--card)]/80 p-3">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-soft)]">기간</h3>
                <p className="text-sm md:text-base font-semibold font-mono text-[var(--foreground)]">{project.period}</p>
              </div>

              <div className="space-y-1 rounded-xl border border-[var(--border)] bg-[var(--card)]/80 p-3">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-soft)]">역할</h3>
                <div className="flex flex-wrap gap-1">
                  {displayedRoleItems.map((roleItem) => (
                    <span
                      key={roleItem}
                      className="inline-flex items-center rounded-full border border-[var(--accent)]/35 bg-[var(--accent)]/10 px-2 py-0.5 text-sm md:text-base font-semibold text-[var(--accent-strong)]"
                    >
                      {roleItem}
                    </span>
                  ))}
                </div>
              </div>

              {hasSourceLinks && (
                <div className="space-y-1 rounded-xl border border-[var(--border-muted)] bg-[var(--card-subtle)]/70 p-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-soft)]">소스</h3>
                  <div className="space-y-1">
                    {sourceLinks.map((source) => (
                      <a
                        key={`${source.label}-${source.url}`}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-sm md:text-base font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--accent)]/45 hover:bg-[var(--card-subtle)] hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                        aria-label={source.label}
                      >
                        <Github size={14} aria-hidden />
                        {source.label}
                        <ExternalLink size={12} className="opacity-50" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className={`${stackSectionSpanClass} space-y-1 rounded-xl border border-[var(--border)] bg-[var(--card)]/80 p-3`}>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-soft)]">기술 스택</h3>
                {renderTechIcons(project.stack)}
              </div>
            </div>
          </div>
        </section>

        <div className={tocItems.length > 0 ? "relative lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-10" : "relative"}>
          <div className="space-y-12">
            <MarkdownRenderer
              content={project.content}
              codeHtmlByKey={codeHtmlByKey}
              className="project-md-readable max-w-3xl prose-p:leading-[1.72] prose-li:leading-[1.65] prose-li:my-2"
            />
          </div>

          {tocItems.length > 0 && (
            <aside className="hidden lg:block">
              <nav
                aria-label="Table of contents"
                className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar"
              >
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">On this page</h3>
                <div className="relative mt-3 pl-4 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-[var(--border)]">
                  <ProjectTocLinks items={tocItems} />
                </div>
              </nav>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
