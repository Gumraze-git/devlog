import fs from "node:fs/promises";
import path from "node:path";

function printUsage() {
  console.log("Usage: npm run import:velog -- <velog-url> [--dry-run] [--force]");
}

function escapeYamlString(value) {
  return JSON.stringify(value ?? "");
}

function sanitizeSlug(value) {
  return value
    .normalize("NFC")
    .trim()
    .replace(/[\\/:*?\"<>|]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    || "velog-post";
}

function parseArgs(argv) {
  const flags = new Set(argv.filter((arg) => arg.startsWith("--")));
  const url = argv.find((arg) => !arg.startsWith("--"));
  return {
    url,
    dryRun: flags.has("--dry-run"),
    force: flags.has("--force"),
  };
}

function normalizeVelogUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.hostname !== "velog.io") {
    throw new Error("Only velog.io URLs are supported.");
  }

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length < 2) {
    throw new Error("Expected a Velog post URL like https://velog.io/@user/post-slug");
  }

  const username = segments[0].startsWith("@") ? segments[0] : `@${segments[0]}`;
  const urlSlug = decodeURIComponent(segments.at(-1));
  return {
    username,
    urlSlug,
    canonicalUrl: `https://velog.io/${username}/${encodeURIComponent(urlSlug)}`,
  };
}

function extractApolloState(html) {
  const match = html.match(/window\.__APOLLO_STATE__=({[\s\S]*?});<\/script>/);
  if (!match?.[1]) {
    throw new Error("Could not find __APOLLO_STATE__ in the Velog page.");
  }

  return JSON.parse(match[1]);
}

function findPostEntity(apolloState) {
  const postEntry = Object.entries(apolloState).find(([key, value]) => key.startsWith("Post:") && value && typeof value === "object");
  if (!postEntry) {
    throw new Error("Could not locate post data in __APOLLO_STATE__.");
  }

  return postEntry[1];
}

function stripMarkdownForDescription(value) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBodyMarkdown(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/<p[^>]*>\s*<img[^>]+src=["']([^"']+)["'][^>]*>\s*<\/p>/gi, "\n![]($1)\n")
    .replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, "![]($1)")
    .replace(/<br\s*\/?>/gi, "\n")
    .trim();
}

function createFrontMatter(post, canonicalUrl, slug) {
  const description =
    (typeof post.short_description === "string" && post.short_description.trim().length > 0
      ? post.short_description.trim()
      : stripMarkdownForDescription(post.body ?? "").slice(0, 180).trim());
  const tags = Array.isArray(post.tags?.json) ? post.tags.json : [];
  const lines = [
    "---",
    `title: ${escapeYamlString(post.title ?? slug)}`,
    `slug: ${escapeYamlString(slug)}`,
    `description: ${escapeYamlString(description)}`,
    `date: ${escapeYamlString(post.released_at ?? new Date().toISOString())}`,
    `thumbnail: ${escapeYamlString(post.thumbnail ?? "/devlog-placeholder.svg")}`,
    "tags:",
    ...(tags.length > 0 ? tags.map((tag) => `  - ${escapeYamlString(String(tag))}`) : ["  - misc"]),
    "published: true",
    `velog_url: ${escapeYamlString(canonicalUrl)}`,
    "---",
    "",
  ];

  return lines.join("\n");
}

async function fetchVelogPost(rawUrl) {
  const { canonicalUrl } = normalizeVelogUrl(rawUrl);
  const res = await fetch(canonicalUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch Velog post: ${res.status}`);
  }

  const html = await res.text();
  const apolloState = extractApolloState(html);
  const post = findPostEntity(apolloState);
  return { canonicalUrl, post };
}

async function main() {
  const { url, dryRun, force } = parseArgs(process.argv.slice(2));

  if (!url) {
    printUsage();
    process.exit(1);
  }

  const { canonicalUrl, post } = await fetchVelogPost(url);
  const slug = sanitizeSlug(post.url_slug || post.title || "velog-post");
  const targetDir = path.join(process.cwd(), "posts", "devlog");
  const targetPath = path.join(targetDir, `${slug}.md`);
  const frontMatter = createFrontMatter(post, canonicalUrl, slug);
  const body = normalizeBodyMarkdown(post.body);
  const fileContent = `${frontMatter}${body}\n`;

  if (dryRun) {
    console.log(`Target: ${targetPath}`);
    console.log(fileContent);
    return;
  }

  await fs.mkdir(targetDir, { recursive: true });

  try {
    await fs.access(targetPath);
    if (!force) {
      throw new Error(`File already exists: ${targetPath}. Use --force to overwrite.`);
    }
  } catch (error) {
    if (error && error.code !== "ENOENT") {
      throw error;
    }
  }

  await fs.writeFile(targetPath, fileContent, "utf8");
  console.log(`Imported Velog post into ${targetPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
