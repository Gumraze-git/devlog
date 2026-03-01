import type { Metadata } from "next";
import { use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ExternalLink, Github } from "lucide-react";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import ProjectTocLinks from "../../components/ProjectTocLinks";
import BackToPreviousLink from "./BackToPreviousLink";

import { getProject } from "../../lib/projects";
import { createCodeKey, extractCodeBlocks, extractHeadings } from "../../lib/markdown";
import { getTechIconMeta } from "../../data/skills";
import { getSiteUrl } from "../../lib/site";
import { codeToHtml } from "shiki";

type Params = {
  slug: string;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

const codeHtmlCache = new Map<string, string>();
const shikiThemes = { light: "vitesse-light", dark: "vitesse-dark" } as const;
const troubleshootingLangs = new Set(["troubleshooting", "trouble", "troubleshoot"]);
const customRenderedLangs = new Set([
  "mermaid",
  "steps",
  "step",
  "reflections",
  "reflection",
  ...troubleshootingLangs,
]);

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
  try {
    return await codeToHtml(code, { lang, themes: shikiThemes });
  } catch {
    return await codeToHtml(code, { lang: "text", themes: shikiThemes });
  }
}

async function buildCodeHtmlByKey(content: string): Promise<Record<string, string>> {
  const blocks = extractCodeBlocks(content).flatMap((block) => {
    const normalizedLang = block.lang.trim().toLowerCase();

    if (troubleshootingLangs.has(normalizedLang)) {
      return extractBacktickCodeBlocks(block.code);
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

  const siteUrl = getSiteUrl();
  const canonicalPath = `/projects/${project.slug}`;

  return {
    title: project.title,
    description: project.summary,
    alternates: {
      canonical: canonicalPath,
    },
    keywords: project.stack,
    openGraph: {
      type: "article",
      url: `${siteUrl}${canonicalPath}`,
      title: project.title,
      description: project.summary,
      images: project.thumbnail ? [{ url: project.thumbnail, alt: project.title }] : undefined,
      publishedTime: project.date ? new Date(project.date).toISOString() : undefined,
    },
  };
}

export default function ProjectDetailPage({ params }: { params: Promise<Params> }) {
  const resolved = use(params);
  const project = getProject(resolved.slug);
  if (!project) return notFound();
  const headings = extractHeadings(project.content);
  const tocItems = headings.filter((heading) => heading.depth <= 3);
  const codeHtmlByKey = use(buildCodeHtmlByKey(project.content));
  const roleItems = (project.role ?? "")
    .split(/\s*,\s*|\s\/\s/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  const sourceLinks =
    project.sources && project.sources.length > 0
      ? project.sources
      : project.repo
        ? [{ label: "GitHub", url: project.repo }]
        : [];

  const renderTechIcons = (techs: string[]) => {
    return (
      <div className="flex flex-wrap gap-x-5 gap-y-3 items-start">
        {techs.map((tech, index) => {
          const meta = getTechIconMeta(tech);
          if (meta?.icon) {
            return (
              <div key={index} className="flex flex-col items-center gap-1.5 group min-w-14">
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
            <div key={index} className="flex flex-col items-center gap-1.5 min-w-14">
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
      <div className="max-w-4xl mx-auto w-full">
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

          {project.thumbnail && (
            <div className="w-full !mt-8">
              <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)] shadow-xl shadow-black/5">
                <Image
                  src={project.thumbnail}
                  alt={project.title}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          <div className="!mt-6 rounded-2xl border border-[var(--border-muted)] bg-[var(--card-subtle)]/40 p-5 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
              <div className="space-y-1.5">
                <h3 className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-widest">기간</h3>
                <p className="text-sm md:text-base font-mono text-[var(--text-soft)]">{project.period}</p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-widest">역할</h3>
                <ul className="space-y-1">
                  {(roleItems.length > 0 ? roleItems : ["Backend Developer"]).map((roleItem) => (
                    <li key={roleItem} className="flex items-start gap-2 text-sm md:text-base font-semibold text-[var(--accent-strong)] leading-relaxed">
                      <span className="mt-[0.6em] h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                      <span>{roleItem}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {sourceLinks.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-widest">소스</h3>
                  <div className="space-y-1.5">
                    {sourceLinks.map((source) => (
                      <a
                        key={`${source.label}-${source.url}`}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm md:text-base font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                        aria-label={source.label}
                      >
                        <Github size={16} aria-hidden />
                        {source.label}
                        <ExternalLink size={14} className="opacity-50" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="sm:col-span-2 lg:col-span-4 space-y-3 pt-1">
                <h3 className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-widest">기술 스택</h3>
                {renderTechIcons(project.stack)}
              </div>
            </div>
          </div>
        </section>

        <div className="relative">
          {/* Left column: Main content (Now single column) */}
          <div className="space-y-12">
            <MarkdownRenderer content={project.content} codeHtmlByKey={codeHtmlByKey} />
          </div>

          {/* Right floating TOC (Hover to show on Desktop) */}
          <aside className="md:hidden mt-12">
            {tocItems.length > 0 && (
              <details className="p-4 bg-[var(--card-subtle)] rounded-2xl border border-[var(--border)]">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">
                  Contents
                </summary>
                <nav aria-label="Table of contents" className="mt-4">
                  <ProjectTocLinks items={tocItems} className="space-y-2" />
                </nav>
              </details>
            )}
          </aside>

          {tocItems.length > 0 && (
            <aside className="hidden md:block fixed top-1/2 right-0 -translate-y-1/2 z-[100]">
              {/* The invisible trigger area to make hovering easier */}
              <div className="group flex items-center justify-end w-64 translate-x-[calc(100%-1.5rem)] hover:translate-x-0 transition-transform duration-500 ease-out">

                {/* Handle indicator */}
                <div className="flex items-center justify-center w-6 h-16 bg-[var(--card)] border border-r-0 border-[var(--border)] rounded-l-xl shadow-sm cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity">
                  <div className="w-1 h-6 bg-[var(--border)] rounded-full group-hover:bg-[var(--accent)] transition-colors" />
                </div>

                {/* TOC Panel */}
                <div className="w-[calc(100%-1.5rem)] bg-[var(--card)]/90 backdrop-blur-md border border-[var(--border)] shadow-2xl rounded-l-2xl p-6">
                  <nav aria-label="Table of contents" className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest pl-3 border-l-2 border-[var(--accent)]">Contents</h3>
                    <ProjectTocLinks items={tocItems} />
                  </nav>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
