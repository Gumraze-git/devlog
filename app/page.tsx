import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Terminal, ArrowUpRight } from "lucide-react";
import { getAllPostsWithVelog } from "./lib/posts";
import { getAllProjects } from "./lib/projects";
import { getTechIconMeta } from "./data/skills";
// import { experienceItems } from "./data/experience";
// import { educationItems } from "./data/education";

async function getRecentPosts() {
  const username = process.env.VELOG_USERNAME ?? process.env.NEXT_PUBLIC_VELOG_USERNAME ?? "gumraze";
  const posts = await getAllPostsWithVelog({ includeVelog: true, username });
  return posts.slice(0, 3); // Get top 3 recent posts
}

export default async function Home() {
  const recentPosts = await getRecentPosts();
  const projects = getAllProjects();
  const featuredProjects = projects.slice(0, 3);

  return (
    <div className="space-y-24 animate-in fade-in duration-500 pb-20">


      {/* Featured / Recent Devlog */}
      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-[var(--border)] pb-4">
          <h2 className="text-3xl font-bold tracking-tight">Latest Devlog</h2>
          <Link href="/devlog" className="group flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]">
            Display all
            <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="flex flex-col">
          {recentPosts.length > 0 ? (
            recentPosts.map((post, index) => (
              <Link
                key={post.slug}
                href={post.externalLink ?? `/devlog/${post.slug}`}
                target={post.externalLink ? "_blank" : undefined}
                className="group py-8 border-b border-[var(--border-muted)] flex flex-col md:flex-row gap-4 md:items-center justify-between hover:bg-[var(--card-subtle)]/50 transition-colors -mx-4 px-4 rounded-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-soft)]">
                    <span>{new Date(post.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {post.tags && post.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--text-muted)]">
                        #{tag}
                      </span>
                    ))}
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
          <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
          <Link href="/projects" className="group flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]">
            View All
            <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="flex flex-col">
          {featuredProjects.length > 0 ? (
            featuredProjects.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group py-8 border-b border-[var(--border-muted)] flex flex-col md:flex-row gap-6 hover:bg-[var(--card-subtle)]/50 transition-colors -mx-4 px-4 rounded-xl"
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
      {/* Experience & Education
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
      */}
    </div>
  );
}
