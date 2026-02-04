import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { getAllProjects, type Project } from "../lib/projects";
import { getTechIconMeta } from "../data/skills";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description: "프로젝트 경험과 기술 스택을 정리한 목록입니다.",
};

function getStatus(period: string) {
  const inProgress = /진행중|ongoing/i.test(period ?? "");

  return {
    label: inProgress ? "IN PROGRESS" : "COMPLETED",
    className: inProgress
      ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent-strong)]"
      : "border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)]",
  };
}

function renderTechStack(stack: string[]) {
  if (!stack || stack.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {stack.map((tech, index) => {
        const meta = getTechIconMeta(tech);

        if (meta?.icon) {
          return (
            <span
              key={`${tech}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-2 py-1"
              title={meta.label}
            >
              <span className="relative h-3.5 w-3.5">
                <Image src={meta.icon} alt={meta.label} fill className="object-contain" />
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

function ProjectCard({ project }: { project: Project }) {
  const status = getStatus(project.period);

  return (
    <Link
      href={`/projects/${project.slug}`}
      aria-label={`${project.title} 상세 페이지로 이동`}
      className="group block rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)] p-4 md:p-5 transition-colors hover:border-[var(--accent)]"
    >
      <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)_auto] md:items-start">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <Image
            src={project.thumbnail || "/devlog-placeholder.svg"}
            alt={`${project.title} thumbnail`}
            fill
            sizes="(max-width: 768px) 100vw, 180px"
            className="object-cover"
          />
        </div>

        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-soft)]">
              {project.period || "Ongoing"}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.className}`}>
              {status.label}
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

        <div className="hidden md:block text-[var(--text-soft)] transition-colors group-hover:text-[var(--accent-strong)]">
          <ArrowUpRight size={20} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default function ProjectsListPage() {
  const projects = getAllProjects();

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)] p-6 md:p-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Projects</h1>
        <p className="text-lg text-[var(--text-muted)] max-w-3xl leading-relaxed">
          프로젝트 경험과 기술 스택을 한눈에 볼 수 있도록 정리했습니다.
        </p>
      </header>

      {projects.length > 0 ? (
        <section className="space-y-4">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </section>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)] px-6 py-12 text-center">
          <p className="text-[var(--text-muted)]">No projects found.</p>
        </div>
      )}
    </div>
  );
}
