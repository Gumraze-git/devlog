import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getAllPostsWithVelog } from "./lib/posts";
import { getAllProjects } from "./lib/projects";
import { getTechIconMeta } from "./data/skills";
import { experienceItems } from "./data/experience";
import { educationItems } from "./data/education";

async function getRecentPosts() {
  const username = process.env.VELOG_USERNAME ?? process.env.NEXT_PUBLIC_VELOG_USERNAME ?? "gumraze";
  return getAllPostsWithVelog({
    includeVelog: true,
    username,
    max: 3,
    includeOgMeta: false,
  });
}

export default async function Home() {
  const recentPosts = await getRecentPosts();
  const projects = getAllProjects();
  const featuredProjects = projects.slice(0, 3);

  return (
    <div className="space-y-16 md:space-y-20 animate-in fade-in duration-500 pb-20">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[linear-gradient(145deg,#0f1117_0%,#131722_45%,#1c2438_100%)] px-6 py-10 md:px-10 md:py-14">
        <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(to_right,rgba(148,163,184,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[var(--accent)]/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-6 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-14 items-end">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1">Tech Poster</span>
              <span className="rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1">2026 Edition</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.92] tracking-tight text-white">
              Dreaming
              <br />
              <span className="text-transparent bg-clip-text bg-[linear-gradient(92deg,#7dd3fc_0%,#22d3ee_35%,#f5f3ff_100%)]">
                Developer
              </span>
            </h1>

            <p className="max-w-2xl whitespace-pre-line text-base md:text-lg font-medium leading-relaxed text-slate-200">
              기술의 원리를 이해하고 기록하며 동료들과 지식을 나누는 과정을 통해,
              {"\n"}
              개인의 성장을 넘어 팀의 발전에 기여하고자 합니다.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-black/25 p-5 md:p-6 backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/90">Mission</p>
            <p className="mt-3 whitespace-pre-line text-sm md:text-base leading-relaxed text-slate-200">
              특정 분야의 전문가이자 동료들이 믿고 찾는 문제 해결사,
              {"\n"}
              그리고 긍정적인 영향력을 전하는 리더로 거듭나는 것이 저의 목표입니다.
            </p>
            <p className="mt-5 flex items-center gap-3 text-sm font-semibold italic text-white">
              <span className="h-px w-8 bg-cyan-300" />
              개발 참 즐겁습니다.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/devlog"
                className="inline-flex items-center gap-2 rounded-full border border-cyan-200/40 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-100 transition hover:bg-cyan-300/20"
              >
                Devlog Feed
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white/20"
              >
                Projects
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
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
      </section>

      {/* Featured Projects */}
      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-[var(--border)] pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Selected Works</p>
            <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
          </div>
          <Link href="/projects" className="group flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]">
            View All
            <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

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
      </section>

      {/* Experience & Education */}
      <div className="grid md:grid-cols-2 gap-12 sm:gap-16">
        <section className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight border-b border-[var(--border)] pb-4">Experience</h2>
          <div className="space-y-8">
            {experienceItems.length > 0 ? (
              experienceItems.map((item) => (
                <div key={item.id} className="group relative pl-4 border-l border-[var(--border-muted)] hover:border-[var(--accent)] transition-colors">
                  <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-[var(--border-muted)] group-hover:bg-[var(--accent)] transition-colors" />
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-[var(--text-soft)] uppercase tracking-wider block mb-1">
                      {item.period}
                    </span>
                    <h3 className="text-xl font-bold group-hover:text-[var(--accent-strong)] transition-colors">
                      {item.company}
                    </h3>
                    <p className="text-sm font-medium text-[var(--accent)] mb-2">{item.position}</p>
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[var(--text-muted)]">Update app/data/experience.ts</p>
            )}
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight border-b border-[var(--border)] pb-4">Education</h2>
          <div className="space-y-8">
            {educationItems.length > 0 ? (
              educationItems.map((item, idx) => (
                <div key={idx} className="group relative pl-4 border-l border-[var(--border-muted)] hover:border-[var(--accent)] transition-colors">
                  <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-[var(--border-muted)] group-hover:bg-[var(--accent)] transition-colors" />
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-[var(--text-soft)] uppercase tracking-wider block mb-1">
                      {item.period}
                    </span>
                    <h3 className="text-xl font-bold group-hover:text-[var(--accent-strong)] transition-colors">
                      {item.school}
                    </h3>
                    <p className="text-sm font-medium text-[var(--accent)] mb-2">{item.faculty} {item.major && `(${item.major})`}</p>
                    {item.gpa && (
                      <p className="text-[var(--text-muted)] text-sm">GPA: {item.gpa}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[var(--text-muted)]">Update app/data/education.ts</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
