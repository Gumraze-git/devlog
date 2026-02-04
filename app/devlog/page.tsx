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

export default async function DevlogListPage({ searchParams }: PageProps) {
  const username = process.env.VELOG_USERNAME ?? process.env.NEXT_PUBLIC_VELOG_USERNAME ?? "gumraze";
  const posts = await getAllPostsWithVelog({ includeVelog: true, username });

  const resolvedSearchParams = await searchParams;
  const currentTag = resolvedSearchParams.tag;
  const selectedTags = currentTag ? currentTag.split(",").filter(Boolean) : [];

  // Extract unique tags
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags || []))).sort();

  return (
    <div className="space-y-1 animate-in fade-in duration-500 pb-20">
      <header className="border-b border-[var(--border-muted)] pb-12 -mx-4 px-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          Devlog<span className="text-[var(--text-muted)] font-medium text-2xl sm:text-3xl ml-3">: 경험을 지식으로</span>
        </h1>
      </header>

      <DevlogListClient posts={posts} allTags={allTags} initialSelectedTags={selectedTags} />
    </div>
  );
}
