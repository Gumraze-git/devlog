import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { TechStackList } from "../common/TechStackList";
import { getAllProjects } from "../../lib/projects";

export function FeaturedProjectsSection() {
  const projects = getAllProjects();
  const featuredProjects = projects.slice(0, 3);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)]/35">
      {featuredProjects.length > 0 ? (
        featuredProjects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group flex flex-col gap-6 border-b border-[var(--border-muted)] px-5 py-7 transition-colors hover:bg-[var(--card)]/40 md:flex-row md:px-6"
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-wider text-[var(--text-soft)]">
                <span>{project.period || "Ongoing"}</span>
              </div>

              <h3 className="text-2xl font-bold leading-tight transition-colors group-hover:text-[var(--accent-strong)]">
                {project.title}
              </h3>

              <p className="line-clamp-2 text-[var(--text-muted)] leading-relaxed">
                {project.summary}
              </p>

              <TechStackList items={project.stack} variant="compact" maxItems={5} className="pt-2" />
            </div>

            <div className="self-start pt-1 text-[var(--text-soft)] transition-colors md:opacity-0 group-hover:text-[var(--accent-strong)] group-hover:opacity-100">
              <ArrowUpRight size={20} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </div>
          </Link>
        ))
      ) : (
        <div className="py-12 text-center text-[var(--text-muted)]">
          Coming soon.
        </div>
      )}
    </div>
  );
}
