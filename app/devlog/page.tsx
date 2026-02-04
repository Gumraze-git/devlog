import type { Metadata } from "next";
import { getAllPostsWithVelog } from "../lib/posts";
import DevlogListClient from "./DevlogListClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Devlog",
  description: "Velog 연동 개발 기록과 태그별 분류를 제공하는 Devlog 목록입니다.",
};

interface PageProps {
  searchParams: Promise<{ tag?: string }>;
}

import { Suspense } from "react";
import { Skeleton } from "../components/ui/Skeleton";

async function DevlogContent({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const username = process.env.VELOG_USERNAME ?? process.env.NEXT_PUBLIC_VELOG_USERNAME ?? "gumraze";
  const posts = await getAllPostsWithVelog({ includeVelog: true, username });

  const resolvedSearchParams = await searchParams;
  const currentTag = resolvedSearchParams.tag;
  const selectedTags = currentTag ? currentTag.split(",").filter(Boolean) : [];

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags || []))).sort();

  return <DevlogListClient posts={posts} allTags={allTags} initialSelectedTags={selectedTags} />;
}

function DevlogSkeleton() {
  return (
    <div className="space-y-12">
      {/* Tag Filter Skeleton */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-8 w-16 rounded-full" />
        ))}
      </div>

      {/* List Skeleton */}
      <div className="space-y-10 group">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="space-y-3 pb-10 border-b border-[var(--border-muted)]">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DevlogListPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Devlog</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          Experience to Knowledge
        </h1>
      </header>

      <Suspense fallback={<DevlogSkeleton />}>
        <DevlogContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
