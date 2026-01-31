import Link from "next/link";
import { getAllPostsWithVelog } from "../lib/posts";
import { ArrowUpRight } from "lucide-react";
import TagFilter from "../components/TagFilter";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function DevlogListPage({ searchParams }: PageProps) {
  const username = process.env.VELOG_USERNAME ?? process.env.NEXT_PUBLIC_VELOG_USERNAME ?? "gumraze";
  const posts = await getAllPostsWithVelog({ includeVelog: true, username });

  const resolvedSearchParams = await searchParams;
  const currentTag = resolvedSearchParams.tag;

  // Extract unique tags
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags || []))).sort();

  // Filter posts if tag is selected
  const filteredPosts = currentTag
    ? posts.filter(post => post.tags?.includes(currentTag))
    : posts;

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="space-y-4 border-b border-[var(--border)] pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Devlog</h1>
        <p className="text-xl text-[var(--text-muted)] max-w-2xl leading-relaxed">
          경험을 지식으로 전환하는 공간입니다.
        </p>
      </header>

      <div className="space-y-8">
        <Suspense fallback={<div className="h-10 w-full animate-pulse bg-[var(--card)] rounded-lg" />}>
          <TagFilter tags={allTags} />
        </Suspense>

        <div className="flex flex-col">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Link
                key={post.slug}
                href={post.externalLink ?? `/devlog/${post.slug}`}
                target={post.externalLink ? "_blank" : undefined}
                className="group py-8 border-b border-[var(--border-muted)] flex flex-col md:flex-row gap-6 hover:bg-[var(--card-subtle)]/50 transition-colors -mx-4 px-4 rounded-xl"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-soft)] uppercase tracking-wider">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("ko-KR", { year: 'numeric', month: 'long', day: 'numeric' })}
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
                        <span
                          key={tag}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all duration-300 backdrop-blur-md group-hover:scale-105 ${currentTag === tag
                            ? "bg-[var(--accent-strong)]/90 text-white border-[var(--accent-strong)] shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                            : "bg-[var(--card-subtle)]/30 border-[var(--border)]/50 text-[var(--text-muted)] group-hover:bg-[var(--card-subtle)]/50 group-hover:border-[var(--accent)]/30"
                            }`}
                        >
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
              <p className="text-[var(--text-muted)]">No posts found with tag "#{currentTag}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
