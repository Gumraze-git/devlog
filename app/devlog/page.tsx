import { getAllPosts } from "../lib/posts";
import OverlayCard from "../components/ui/OverlayCard";

export const dynamic = "force-dynamic";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR").replace(/\s/g, "").replace(/\.$/, "");
}

export default function DevlogListPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-16">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">Devlog</p>
        <h1 className="text-4xl font-bold text-[var(--foreground)]">모든 개발 일지</h1>
        <p className="text-[var(--text-muted)]">최신순으로 정렬된 전체 Devlog 목록입니다.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <OverlayCard
            key={post.slug}
            href={`/devlog/${post.slug}`}
            title={post.title}
            date={formatDate(post.date)}
            thumbnail={post.thumbnail}
            ariaLabel={`Devlog ${post.title}`}
            ctaLabel="자세히 보기"
          />
        ))}
      </div>
    </main>
  );
}
