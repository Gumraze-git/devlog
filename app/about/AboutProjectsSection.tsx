import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SectionHeader } from "../components/common/SectionHeader";
import { TechStackList } from "../components/common/TechStackList";
import type { AboutProject } from "../lib/projects";

type AboutProjectsSectionProps = {
  aboutProjects: AboutProject[];
};

export function AboutProjectsSection({ aboutProjects }: AboutProjectsSectionProps) {
  return (
    <section className="space-y-8">
      <SectionHeader title="Projects" />

      <div className="space-y-8">
        {aboutProjects.map((project, index, array) => (
          <div key={project.slug} className="space-y-6">
            <div className="grid gap-10 md:grid-cols-[250px_1fr]">
              <div className="space-y-2">
                <Link href={`/projects/${project.slug}`} className="group/title inline-flex max-w-full items-center gap-2">
                  <h3 className="text-xl font-bold leading-tight text-[var(--foreground)] transition-colors group-hover/title:text-[var(--accent)]">
                    {project.title}
                  </h3>
                  <ArrowUpRight
                    size={18}
                    className="flex-shrink-0 text-[var(--text-soft)] transition-transform group-hover/title:-translate-y-0.5 group-hover/title:translate-x-0.5 group-hover/title:text-[var(--accent)]"
                  />
                </Link>
                {project.organization ? (
                  <p className="text-sm font-semibold text-[var(--accent-strong)]">{project.organization}</p>
                ) : null}
                <p className="text-sm font-mono text-[var(--text-soft)]">{project.period}</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">개요</h4>
                    <p className="text-base leading-relaxed text-[var(--text-muted)]">
                      {project.description}
                    </p>
                  </div>

                  <div className="space-y-2 border-t border-[var(--border)] border-dashed pt-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">주요 수행 역할</h4>
                    <ul className="list-outside list-disc space-y-2 pl-5 text-base leading-relaxed text-[var(--text-muted)]">
                      {project.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="pl-1">{task}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 border-t border-[var(--border)] border-dashed pt-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">기술 스택</h4>
                    <TechStackList items={project.stack} variant="detailed" className="mt-4 gap-8" />
                  </div>
                </div>
              </div>
            </div>

            {index < array.length - 1 ? <div className="border-t border-[var(--border)]" /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
