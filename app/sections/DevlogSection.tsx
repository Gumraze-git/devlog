import DevlogSectionClient from "./DevlogSectionClient";
import { getAllPosts } from "../lib/posts";

export default function DevlogSection() {
  const posts = getAllPosts();
  return <DevlogSectionClient posts={posts} />;
}
