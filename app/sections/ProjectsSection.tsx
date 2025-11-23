"use client";

import { useState } from "react";

import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";
import ProjectCard from "../components/project/ProjectCard";
import ProjectModal from "../components/project/ProjectModal";
import { Project, projects } from "../data/projects";

export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <SectionWatcher id="projects" className="scroll-mt-32">
      <SlideUpInView>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">Projects</p>
            <h2 className="text-3xl font-bold text-[var(--foreground)]">사이드 프로젝트</h2>
            <p className="text-[var(--text-muted)]">진행 중 혹은 완료한 프로젝트의 하이라이트를 모았습니다.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onSelect={setSelectedProject} />
            ))}
          </div>
        </div>
      </SlideUpInView>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </SectionWatcher>
  );
}
