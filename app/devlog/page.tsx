import Link from "next/link";
import Image from "next/image";

import { getAllPosts } from "../lib/posts";

export const dynamic = "force-dynamic";

export default function DevlogListPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-16">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">Devlog</p>
        <h1 className="text-4xl font-bold text-[var(--foreground)]">모든 개발 일지</h1>
        <p className="text-[var(--text-muted)]">최신순으로 정렬된 전체 Devlog 목록입니다.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/devlog/${post.slug}`}
            className="group block overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-40 overflow-hidden bg-[var(--card-subtle)]">
              <Image
                src={post.thumbnail ?? "/devlog-placeholder.svg"}
                alt={post.title}
                fill
                sizes="400px"
                className="object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="space-y-2 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">
                {new Date(post.date).toLocaleDateString("ko-KR")}
              </p>
              <h2 className="text-lg font-semibold text-[var(--foreground)] line-clamp-2">{post.title}</h2>
              <p className="text-sm text-[var(--text-muted)] line-clamp-2">{post.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
