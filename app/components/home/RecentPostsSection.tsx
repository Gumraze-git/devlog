import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getAllPostsWithVelog } from "../../lib/posts";
import { formatDateKo } from "../../lib/date";

export async function RecentPostsSection() {
  const username = process.env.VELOG_USERNAME ?? process.env.NEXT_PUBLIC_VELOG_USERNAME ?? "gumraze";
  const recentPosts = await getAllPostsWithVelog({
    includeVelog: true,
    username,
    max: 3,
    includeOgMeta: false,
  });

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)]/35">
      {recentPosts.length > 0 ? (
        recentPosts.map((post) => (
          <Link
            key={post.slug}
            href={post.externalLink ?? `/devlog/${post.slug}`}
            target={post.externalLink ? "_blank" : undefined}
            rel={post.externalLink ? "noopener noreferrer" : undefined}
            className="group flex flex-col justify-between gap-4 border-b border-[var(--border-muted)] px-5 py-7 transition-colors hover:bg-[var(--card)]/40 md:flex-row md:items-center md:px-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-soft)]">
                <span>{formatDateKo(post.date)}</span>
                <div className="flex items-center gap-2">
                  {post.tags && post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-[var(--border)]/50 bg-[var(--card-subtle)]/30 px-2 py-0.5 text-[10px] font-semibold text-[var(--text-muted)] backdrop-blur-md transition-all duration-200 group-hover:border-[var(--text-soft)] group-hover:bg-[var(--card-subtle)]/50 group-hover:text-[var(--foreground)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <h3 className="text-xl font-bold transition-colors group-hover:text-[var(--accent-strong)]">
                {post.title}
              </h3>
              <p className="max-w-2xl line-clamp-1 text-[var(--text-muted)]">
                {post.description}
              </p>
            </div>
            <div className="self-start transition-opacity md:self-center md:opacity-0 group-hover:opacity-100">
              <ArrowRight className="h-5 w-5 -rotate-45 transition-transform group-hover:rotate-0" />
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
