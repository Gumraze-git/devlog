import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import MarkdownRenderer from "../../components/MarkdownRenderer";
import { DevlogDetailHeader } from "./DevlogDetailHeader";
import { createArticleJsonLd } from "../../lib/articleJsonLd";
import { buildCodeHtmlByKey } from "../../lib/codeHighlight";
import { getAllDevlogs } from "../../lib/devlog";
import { createPageMetadata } from "../../lib/metadata";
import { getPost } from "../../lib/posts";

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
  const codeHtmlByKey = await buildCodeHtmlByKey(post.content);
  const publishedTime = post.date ? new Date(post.date).toISOString() : new Date().toISOString();
  const articleJsonLd = createArticleJsonLd({
    title: post.title,
    description: post.description,
    path: `/devlog/${post.slug}`,
    datePublished: publishedTime,
    image: post.thumbnail,
    keywords: post.tags,
  });

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-500 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <Link
        href="/devlog"
        className="inline-flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
      >
        ← Back to Devlog
      </Link>

      <article className="space-y-10">
        <DevlogDetailHeader post={post} />

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

        <MarkdownRenderer
          content={post.content}
          codeHtmlByKey={codeHtmlByKey}
          className="max-w-none"
        />
      </article>
    </div>
  );
}
