import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { getAllProjects, type Project } from "../lib/projects";
import { getTechIconMeta } from "../data/skills";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description: "프로젝트 경험과 기술 스택을 정리한 목록입니다.",
};

function getStatus(period: string) {
  return /진행중|ongoing/i.test(period ?? "") ? "IN PROGRESS" : "COMPLETED";
}

function renderTechStack(stack: string[]) {
  if (!stack || stack.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {stack.slice(0, 6).map((tech, index) => {
        const meta = getTechIconMeta(tech);

        if (meta?.icon) {
          return (
            <span
              key={`${tech}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-2 py-1"
              title={meta.label}
            >
              <span className="relative h-3.5 w-3.5">
                <Image src={meta.icon} alt={meta.label} fill sizes="14px" className="object-contain" />
              </span>
              <span className="text-[11px] font-medium text-[var(--text-muted)]">{meta.label}</span>
            </span>
          );
        }

        return (
          <span
            key={`${tech}-${index}`}
            className="rounded-full border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[11px] font-medium text-[var(--text-muted)]"
          >
            {tech}
          </span>
        );
      })}
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const status = getStatus(project.period);

  return (
    <Link
      href={`/projects/${project.slug}`}
      aria-label={`${project.title} 상세 페이지로 이동`}
      className="group block border-b border-[var(--border-muted)] px-1 py-6"
    >
      <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <Image
            src={project.thumbnail || "/devlog-placeholder.svg"}
            alt={`${project.title} thumbnail`}
            fill
            sizes="(max-width: 768px) 100vw, 220px"
            className="object-cover"
          />
        </div>

        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-soft)]">
              {project.period || "Ongoing"}
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              {status}
            </span>
          </div>

          <h2 className="text-2xl font-bold leading-tight text-[var(--foreground)] transition-colors group-hover:text-[var(--accent-strong)]">
            {project.title}
          </h2>

          <p className="text-[var(--text-muted)] leading-relaxed line-clamp-2">
            {project.summary || "Click to view details."}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-soft)]">
            {project.role && <span>Role: {project.role}</span>}
            {project.members && <span>Team: {project.members}</span>}
          </div>

          {renderTechStack(project.stack)}
        </div>
      </div>
    </Link>
  );
}

import { Suspense } from "react";
import { Skeleton } from "../components/ui/Skeleton";

function ProjectsContent() {
  const projects = getAllProjects();

  return (
    <section className="space-y-8">
      {projects.length > 0 ? (
        <div className="flex flex-col">
          {projects.map((project) => (
            <ProjectRow key={project.slug} project={project} />
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
    <div className="flex flex-col">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="group block border-b border-[var(--border-muted)] px-1 py-6">
          <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
            <Skeleton className="aspect-[16/10] w-full rounded-lg" />
            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-8 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
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
      <header className="space-y-4 border-b border-[var(--border-muted)] pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Archive</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">Project</h1>
      </header>

      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsContent />
      </Suspense>
    </div>
  );
}
