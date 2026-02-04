"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Terminal } from "lucide-react";

import TagFilter from "../components/TagFilter";
import TagBadge from "../components/ui/TagBadge";
import { type Post } from "../lib/posts";

type DevlogListClientProps = {
  posts: Post[];
  allTags: string[];
  initialSelectedTags: string[];
};

function parseSelectedTags(search: string): string[] {
  const params = new URLSearchParams(search);
  const tag = params.get("tag");
  return tag ? tag.split(",").filter(Boolean) : [];
}

function buildNextUrl(tags: string[]): string {
  const params = new URLSearchParams(window.location.search);
  if (tags.length > 0) {
    params.set("tag", tags.join(","));
  } else {
    params.delete("tag");
  }
  const query = params.toString();
  return query ? `${window.location.pathname}?${query}` : window.location.pathname;
}

export default function DevlogListClient({
  posts,
  allTags,
  initialSelectedTags,
}: DevlogListClientProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);

  const filteredPosts = useMemo(() => {
    if (selectedTags.length === 0) return posts;
    return posts.filter((post) => post.tags?.some((tag) => selectedTags.includes(tag)));
  }, [posts, selectedTags]);

  const updateUrl = useCallback((tags: string[]) => {
    if (typeof window === "undefined") return;
    const nextUrl = buildNextUrl(tags);
    window.history.replaceState({}, "", nextUrl);
  }, []);

  const handleToggle = useCallback((tag: string) => {
    const nextTags = tag === "all"
      ? []
      : selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag];

    setSelectedTags(nextTags);
    updateUrl(nextTags);
  }, [selectedTags, updateUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const syncFromUrl = () => {
      setSelectedTags(parseSelectedTags(window.location.search));
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  return (
    <div className="space-y-5">
      <TagFilter tags={allTags} selectedTags={selectedTags} onToggle={handleToggle} />

      <div className="flex flex-col">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const href = post.externalLink ?? `/devlog/${post.slug}`;
            const isExternal = Boolean(post.externalLink);
            return (
              <article
                key={post.slug}
                className="group relative px-1 py-6 border-b border-[var(--border-muted)]"
              >
                <Link
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  aria-label={`${post.title} 보기`}
                  className="absolute inset-0 z-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                />

                <div className="relative z-10 pointer-events-none w-full flex flex-col sm:flex-row gap-5 md:gap-7">
                  <div className="relative w-full sm:w-[14.5rem] md:w-[17.5rem] lg:w-[19.5rem] aspect-[21/9] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] flex-shrink-0">
                    {post.thumbnail ? (
                      <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 320px, 384px"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-soft)] opacity-40 gap-2">
                        <Terminal size={24} strokeWidth={1.5} />
                        <span className="text-[10px] uppercase tracking-tighter font-bold">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-soft)] uppercase tracking-wider">
                          <time dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString("ko-KR", { year: 'numeric', month: 'long', day: 'numeric' })}
                          </time>
                          <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                          <span>{post.source === "velog" ? "Velog" : "Local"}</span>
                        </div>

                        <h2 className="text-2xl font-bold group-hover:text-[var(--accent-strong)] transition-colors leading-tight">
                          {post.title}
                        </h2>

                        <p className="text-[var(--text-muted)] leading-relaxed line-clamp-2 md:line-clamp-3">
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
                                  onClick={() => handleToggle(tag)}
                                  className={
                                    [
                                      "pointer-events-auto",
                                      !isActive ? "group-hover:border-[var(--text-soft)] group-hover:text-[var(--foreground)]" : undefined,
                                    ].filter(Boolean).join(" ")
                                  }
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
          })
        ) : (
          <div className="py-20 text-center">
            <p className="text-[var(--text-muted)]">No posts found matching the selected tags.</p>
          </div>
        )}
      </div>
    </div>
  );
}
