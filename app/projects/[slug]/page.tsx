import type { Metadata } from "next";
import { use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import MarkdownRenderer from "../../components/MarkdownRenderer";

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

async function highlightCode(code: string, lang: string) {
  try {
    return await codeToHtml(code, { lang, themes: shikiThemes });
  } catch {
    return await codeToHtml(code, { lang: "text", themes: shikiThemes });
  }
}

async function buildCodeHtmlByKey(content: string): Promise<Record<string, string>> {
  const blocks = extractCodeBlocks(content).filter((block) => block.lang !== "mermaid");
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

  const renderTechIcons = (techs: string[]) => {
    return (
      <div className="flex flex-wrap gap-8 mt-4 items-center">
        {techs.map((tech, index) => {
          const meta = getTechIconMeta(tech);
          if (meta?.icon) {
            return (
              <div key={index} className="flex flex-col items-center gap-2 group">
                <div className="relative w-10 h-10" title={meta.label}>
                  <Image
                    src={meta.icon}
                    alt={meta.label}
                    fill
                    className="object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                <span className="text-[10px] font-medium text-[var(--text-soft)] uppercase tracking-tighter">
                  {meta.label}
                </span>
              </div>
            );
          }
          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="bg-[var(--card-subtle)] border border-[var(--border)] px-3 py-1.5 rounded-md">
                <span className="text-xs font-semibold text-[var(--text-muted)]">{tech}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-28">
      <div className="grid md:grid-cols-[minmax(0,1fr)_260px] gap-10 lg:gap-14">
        {/* Left column: Full page content */}
        <div className="space-y-12 order-2 md:order-1">
          {/* Navigation & Header Section */}
          <section className="space-y-5">
            <Link
              href="/about"
              className="inline-flex items-center text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors uppercase tracking-widest"
            >
              ← Back to About Me
            </Link>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-[1.1]">
                {project.title}
              </h1>
              <p className="text-lg md:text-xl text-[var(--text-muted)] font-medium leading-relaxed max-w-3xl">
                {project.summary}
              </p>
            </div>
          </section>

          {/* Project Thumbnail / Wide Banner Style */}
          {project.thumbnail && (
            <div className="w-full">
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

          {/* Highlights Section */}
          {project.highlights && project.highlights.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight uppercase border-b border-[var(--border)] pb-4">Highlights</h2>
              <ul className="text-base text-[var(--text-muted)] space-y-4 pl-1">
                {project.highlights.map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="text-[var(--accent)] font-bold md:mt-0.5">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Project Detailed Description - Separate Section */}
          <section className="space-y-6 pt-12 border-t border-[var(--border)]">
            <h2 className="text-2xl font-bold tracking-tight uppercase border-b border-[var(--border)] pb-4">Details</h2>
            <MarkdownRenderer content={project.content} codeHtmlByKey={codeHtmlByKey} />
          </section>
        </div>

        {/* Right column: Metadata summaries + TOC */}
        <aside className="space-y-8 order-1 md:order-2 md:sticky md:top-24 self-start">
          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest border-b border-[var(--border)] pb-2 mb-4">Period</h3>
              <p className="text-base font-mono text-[var(--text-soft)]">{project.period}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest border-b border-[var(--border)] pb-2 mb-4">Role</h3>
              <p className="text-sm font-semibold text-[var(--accent-strong)] whitespace-pre-line leading-relaxed">
                {project.role || "Backend Developer"}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest border-b border-[var(--border)] pb-2 mb-4">Team</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {project.members}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest border-b border-[var(--border)] pb-2 mb-4">Tech Stack</h3>
              {renderTechIcons(project.stack)}
            </div>

            {project.repo && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest border-b border-[var(--border)] pb-2 mb-4">Source</h3>
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[var(--accent)] hover:underline flex items-center gap-1.5"
                >
                  View on GitHub
                </a>
              </div>
            )}
          </div>

          {tocItems.length > 0 && (
            <>
              <div className="md:hidden">
                <details className="rounded-xl border border-[var(--border)] bg-[var(--card-subtle)] p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">
                    Contents
                  </summary>
                  <nav aria-label="Table of contents" className="mt-4 space-y-2">
                    {tocItems.map((item) => (
                      <a
                        key={item.slug}
                        href={`#${item.slug}`}
                        className={`block text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors ${
                          item.depth === 3 ? "pl-4" : ""
                        }`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </details>
              </div>

              <nav aria-label="Table of contents" className="hidden md:block space-y-3">
                <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest border-b border-[var(--border)] pb-2">Contents</h3>
                <div className="space-y-1.5">
                  {tocItems.map((item) => (
                    <a
                      key={item.slug}
                      href={`#${item.slug}`}
                      className={`block text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors ${
                        item.depth === 3 ? "pl-4" : ""
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </div>
              </nav>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
