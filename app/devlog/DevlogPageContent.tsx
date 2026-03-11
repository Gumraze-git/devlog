import { getAllPostsWithVelog } from "../lib/posts";
import DevlogListClient from "./DevlogListClient";

export async function DevlogPageContent() {
  const username = process.env.VELOG_USERNAME ?? process.env.NEXT_PUBLIC_VELOG_USERNAME ?? "gumraze";
  const posts = await getAllPostsWithVelog({ includeVelog: true, username });
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags || []))).sort();

  return <DevlogListClient posts={posts} allTags={allTags} />;
}
