import Parser from "rss-parser";

export type VelogPost = {
  title: string;              // 제목
  link: string;               // 링크
  pubDate: string;            // 게시일
  contentSnippet?: string;    // 글 요약
  categories?: string[];      // 태그 배열
}

export async function fetchVelogRSS(username: string): Promise<VelogPost[]> {
  const parser = new Parser();

  // Velog RSS URL
  const RSS_URL =`https://velog.io/rss/@${username}`;

  // RSS 파싱
  const feed = await parser.parseURL(RSS_URL);

  // 필요한 필드만 변환하여 반환
  return feed.items.map((item) => ({
    title: item.title ?? "",
    link: item.link ?? "",
    pubDate: item.pubDate ?? "",
    contentSnippet: item.contentSnippet ?? "",
    categories: item.categories ?? [],
  }))

}