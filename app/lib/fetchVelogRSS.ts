import Parser from "rss-parser";

export type VelogPost = {
  title: string;              // 제목
  link: string;               // 링크
  pubDate: string;            // 게시일
  contentSnippet?: string;    // 글 요약
  categories?: string[];      // 태그 배열
  thumbnail?: string;         // 썸네일(있다면)
  content?: string;           // 본문(HTML)
}

export async function fetchVelogRSS(username: string): Promise<VelogPost[]> {
  const parser = new Parser();
  // Velog RSS는 v2 서브도메인 사용: https://v2.velog.io/rss/{username}
  const RSS_URL = `https://v2.velog.io/rss/${username}`;

  // revalidate 캐싱 적용
  const res = await fetch(RSS_URL, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`Failed to fetch Velog RSS: ${res.status}`);
  const xml = await res.text();
  const feed = await parser.parseString(xml);

  return feed.items.map((item: any) => ({
    title: item.title ?? "",
    link: item.link ?? "",
    pubDate: item.pubDate ?? "",
    contentSnippet: item.contentSnippet ?? "",
    categories: item.categories ?? [],
    thumbnail: (item as any).thumbnail ?? undefined,
    content: (item as any)["content:encoded"] ?? item.content ?? "",
  }));
}

// Velog 포스트를 카드/Devlog 형태로 매핑하기 위한 헬퍼
export type VelogCardData = {
  slug: string;
  title: string;
  description: string;
  date: string;
  thumbnail?: string;
  tags?: string[];
  link: string;
};

function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"'>\s]+)["']/i);
  return match ? match[1] : null;
}

function stripHtmlAndTrim(html: string, maxLen = 140): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}

function normalizeUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}

function extractSlugFromLink(link: string): string | null {
  try {
    const url = new URL(link);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.at(-1) ?? null;
  } catch {
    return null;
  }
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "velog-post";
}

export function mapVelogToCard(post: VelogPost, index = 0): VelogCardData {
  const fallbackSlug = slugify(post.title || `velog-${index}`);
  const slug = extractSlugFromLink(post.link) ?? fallbackSlug;
  const thumbnailFromContent = extractFirstImage(post.content ?? "");
  const description =
    (post.contentSnippet && post.contentSnippet.trim().length > 0)
      ? post.contentSnippet
      : stripHtmlAndTrim(post.content ?? "");

  return {
    slug,
    title: post.title || slug,
    description,
    date: post.pubDate ?? "",
    thumbnail: normalizeUrl(post.thumbnail ?? thumbnailFromContent ?? undefined),
    tags: post.categories,
    link: post.link,
  };
}

export async function fetchVelogOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const html = await res.text();
    const metaMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"'>]+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"'>]+)["'][^>]+property=["']og:image["']/i)
      ?? html.match(/<meta[^>]+name=["']og:image["'][^>]+content=["']([^"'>]+)["']/i);
    return normalizeUrl(metaMatch ? metaMatch[1] : null);
  } catch {
    return null;
  }
}
