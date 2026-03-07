import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getAllPostsWithVelog } from "./lib/posts";
import { getAllProjects } from "./lib/projects";
import { getTechIconMeta } from "./data/skills";

import { Suspense } from "react";
import { Skeleton } from "./components/ui/Skeleton";

export const revalidate = 1800;

async function RecentPostsSection() {
  const username = process.env.VELOG_USERNAME ?? process.env.NEXT_PUBLIC_VELOG_USERNAME ?? "gumraze";
  const recentPosts = await getAllPostsWithVelog({
    includeVelog: true,
    username,
    max: 3,
    includeOgMeta: false,
  });

  return (
    <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)]/35 overflow-hidden">
      {recentPosts.length > 0 ? (
        recentPosts.map((post) => (
          <Link
            key={post.slug}
            href={post.externalLink ?? `/devlog/${post.slug}`}
            target={post.externalLink ? "_blank" : undefined}
            rel={post.externalLink ? "noopener noreferrer" : undefined}
            className="group py-7 border-b border-[var(--border-muted)] flex flex-col md:flex-row gap-4 md:items-center justify-between hover:bg-[var(--card)]/40 transition-colors px-5 md:px-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-soft)]">
                <span>{new Date(post.date).toLocaleDateString("ko-KR", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <div className="flex items-center gap-2">
                  {post.tags && post.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-[var(--card-subtle)]/30 border border-[var(--border)]/50 text-[var(--text-muted)] text-[10px] font-semibold backdrop-blur-md transition-all duration-200 group-hover:bg-[var(--card-subtle)]/50 group-hover:border-[var(--text-soft)] group-hover:text-[var(--foreground)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <h3 className="text-xl font-bold group-hover:text-[var(--accent-strong)] transition-colors">
                {post.title}
              </h3>
              <p className="max-w-2xl text-[var(--text-muted)] line-clamp-1">
                {post.description}
              </p>
            </div>
            <div className="md:opacity-0 group-hover:opacity-100 transition-opacity self-start md:self-center">
              <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
            </div>
          </Link>
        ))
      ) : (
        <div className="py-12 text-center text-[var(--text-muted)]">
          No recent posts found.
        </div>
      )}
    </div>
  );
}

function RecentPostsSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)]/35 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div key={i} className="py-7 border-b border-[var(--border-muted)] px-5 md:px-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

async function FeaturedProjectsSection() {
  const projects = getAllProjects();
  const featuredProjects = projects.slice(0, 3);

  return (
    <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)]/35 overflow-hidden">
      {featuredProjects.length > 0 ? (
        featuredProjects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group py-7 border-b border-[var(--border-muted)] flex flex-col md:flex-row gap-6 hover:bg-[var(--card)]/40 transition-colors px-5 md:px-6"
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-soft)] uppercase tracking-wider">
                <span>{project.period || "Ongoing"}</span>
              </div>

              <h3 className="text-2xl font-bold group-hover:text-[var(--accent-strong)] transition-colors leading-tight">
                {project.title}
              </h3>

              <p className="text-[var(--text-muted)] leading-relaxed line-clamp-2">
                {project.summary}
              </p>

              {project.stack && project.stack.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.stack.slice(0, 5).map(tech => {
                    const meta = getTechIconMeta(tech);
                    if (meta?.icon) {
                      return (
                        <div key={tech} className="relative w-6 h-6" title={meta.label}>
                          <Image
                            src={meta.icon}
                            alt={meta.label}
                            fill
                            sizes="24px"
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

            <div className="self-start pt-1 text-[var(--text-soft)] group-hover:text-[var(--accent-strong)] transition-colors md:opacity-0 group-hover:opacity-100">
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

function ProjectsSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)]/35 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div key={i} className="py-7 border-b border-[var(--border-muted)] px-5 md:px-6 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-12 md:space-y-16 animate-in fade-in duration-500 pb-20">
      <section className="relative pt-12 pb-6 md:pt-16 md:pb-10">
        <div className="max-w-5xl space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--foreground)] md:whitespace-nowrap">
              Documentation - driven <span className="text-[var(--accent)]">Developer</span>
            </h1>

            <p className="max-w-3xl text-lg md:text-xl leading-relaxed text-[var(--text-muted)] font-medium">
              공식 문서 속의 원리를 탐구하고 기록하며, 정석을 바탕으로 지식을 나누는 과정을 통해
              성장을 넘어 팀의 발전에 기여하고자 합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Featured / Recent Devlog */}
      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-[var(--border)] pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Live Feed</p>
            <h2 className="text-3xl font-bold tracking-tight">Latest Devlog</h2>
          </div>
          <Link href="/devlog" className="group flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]">
            Display all
            <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <Suspense fallback={<RecentPostsSkeleton />}>
          <RecentPostsSection />
        </Suspense>
      </section>

      {/* Featured Projects */}
      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-[var(--border)] pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Archive</p>
            <h2 className="text-3xl font-bold tracking-tight">Project</h2>
          </div>
          <Link href="/projects" className="group flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]">
            View All
            <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <Suspense fallback={<ProjectsSkeleton />}>
          <FeaturedProjectsSection />
        </Suspense>
      </section>

    </div>
  );
}
