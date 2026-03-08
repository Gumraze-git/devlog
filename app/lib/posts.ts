import { fetchVelogOgMeta, fetchVelogRSS, mapVelogToCard } from "./fetchVelogRSS";
import { getAllDevlogs, getDevlog, type Devlog, type DevlogMeta } from "./devlog";

export type PostMeta = DevlogMeta & { externalLink?: string; source?: "local" | "velog" };
export type Post = Devlog & { externalLink?: string; source?: "local" | "velog" };

export const getPost = getDevlog;

type OgMeta = { image?: string; description?: string; tags?: string[] };
const ogMetaCache = new Map<string, Promise<OgMeta>>();

function normalizeUrlKey(value?: string): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    url.hash = "";
    url.search = "";
    url.hostname = url.hostname.toLowerCase();
    return url.toString().replace(/\/+$/, "");
  } catch {
    return value.trim().replace(/\/+$/, "");
  }
}

async function getCachedOgMeta(url: string): Promise<OgMeta> {
  if (!url) return {};
  if (!ogMetaCache.has(url)) {
    ogMetaCache.set(url, fetchVelogOgMeta(url));
  }
  const meta = await ogMetaCache.get(url);
  return meta ?? {};
}

export async function getAllPostsWithVelog(opts?: {
  username?: string;
  includeVelog?: boolean;
  max?: number;
  includeOgMeta?: boolean;
}) {
  const base: Post[] = getAllDevlogs().map((post) => ({
    ...post,
    source: "local" as const,
  }));

  if (!opts?.includeVelog || !opts?.username) {
    const localOnly = base.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return opts?.max && opts.max > 0 ? localOnly.slice(0, opts.max) : localOnly;
  }

  const includeOgMeta = opts?.includeOgMeta ?? true;

  try {
    const velogPosts = await fetchVelogRSS(opts.username);
    const localVelogUrlKeys = new Set(
      base
        .map((post) => normalizeUrlKey(post.velogUrl))
        .filter((value): value is string => Boolean(value)),
    );
    const localSlugs = new Set(base.map((post) => post.slug));

    const mappedBase: Post[] = velogPosts.map((post, idx) => {
      const card = mapVelogToCard(post, idx);
      return {
        slug: card.slug,
        title: card.title,
        description: card.description || "",
        date: card.date,
        thumbnail: card.thumbnail ?? card.contentImage ?? "/devlog-placeholder.svg",
        tags: card.tags && card.tags.length > 0 ? card.tags : undefined,
        views: 0,
        published: true,
        content: "",
        externalLink: card.link,
        velogUrl: card.link,
        source: "velog" as const,
      };
    }).filter((post) => {
      const urlKey = normalizeUrlKey(post.externalLink);
      if (urlKey && localVelogUrlKeys.has(urlKey)) return false;
      return !localSlugs.has(post.slug);
    });

    const mapped = mappedBase;

    if (!includeOgMeta) {
      const merged = [...base, ...mapped].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return opts?.max && opts.max > 0 ? merged.slice(0, opts.max) : merged;
    }

    const enriched: Post[] = await Promise.all(
      mapped.map(async (post) => {
        const ogMeta = await getCachedOgMeta(post.externalLink ?? "");
        const ogImage = ogMeta.image;
        const ogDescription = ogMeta.description;
        const ogTags = ogMeta.tags;
        const description = ogDescription || post.description || "";
        const tags = (ogTags && ogTags.length > 0)
          ? ogTags
          : (post.tags && post.tags.length > 0 ? post.tags : undefined);

        return {
          ...post,
          description,
          tags,
          // RSS 썸네일이 없더라도 항상 og:image를 시도해 우선 사용
          thumbnail: ogImage ?? post.thumbnail ?? "/devlog-placeholder.svg",
        };
      })
    );

    const merged = [...base, ...enriched].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return opts?.max && opts.max > 0 ? merged.slice(0, opts.max) : merged;
  } catch {
    // Velog fetch 실패 시 로컬 포스트만 반환
    return opts?.max && opts.max > 0 ? base.slice(0, opts.max) : base;
  }
}
