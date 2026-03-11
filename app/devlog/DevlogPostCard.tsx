"use client";

import Image from "next/image";
import Link from "next/link";
import { Terminal } from "lucide-react";

import TagBadge from "../components/ui/TagBadge";
import { formatDateKo } from "../lib/date";
import { type Post } from "../lib/posts";

type DevlogPostCardProps = {
  post: Post;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
};

export function DevlogPostCard({
  post,
  selectedTags,
  onToggleTag,
}: DevlogPostCardProps) {
  const href = post.externalLink ?? `/devlog/${post.slug}`;
  const isExternal = Boolean(post.externalLink);

  return (
    <article className="group relative border-b border-[var(--border-muted)] px-1 py-6">
      <Link
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        aria-label={`${post.title} 보기`}
        className="absolute inset-0 z-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      />

      <div className="relative z-10 pointer-events-none flex w-full flex-col gap-5 sm:flex-row md:gap-7">
        <div className="relative aspect-[21/9] w-full flex-shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] sm:w-[14.5rem] md:w-[17.5rem] lg:w-[19.5rem]">
          {post.thumbnail ? (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 320px, 384px"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--text-soft)] opacity-40">
              <Terminal size={24} strokeWidth={1.5} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">No Image</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--text-soft)]">
              <time dateTime={post.date}>
                {formatDateKo(post.date)}
              </time>
              <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
              <span>{post.source === "velog" ? "Velog" : "Local"}</span>
            </div>

            <h2 className="text-2xl font-bold leading-tight transition-colors group-hover:text-[var(--accent-strong)]">
              {post.title}
            </h2>

            <p className="line-clamp-2 leading-relaxed text-[var(--text-muted)] md:line-clamp-3">
              {post.description}
            </p>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {post.tags.map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <TagBadge
                      key={tag}
                      label={tag}
                      size="xs"
                      active={isActive}
                      ariaPressed={isActive}
                      onClick={() => onToggleTag(tag)}
                      className={[
                        "pointer-events-auto",
                        !isActive ? "group-hover:border-[var(--text-soft)] group-hover:text-[var(--foreground)]" : undefined,
                      ].filter(Boolean).join(" ")}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
