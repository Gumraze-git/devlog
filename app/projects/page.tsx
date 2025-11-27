import { getAllProjects } from "../lib/projects";
import OverlayCard from "../components/ui/OverlayCard";

export const dynamic = "force-dynamic";

function formatPeriod(period: string) {
  return period;
}

export default function ProjectsListPage() {
  const projects = getAllProjects();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-16">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">Projects</p>
        <h1 className="text-4xl font-bold text-[var(--foreground)]">모든 사이드 프로젝트</h1>
        <p className="text-[var(--text-muted)]">최신순으로 정렬된 프로젝트 목록입니다.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <OverlayCard
            key={project.slug}
            href={`/projects/${project.slug}`}
            title={project.title}
            date={formatPeriod(project.period)}
            thumbnail={project.thumbnail}
            ariaLabel={`Project ${project.title}`}
            ctaLabel="자세히 보기"
          />
        ))}
      </div>
    </main>
  );
}
