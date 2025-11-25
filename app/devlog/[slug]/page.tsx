import { use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getPost } from "../../lib/posts";

type Params = {
  slug: string;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default function DevlogDetailPage({ params }: { params: Promise<Params> }) {
  const resolved = use(params);
  const post = getPost(resolved.slug);
  if (!post) return notFound();

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-16">
      <Link href="/devlog" className="text-sm font-semibold text-[var(--accent-strong)]">
        ← 목록으로
      </Link>

      <article className="space-y-6">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">
            {new Date(post.date).toLocaleDateString("ko-KR")}
          </p>
          <h1 className="text-4xl font-bold text-[var(--foreground)]">{post.title}</h1>
          <p className="text-lg text-[var(--text-muted)]">{post.description}</p>
        </header>

        {post.thumbnail && (
          <div className="relative h-72 overflow-hidden rounded-3xl bg-[var(--card-subtle)]">
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              sizes="800px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <section className="prose prose-slate max-w-none dark:prose-invert">
          {post.content
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
        </section>
      </article>
    </main>
  );
}
