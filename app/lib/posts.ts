import { fetchVelogOgMeta, fetchVelogRSS, mapVelogToCard } from "./fetchVelogRSS";
import { getDevlog, type Devlog, type DevlogMeta } from "./devlog";

export type PostMeta = DevlogMeta & { externalLink?: string; source?: "local" | "velog" };
export type Post = Devlog & { externalLink?: string; source?: "local" | "velog" };

export const getPost = getDevlog;

type OgMeta = { image?: string; description?: string; tags?: string[] };
const ogMetaCache = new Map<string, Promise<OgMeta>>();

async function getCachedOgMeta(url: string): Promise<OgMeta> {
  if (!url) return {};
  if (!ogMetaCache.has(url)) {
    ogMetaCache.set(url, fetchVelogOgMeta(url));
  }
  const meta = await ogMetaCache.get(url);
  return meta ?? {};
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
      const ogMeta = await getCachedOgMeta(card.link);
      const ogImage = ogMeta.image;
      const ogDescription = ogMeta.description;
      const ogTags = ogMeta.tags;
      const description = ogDescription || card.description || "";
      const tags = (ogTags && ogTags.length > 0)
        ? ogTags
        : (card.tags && card.tags.length > 0 ? card.tags : undefined);

      return {
        slug: `velog-${card.slug}`,
        title: card.title,
        description,
        date: card.date,
        // RSS 썸네일이 없더라도 항상 og:image를 시도해 우선 사용
        thumbnail: ogImage ?? card.thumbnail ?? card.contentImage ?? "/devlog-placeholder.svg",
        tags,
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
