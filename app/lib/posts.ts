import { fetchVelogOgImage, fetchVelogRSS, mapVelogToCard } from "./fetchVelogRSS";
import { getDevlog, type Devlog, type DevlogMeta } from "./devlog";

export type PostMeta = DevlogMeta & { externalLink?: string; source?: "local" | "velog" };
export type Post = Devlog & { externalLink?: string; source?: "local" | "velog" };

export const getPost = getDevlog;

export async function getAllPostsWithVelog(opts?: { username?: string; includeVelog?: boolean }) {
  // 로컬 포스트 사용하지 않음
  const base: Post[] = [];

  if (!opts?.includeVelog || !opts?.username) {
    return base;
  }

  try {
    const velogPosts = await fetchVelogRSS(opts.username);
    const mapped: Post[] = await Promise.all(velogPosts.map(async (post, idx) => {
      const card = mapVelogToCard(post, idx);
      const ogImage = card.thumbnail ? null : await fetchVelogOgImage(card.link);
      return {
        slug: `velog-${card.slug}`,
        title: card.title,
        description: card.description,
        date: card.date,
        thumbnail: card.thumbnail ?? ogImage ?? "/devlog-placeholder.svg",
        tags: card.tags ?? [],
        views: 0,
        published: true,
        content: "",
        externalLink: card.link,
        source: "velog",
      };
    }));

    return mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    // Velog fetch 실패 시 빈 배열 반환
    return base;
  }
}
