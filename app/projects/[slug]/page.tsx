import { use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-500 pb-20">
      <Link
        href="/projects"
        className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
      >
        ← Back to Projects
      </Link>

      <article className="space-y-10">
        <header className="space-y-6 border-b border-[var(--border)] pb-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{project.title}</h1>
            <div className="flex flex-wrap gap-3 text-sm font-mono text-[var(--text-soft)] uppercase tracking-wider">
              <span>{project.period}</span>
              {project.repo && (
                <>
                  <span>•</span>
                  <a href={project.repo} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-strong)] hover:underline">
                    Repository
                  </a>
                </>
              )}
            </div>
          </div>
          <p className="text-xl text-[var(--text-muted)] leading-relaxed max-w-3xl">
            {project.summary}
          </p>
        </header>

        {project.thumbnail && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)]">
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Highlights</h2>
              <ul className="space-y-3 list-disc list-inside text-[var(--text-muted)] leading-relaxed">
                {project.highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Content</h2>
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                {/* Render content appropriately - for now assuming plain text or using a Markdown renderer if needed. 
                        The original code didn't render 'content' separate from highlights, but the type has it.
                        If content is markdown, we might need a parser. For now, simple display or whitespace-pre-wrap.
                    */}
                <div className="whitespace-pre-wrap">{project.content}</div>
              </div>
            </section>
          </div>

          <aside className="space-y-8 lg:pt-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-soft)] uppercase tracking-wider mb-2">Team</h3>
                <p className="text-[var(--foreground)]">{project.members}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-soft)] uppercase tracking-wider mb-2">Role</h3>
                <p className="text-[var(--foreground)]">{project.role || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-soft)] uppercase tracking-wider mb-2">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((tech) => {
                    const meta = getTechIconMeta(tech);
                    if (meta?.icon) {
                      return (
                        <div key={tech} className="relative w-8 h-8 rounded-lg bg-[var(--card-subtle)] border border-[var(--border-muted)] p-1.5" title={meta.label}>
                          <Image
                            src={meta.icon}
                            alt={meta.label}
                            fill
                            className="object-contain"
                          />
                        </div>
                      );
                    }
                    return (
                      <span key={tech} className="px-2.5 py-1 rounded-md bg-[var(--card-subtle)] text-xs font-medium text-[var(--text-muted)] border border-[var(--border-muted)]">
                        {tech}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
