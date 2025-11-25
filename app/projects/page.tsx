import Link from "next/link";
import Image from "next/image";

import { getAllProjects } from "../lib/projects";

export const dynamic = "force-dynamic";

export default function ProjectsListPage() {
  const projects = getAllProjects();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-16">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">Projects</p>
        <h1 className="text-4xl font-bold text-[var(--foreground)]">모든 사이드 프로젝트</h1>
        <p className="text-[var(--text-muted)]">최신순으로 정렬된 프로젝트 목록입니다.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group block overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-40 overflow-hidden bg-[var(--card-subtle)]">
              <Image
                src={project.thumbnail ?? "/devlog-placeholder.svg"}
                alt={project.title}
                fill
                sizes="400px"
                className="object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="space-y-2 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">{project.period}</p>
              <h2 className="text-lg font-semibold text-[var(--foreground)] line-clamp-2">{project.title}</h2>
              <p className="text-sm text-[var(--text-muted)] line-clamp-2">{project.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
