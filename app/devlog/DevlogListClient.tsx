"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import TagFilter from "../components/TagFilter";
import { type Post } from "../lib/posts";
import { DevlogPostCard } from "./DevlogPostCard";
import { buildNextUrl, parseSelectedTags } from "./devlogUrlState";

export type DevlogListClientProps = {
  posts: Post[];
  allTags: string[];
};

export default function DevlogListClient({
  posts,
  allTags,
}: DevlogListClientProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredPosts = useMemo(() => {
    if (selectedTags.length === 0) return posts;
    return posts.filter((post) => post.tags?.some((tag) => selectedTags.includes(tag)));
  }, [posts, selectedTags]);

  const updateUrl = useCallback((tags: string[]) => {
    if (typeof window === "undefined") return;
    const nextUrl = buildNextUrl(window.location.pathname, window.location.search, tags);
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
          filteredPosts.map((post) => (
            <DevlogPostCard
              key={post.slug}
              post={post}
              selectedTags={selectedTags}
              onToggleTag={handleToggle}
            />
          ))
        ) : (
          <div className="py-20 text-center">
            <p className="text-[var(--text-muted)]">No posts found matching the selected tags.</p>
          </div>
        )}
      </div>
    </div>
  );
}
