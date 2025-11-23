"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";

import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";
import { type PostMeta } from "../lib/posts";

type DevlogSectionClientProps = {
  posts: PostMeta[];
};

export default function DevlogSectionClient({ posts }: DevlogSectionClientProps) {
  const [selected, setSelected] = useState<PostMeta | null>(null);

  return (
    <SectionWatcher id="devlog" className="scroll-mt-32">
      <SlideUpInView>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">Devlog</p>
              <h2 className="text-3xl font-bold text-[var(--foreground)]">개발 일지</h2>
              <p className="mt-2 text-[var(--text-muted)]">실험, 트러블슈팅, 발표 내용 등을 Devlog에 기록합니다.</p>
            </div>
            <Link
              href="/devlog"
              className="rounded-full border border-[var(--border)] bg-[var(--card-muted)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
            >
              모든 게시글 보기
            </Link>
          </div>

          <div className="no-scrollbar flex gap-4 overflow-x-auto overflow-y-visible pb-4 pt-2 px-2">
            {posts.map((post) => (
              <button
                key={post.slug}
                onClick={() => setSelected(post)}
                className="relative min-w-[300px] max-w-[320px] flex-shrink-0 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-sm transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg hover:z-10"
              >
                <div className="relative h-40 overflow-hidden rounded-2xl bg-[var(--card-subtle)]">
                  <Image
                    src={post.thumbnail ?? "/devlog-placeholder.svg"}
                    alt={post.title}
                    fill
                    sizes="320px"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] line-clamp-2">{post.description}</p>
                  <p className="text-xs text-[var(--text-soft)]">
                    작성일 {new Date(post.date).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </SlideUpInView>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[var(--card)] p-6 shadow-2xl border border-[var(--border)]">
            <button
              className="absolute right-4 top-4 text-[var(--text-soft)]"
              onClick={() => setSelected(null)}
              aria-label="닫기"
            >
              <X size={20} />
            </button>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">
                {new Date(selected.date).toLocaleDateString("ko-KR")}
              </p>
              <h3 className="text-2xl font-bold text-[var(--foreground)]">{selected.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{selected.description}</p>
              <div className="relative h-48 overflow-hidden rounded-2xl bg-[var(--card-subtle)]">
                <Image
                  src={selected.thumbnail ?? "/devlog-placeholder.svg"}
                  alt={selected.title}
                  fill
                  sizes="600px"
                  className="object-cover"
                />
              </div>
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
