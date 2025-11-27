import { getAllPostsWithVelog } from "../lib/posts";
import OverlayCard from "../components/ui/OverlayCard";

export const dynamic = "force-dynamic";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR").replace(/\s/g, "").replace(/\.$/, "");
}

export default async function DevlogListPage() {
  const username = process.env.VELOG_USERNAME ?? process.env.NEXT_PUBLIC_VELOG_USERNAME ?? "gumraze";
  const posts = await getAllPostsWithVelog({ includeVelog: true, username });
  const velogPosts = posts.filter((post) => post.source === "velog");
  const fillers =
    velogPosts.length < 3
      ? Array.from({ length: 3 - velogPosts.length }).map((_, idx) => ({ key: `placeholder-${idx}` }))
      : [];

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-16">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">Devlog</p>
        <h1 className="text-4xl font-bold text-[var(--foreground)]">모든 개발 일지</h1>
        <p className="text-[var(--text-muted)]">최신순으로 정렬된 전체 Devlog 목록입니다.</p>
      </header>

      {velogPosts.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-muted)] p-6 text-sm text-[var(--text-muted)]">
          Velog 포스트를 불러오지 못했어요. 네트워크 허용 후 새로고침 해주세요.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {velogPosts.map((post) => (
            <OverlayCard
              key={post.slug}
              href={post.externalLink ?? "#"}
              title={post.title}
              date={formatDate(post.date)}
              description={post.description}
              tags={post.tags}
              thumbnail={post.thumbnail}
              ariaLabel={`Velog ${post.title}`}
              ctaLabel="자세히 보기"
              target="_blank"
              rel="noopener noreferrer"
            />
          ))}
          {fillers.map((placeholder) => (
            <div
              key={placeholder.key}
              className="relative h-[13rem] md:h-[16rem] xl:h-[18rem] w-full rounded-lg md:rounded-xl border border-dashed border-[var(--border)] bg-[var(--card-muted)]/60 text-sm text-[var(--text-muted)] grid place-items-center"
              aria-hidden
            >
              준비 중
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
