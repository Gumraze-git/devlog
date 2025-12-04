import { fetchVelogOgImage, fetchVelogRSS, mapVelogToCard } from "./fetchVelogRSS";
import { getDevlog, type Devlog, type DevlogMeta } from "./devlog";

export type PostMeta = DevlogMeta & { externalLink?: string; source?: "local" | "velog" };
export type Post = Devlog & { externalLink?: string; source?: "local" | "velog" };

export const getPost = getDevlog;

const ogImageCache = new Map<string, Promise<string | undefined>>();

async function getCachedOgImage(url: string): Promise<string | undefined> {
  if (!url) return undefined;
  if (!ogImageCache.has(url)) {
    ogImageCache.set(url, fetchVelogOgImage(url));
  }
  return ogImageCache.get(url);
}

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
      const ogImage = card.thumbnail ? null : await getCachedOgImage(card.link);
      return {
        slug: `velog-${card.slug}`,
        title: card.title,
        description: card.description,
        date: card.date,
        thumbnail: card.thumbnail ?? ogImage ?? card.contentImage ?? "/devlog-placeholder.svg",
        tags: card.tags,
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
