"use client";

import { Project } from "../../data/projects";

type ProjectCardProps = {
  project: Project;
  onSelect: (project: Project) => void;
};

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <button
      className="rounded-3xl border border-[var(--border)] bg-[var(--card-muted)] p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      onClick={() => onSelect(project)}
    >
      <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">{project.period}</p>
      <h3 className="mt-3 text-xl font-semibold text-[var(--foreground)]">{project.title}</h3>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{project.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.stack.slice(0, 3).map((item) => (
          <span key={item} className="rounded-full bg-[var(--border-muted)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
            {item}
          </span>
        ))}
        {project.stack.length > 3 && (
          <span className="rounded-full bg-[var(--card-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-soft)]">
            +{project.stack.length - 3}
          </span>
        )}
      </div>
    </button>
  );
}
