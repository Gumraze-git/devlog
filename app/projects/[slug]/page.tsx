import { use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getProject } from "../../lib/projects";

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
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-16">
      <Link href="/projects" className="text-sm font-semibold text-[var(--accent-strong)]">
        ← 목록으로
      </Link>

      <article className="space-y-6">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">{project.period}</p>
          <h1 className="text-4xl font-bold text-[var(--foreground)]">{project.title}</h1>
          <p className="text-lg text-[var(--text-muted)]">{project.summary}</p>
        </header>

        {project.thumbnail && (
          <div className="relative h-72 overflow-hidden rounded-3xl bg-[var(--card-subtle)]">
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              sizes="800px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <dl className="grid gap-4 rounded-2xl border border-[var(--border)] p-4 text-sm">
          <div className="flex justify-between">
            <dt className="font-semibold text-[var(--text-soft)]">기간</dt>
            <dd className="text-[var(--foreground)]">{project.period}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-semibold text-[var(--text-soft)]">인원</dt>
            <dd className="text-[var(--foreground)]">{project.members}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--text-soft)]">기술 스택</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span key={tech} className="rounded-full bg-[var(--border-muted)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
                  {tech}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        <div className="space-y-3">
          {project.highlights.map((highlight, index) => (
            <p key={index} className="rounded-2xl bg-[var(--card-muted)] p-3 text-sm text-[var(--text-muted)]">
              {highlight}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
