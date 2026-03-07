import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getPost } from "../../lib/posts";
import { getAllDevlogs } from "../../lib/devlog";
import { createPageMetadata } from "../../lib/metadata";
import TagBadge from "../../components/ui/TagBadge";

type Params = {
  slug: string;
};

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getAllDevlogs().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const resolved = await params;
  const post = getPost(resolved.slug);
  if (!post) {
    return {
      title: "Devlog",
    };
  }

  const publishedTime = post.date ? new Date(post.date).toISOString() : undefined;

  return createPageMetadata({
    title: post.title,
    description: post.description,
    path: `/devlog/${post.slug}`,
    keywords: post.tags,
    type: "article",
    images: post.thumbnail ? [{ url: post.thumbnail, alt: post.title }] : undefined,
    publishedTime,
  });
}

export default async function DevlogDetailPage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const post = getPost(resolved.slug);
  if (!post) return notFound();

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-500 pb-20">
      <Link
        href="/devlog"
        className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
      >
        ← Back to Devlog
      </Link>

      <article className="space-y-10">
        <header className="space-y-6 border-b border-[var(--border)] pb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-mono text-[var(--text-soft)] uppercase tracking-wider">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("ko-KR", { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{post.title}</h1>
          </div>

          {post.description && (
            <p className="text-xl text-[var(--text-muted)] leading-relaxed max-w-3xl">
              {post.description}
            </p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <TagBadge
                  key={tag}
                  label={tag}
                  size="sm"
                  href={`/devlog?tag=${encodeURIComponent(tag)}`}
                />
              ))}
            </div>
          )}
        </header>

        {post.thumbnail && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-subtle)]">
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="prose prose-zinc dark:prose-invert max-w-none text-lg leading-relaxed text-[var(--text-muted)]">
          {post.content
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
        </div>
      </article>
    </div>
  );
}
