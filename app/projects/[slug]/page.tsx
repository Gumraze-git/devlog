import { use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

import { getProject } from "../../lib/projects";
import { getTechIconMeta } from "../../data/skills";

type Params = {
  slug: string;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default function ProjectDetailPage({ params }: { params: Promise<Params> }) {
  const resolved = use(params);
  const project = getProject(resolved.slug);
  if (!project) return notFound();

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
    <div className="w-full space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      {/* Navigation & Header Section */}
      <section className="space-y-8">
        <Link
          href="/about"
          className="inline-flex items-center text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors uppercase tracking-widest"
        >
          ← Back to About Me
        </Link>

        <div className="space-y-6">
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
        <div className="max-w-5xl mx-auto w-full px-4 md:px-0">
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

      {/* Main Content Layout */}
      <div className="grid md:grid-cols-[1fr_250px] gap-12 lg:gap-20">

        {/* Left column: Main body mirroring About page section structure */}
        <div className="space-y-16 order-1">
          {/* Highlights Section */}
          {project.highlights && project.highlights.length > 0 && (
            <section className="space-y-6">
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

          {/* Tech Stack Section with Icons like About Me */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight uppercase border-b border-[var(--border)] pb-4">Tech Stack</h2>
            {renderTechIcons(project.stack)}
          </section>

        </div>

        {/* Right column: Metadata summaries */}
        <aside className="space-y-10 order-2 pt-2">
          <div className="space-y-6">
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
        </aside>
      </div>

      {/* Project Detailed Description - Separate Section */}
      <section className="space-y-8 pt-16 border-t border-[var(--border)]">
        <h2 className="text-2xl font-bold tracking-tight uppercase border-b border-[var(--border)] pb-4">Details</h2>
        <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:tracking-tighter prose-headings:font-bold prose-p:leading-relaxed prose-li:leading-relaxed text-[var(--text-muted)]">
          <ReactMarkdown>{project.content}</ReactMarkdown>
        </div>
      </section>
    </div>
  );
}
