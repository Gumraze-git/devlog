import Link from "next/link";
import Image from "next/image";
import { getAllProjects } from "../lib/projects";
import { getTechIconMeta } from "../data/skills";
import { ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ProjectsListPage() {
  const projects = getAllProjects();

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="space-y-4 border-b border-[var(--border)] pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Projects</h1>
        <p className="text-xl text-[var(--text-muted)] max-w-2xl leading-relaxed">
          A collection of side projects, experiments, and open source contributions.
        </p>
      </header>

      <div className="flex flex-col">
        {projects.length > 0 ? (
          projects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group py-8 border-b border-[var(--border-muted)] flex flex-col md:flex-row gap-6 hover:bg-[var(--card-subtle)]/50 transition-colors -mx-4 px-4 rounded-xl"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-soft)] uppercase tracking-wider">
                  <span>{project.period || "Ongoing"}</span>
                  {/* Add more metadata if available in project type, e.g. type or status */}
                </div>

                <h2 className="text-2xl font-bold group-hover:text-[var(--accent-strong)] transition-colors leading-tight">
                  {project.title}
                </h2>

                <p className="text-[var(--text-muted)] leading-relaxed line-clamp-2 md:line-clamp-none">
                  {project.summary || "Click to view details."}
                </p>

                {project.stack && project.stack.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.stack.map(tech => {
                      const meta = getTechIconMeta(tech);
                      if (meta?.icon) {
                        return (
                          <div key={tech} className="relative w-6 h-6" title={meta.label}>
                            <Image
                              src={meta.icon}
                              alt={meta.label}
                              fill
                              className="object-contain"
                            />
                          </div>
                        );
                      }
                      return (
                        <span key={tech} className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--card)] border border-[var(--border)] text-[var(--text-muted)]">
                          {tech}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="self-start pt-1 text-[var(--text-soft)] group-hover:text-[var(--accent-strong)] transition-colors">
                <ArrowUpRight size={20} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </div>
            </Link>
          ))
        ) : (
          <div className="py-20 text-center">
            <p className="text-[var(--text-muted)]">No projects found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
