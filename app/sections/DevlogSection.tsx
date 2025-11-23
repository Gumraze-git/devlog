import Image from "next/image";

import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";
import { getAllPosts, type PostMeta } from "../lib/posts";

export default function DevlogSection() {
  const posts = getAllPosts();
  const sortedPosts: PostMeta[] = posts;

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
          </div>

          <div className="no-scrollbar flex gap-4 overflow-x-auto overflow-y-visible pb-4 pt-2 px-2">
            {sortedPosts.map((post) => (
              <article
                key={post.slug}
                className="relative min-w-[300px] max-w-[320px] flex-shrink-0 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg hover:z-10"
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
              </article>
            ))}
          </div>
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}
