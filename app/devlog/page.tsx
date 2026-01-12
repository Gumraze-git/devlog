import Link from "next/link";
import { getAllPostsWithVelog } from "../lib/posts";
import { ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DevlogListPage() {
  const username = process.env.VELOG_USERNAME ?? process.env.NEXT_PUBLIC_VELOG_USERNAME ?? "gumraze";
  const posts = await getAllPostsWithVelog({ includeVelog: true, username });

  // Filter for Velog posts as per original logic, but we might want to include local ones too if they existed.
  // Original code only showed Velog posts if filtered. Let's keep showing all for now or check intent.
  // The original code: const velogPosts = posts.filter((post) => post.source === "velog");
  // But getAllPostsWithVelog returns everything if we want.
  // Implemented matching the modern list style.

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="space-y-4 border-b border-[var(--border)] pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Devlog</h1>
        <p className="text-xl text-[var(--text-muted)] max-w-2xl leading-relaxed">
          Thoughts on software engineering, distributed systems, and backend architecture.
        </p>
      </header>

      <div className="flex flex-col">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link
              key={post.slug}
              href={post.externalLink ?? `/devlog/${post.slug}`}
              target={post.externalLink ? "_blank" : undefined}
              className="group py-8 border-b border-[var(--border-muted)] flex flex-col md:flex-row gap-6 hover:bg-[var(--card-subtle)]/50 transition-colors -mx-4 px-4 rounded-xl"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-soft)] uppercase tracking-wider">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                  </time>
                  <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                  <span>{post.source === "velog" ? "Velog" : "Local"}</span>
                </div>

                <h2 className="text-2xl font-bold group-hover:text-[var(--accent-strong)] transition-colors leading-tight">
                  {post.title}
                </h2>

                <p className="text-[var(--text-muted)] leading-relaxed line-clamp-2 md:line-clamp-none">
                  {post.description}
                </p>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--card)] border border-[var(--border)] text-[var(--text-muted)]">
                        #{tag}
                      </span>
                    ))}
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
            <p className="text-[var(--text-muted)]">No posts found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
