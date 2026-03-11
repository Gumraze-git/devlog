import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { PageIntro } from "../components/common/PageIntro";
import { Skeleton } from "../components/ui/Skeleton";
import { createPageMetadata } from "../lib/metadata";
import { getAllProjects, type Project } from "../lib/projects";

export const metadata: Metadata = createPageMetadata({
  title: "Projects",
  description: "프로젝트 경험과 기술 스택을 정리한 목록입니다.",
  path: "/projects",
});

function renderMeta(project: Project) {
  const meta = [project.projectType, project.category].filter(Boolean);
  if (meta.length > 0) return meta;

  if (project.members) return [project.members];
  return [];
}

function ProjectCard({ project }: { project: Project }) {
  const metaItems = renderMeta(project);
  const previewHighlights = project.results && project.results.length > 0
    ? project.results.slice(0, 2)
    : project.highlights.slice(0, 2);
  const previewStack = project.stack.slice(0, 4);

  return (
    <Link
      href={`/projects/${project.slug}`}
      aria-label={`${project.title} 상세 페이지로 이동`}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] transition-colors hover:border-[var(--accent)]/25 hover:bg-[var(--card-muted)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-[var(--border-muted)] bg-[var(--card-subtle)]">
        <Image
          src={project.thumbnail || "/devlog-placeholder.svg"}
          alt={`${project.title} thumbnail`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-soft)]">
          <span>{(project.period || "Ongoing").replace(/~/g, "-")}</span>
          {project.status && (
            <span className="inline-flex items-center rounded-full border border-[var(--border)] px-2 py-0.5 tracking-[0.12em] text-[10px] text-[var(--text-muted)]">
              {project.status}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2">
            <h2 className="text-2xl font-bold leading-tight text-[var(--foreground)] transition-colors group-hover:text-[var(--accent-strong)]">
              {project.title}
            </h2>
            <ArrowUpRight size={18} className="text-[var(--text-soft)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
          </div>
          <p className="text-[var(--text-muted)] leading-relaxed">
            {project.summary || "Click to view details."}
          </p>
        </div>

        {(project.roles?.length ?? 0) > 0 || metaItems.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {project.roles?.slice(0, 3).map((role) => (
              <span
                key={role}
                className="inline-flex items-center rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/6 px-3 py-1 text-xs font-medium text-[var(--accent-strong)]"
              >
                {role}
              </span>
            ))}
            {metaItems.slice(0, 2).map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card-subtle)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]"
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}

        {previewHighlights.length > 0 ? (
          <ul className="space-y-2 border-t border-dashed border-[var(--border)] pt-4 text-sm text-[var(--text-muted)] leading-relaxed">
            {previewHighlights.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {previewStack.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {previewStack.map((stack) => (
              <span
                key={stack}
                className="inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-soft)]"
              >
                {stack}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function ProjectsContent() {
  const projects = getAllProjects();

  return (
    <section className="space-y-8">
      {projects.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)] px-6 py-12 text-center">
          <p className="text-[var(--text-muted)]">No projects found.</p>
        </div>
      )}
    </section>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)]">
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-4 p-6">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <div className="space-y-2 pt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProjectsListPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageIntro
        eyebrow="Projects"
        title="Idea to Execution"
        description="문제를 정의하고 구조를 설계한 뒤, 구현과 검증까지 이어간 프로젝트들을 케이스 스터디 관점에서 정리했습니다."
        bordered
      />

      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsContent />
      </Suspense>
    </div>
  );
}
