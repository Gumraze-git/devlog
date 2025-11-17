"use client";

import { Project } from "../../data/projects";

type ProjectModalProps = {
  project: Project | null;
  onClose: () => void;
};

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 text-slate-800 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">프로젝트</p>
            <h3 className="mt-2 text-2xl font-bold">{project.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{project.summary}</p>
          </div>
          <button className="text-sm text-slate-500" onClick={onClose}>
            닫기
          </button>
        </div>

        <dl className="mt-6 grid gap-4 rounded-2xl border border-slate-200 p-4 text-sm">
          <div className="flex justify-between">
            <dt className="font-semibold text-slate-500">기간</dt>
            <dd className="text-slate-800">{project.period}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-semibold text-slate-500">인원</dt>
            <dd className="text-slate-800">{project.members}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">기술 스택</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span key={tech} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {tech}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        <div className="mt-6 space-y-3">
          {project.highlights.map((highlight, index) => (
            <p key={index} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
              {highlight}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
