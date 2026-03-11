import type { Project, ProjectHeroImage } from "../../lib/projects";
import { TechStackList } from "../../components/common/TechStackList";
import BackToPreviousLink from "./BackToPreviousLink";
import ProjectHeroCarousel from "./ProjectHeroCarousel";
import ProjectMetaGroup from "./ProjectMetaGroup";
import ProjectRolePills from "./ProjectRolePills";
import ProjectSourceLinks from "./ProjectSourceLinks";

import type { ProjectSourceLink } from "./projectDetail.helpers";

type ProjectDetailOverviewProps = {
  project: Project;
  heroImages: ProjectHeroImage[];
  roleItems: string[];
  sourceLinks: ProjectSourceLink[];
  hasSourceLinks: boolean;
};

export default function ProjectDetailOverview({
  project,
  heroImages,
  roleItems,
  sourceLinks,
  hasSourceLinks,
}: ProjectDetailOverviewProps) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <section className="relative mb-2 space-y-8 md:space-y-10">
        <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-[var(--accent)]/10 blur-[100px] opacity-60 pointer-events-none" />
        <div className="absolute top-40 left-0 -z-10 h-72 w-72 rounded-full bg-purple-500/10 blur-[80px] opacity-50 pointer-events-none" />

        <BackToPreviousLink
          fallbackHref="/projects"
          className="group inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <span aria-hidden="true" className="text-base leading-none transition-transform group-hover:-translate-x-1">←</span>
          <span className="underline decoration-transparent underline-offset-[3px] decoration-2 transition-colors group-hover:decoration-[var(--foreground)]">Back to Projects</span>
        </BackToPreviousLink>

        <div className="relative z-10 pt-2 text-pretty">
          <div className="mb-5 space-y-5">
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-[var(--foreground)] md:text-5xl xl:text-[4rem]">
                {project.title}
              </h1>
              {project.projectTitle ? (
                <p className="text-base font-bold uppercase tracking-[0.25em] text-[var(--accent)] md:text-lg">
                  {project.projectTitle}
                </p>
              ) : null}
            </div>

            <p className="max-w-4xl text-base font-medium leading-[1.6] text-[var(--text-muted)] md:text-lg">
              {project.summary}
            </p>
          </div>

          {heroImages.length > 0 ? (
            <div className="group relative mt-6 w-full xl:mt-8">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[var(--accent)]/10 to-purple-500/10 blur-xl opacity-0 transition-opacity duration-700 pointer-events-none group-hover:opacity-100" />
              <div className="relative z-10 w-full overflow-hidden rounded-3xl bg-[var(--card)] shadow-2xl shadow-[var(--shadow)] ring-1 ring-[var(--border)]/50">
                <ProjectHeroCarousel images={heroImages} projectTitle={project.title} />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card-subtle)]/50 p-8 text-center text-sm font-medium text-[var(--text-soft)] backdrop-blur-sm">
              대표 이미지가 없습니다.
            </div>
          )}
        </div>

        <div className="!mt-7 space-y-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <ProjectMetaGroup label="기간" dotClassName="bg-[var(--accent)]">
              <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 shadow-sm">
                <p className="font-mono text-[13px] font-bold tracking-tight text-[var(--foreground)]">{project.period}</p>
              </div>
            </ProjectMetaGroup>

            {roleItems.length > 0 ? (
              <ProjectMetaGroup label="역할" dotClassName="bg-indigo-500">
                <ProjectRolePills roleItems={roleItems} />
              </ProjectMetaGroup>
            ) : null}

            {hasSourceLinks ? (
              <ProjectMetaGroup label="소스" dotClassName="bg-emerald-500">
                <ProjectSourceLinks sourceLinks={sourceLinks} />
              </ProjectMetaGroup>
            ) : null}
          </div>

          <div className="pt-0">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.15em] text-[var(--text-soft)]">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 opacity-70"></span>
              기술 스택
            </h3>
            <TechStackList items={project.stack} variant="detailed" />
          </div>
        </div>
      </section>
    </div>
  );
}
