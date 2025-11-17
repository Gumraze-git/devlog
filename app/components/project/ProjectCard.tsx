"use client";

import { Project } from "../../data/projects";

type ProjectCardProps = {
  project: Project;
  onSelect: (project: Project) => void;
};

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <button
      className="rounded-3xl border border-slate-200 bg-white/90 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      onClick={() => onSelect(project)}
    >
      <p className="text-xs uppercase tracking-wide text-slate-500">{project.period}</p>
      <h3 className="mt-3 text-xl font-semibold text-slate-900">{project.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{project.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.stack.slice(0, 3).map((item) => (
          <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {item}
          </span>
        ))}
        {project.stack.length > 3 && (
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500">
            +{project.stack.length - 3}
          </span>
        )}
      </div>
    </button>
  );
}
