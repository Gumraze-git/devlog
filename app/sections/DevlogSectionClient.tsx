"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";
import OverlayCard from "../components/ui/OverlayCard";
import { type Post } from "../lib/posts";

type DevlogSectionClientProps = {
  posts: Post[];
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR").replace(/\s/g, "").replace(/\.$/, "");
}

export default function DevlogSectionClient({ posts }: DevlogSectionClientProps) {
  const [selected, setSelected] = useState<Post | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 3;

  const cards = useMemo(
    () =>
      posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        summary: post.description,
        meta: formatDate(post.date),
        thumbnail: post.thumbnail,
        tags: post.tags,
      })),
    [posts],
  );

  const totalPages = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages - 1) setPage(0);
  }, [page, totalPages]);

  const visibleCards = cards.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const canNext = page < totalPages - 1 && cards.length > PAGE_SIZE;

  return (
    <SectionWatcher id="devlog" className="scroll-mt-24 md:scroll-mt-32">
      <SlideUpInView>
        <div className="space-y-6 md:space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">Devlog</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">개발 일지</h2>
              <p className="mt-2 text-sm md:text-base text-[var(--text-muted)]">실험, 트러블슈팅, 발표 내용 등을 Devlog에 기록합니다.</p>
            </div>
          </div>

          <div className="relative">
            {cards.length > PAGE_SIZE && (
              <div className="absolute bottom-2 right-2 z-10 flex gap-2">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-muted)]/85 text-sm font-semibold text-[var(--foreground)] backdrop-blur transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0}
                  aria-label="이전 Devlog 3개 보기"
                >
                  &lt;
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-muted)]/85 text-sm font-semibold text-[var(--foreground)] backdrop-blur transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  disabled={!canNext}
                  aria-label="다음 Devlog 3개 보기"
                >
                  &gt;
                </button>
              </div>
            )}

            <div className="no-scrollbar flex gap-3 md:gap-4 overflow-x-auto overflow-y-visible pb-4 pt-2 px-1 md:px-2">
              {visibleCards.map((item) => (
                <OverlayCard
                  key={item.slug}
                  as="button"
                  title={item.title}
                  date={item.meta ?? ""}
                  thumbnail={item.thumbnail}
                  ariaLabel={`Devlog ${item.title}`}
                  onSelect={() => {
                    const found = posts.find((p) => p.slug === item.slug);
                    if (found) setSelected(found);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </SlideUpInView>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div className="relative max-h-[85vh] w-full max-w-xl md:max-w-2xl overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6 shadow-2xl">
            <button
              className="absolute right-3 top-3 md:right-4 md:top-4 text-[var(--text-soft)] p-2"
              onClick={() => setSelected(null)}
              aria-label="닫기"
            >
              <X size={20} />
            </button>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">{formatDate(selected.date)}</p>
              <h3 className="text-xl md:text-2xl font-bold text-[var(--foreground)]">{selected.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{selected.description}</p>
              <div className="relative h-40 md:h-48 overflow-hidden rounded-2xl bg-[var(--card-subtle)]">
                <Image
                  src={selected.thumbnail ?? "/devlog-placeholder.svg"}
                  alt={selected.title}
                  fill
                  sizes="600px"
                  className="object-cover"
                />
              </div>
              {selected.content && (
                <div
                  className="prose prose-sm prose-invert text-[var(--text-muted)] max-w-none"
                  dangerouslySetInnerHTML={{ __html: selected.content }}
                />
              )}
              <Link
                href={`/devlog/${selected.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
              >
                자세히 보기
              </Link>
            </div>
          </div>
        </div>
      )}
    </SectionWatcher>
  );
}
