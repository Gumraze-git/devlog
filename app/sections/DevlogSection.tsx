import DevlogSectionClient from "./DevlogSectionClient";
import { getAllPostsWithVelog } from "../lib/posts";

export default async function DevlogSection() {
  const username = process.env.VELOG_USERNAME ?? process.env.NEXT_PUBLIC_VELOG_USERNAME ?? "gumraze";
  const posts = await getAllPostsWithVelog({ includeVelog: true, username });
  return <DevlogSectionClient posts={posts} />;
}
