export type HeadingItem = {
  depth: number;
  text: string;
  slug: string;
};

export type CodeBlock = {
  lang: string;
  code: string;
};

export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export function slugify(value: string): string {
  const cleaned = value
    .toLowerCase()
    .replace(/['"`]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || "section";
}

export function createSlugger() {
  const counts = new Map<string, number>();

  return (value: string) => {
    const base = slugify(value);
    const current = counts.get(base) ?? 0;
    counts.set(base, current + 1);
    if (current === 0) return base;
    return `${base}-${current}`;
  };
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

export function createCodeKey(lang: string, code: string): string {
  const normalizedLang = lang && lang.trim().length > 0 ? lang.trim() : "text";
  return `${normalizedLang}:${hashString(code)}`;
}

export function extractHeadings(content: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const slugger = createSlugger();
  const lines = content.split("\n");
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^```/.test(trimmed) || /^~~~/.test(trimmed)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    const match = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (!match) continue;

    const depth = match[1].length;
    const rawText = match[2].replace(/\s+#*\s*$/, "");
    const text = stripInlineMarkdown(rawText);
    if (!text) continue;

    headings.push({
      depth,
      text,
      slug: slugger(text),
    });
  }

  return headings;
}

export function extractCodeBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const lines = content.split("\n");
  let inCodeBlock = false;
  let fence = "";
  let lang = "";
  let buffer: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const fenceMatch = /^(~~~|```)(.*)$/.exec(trimmed);

    if (fenceMatch) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        fence = fenceMatch[1];
        const info = fenceMatch[2].trim();
        const token = info.split(/\s+/)[0] ?? "";
        lang = token.replace(/^language-/, "");
        buffer = [];
        continue;
      }

      if (fenceMatch[1] === fence) {
        const code = buffer.join("\n").replace(/\n$/, "");
        blocks.push({ lang, code });
        inCodeBlock = false;
        fence = "";
        lang = "";
        buffer = [];
        continue;
      }
    }

    if (inCodeBlock) {
      buffer.push(line);
    }
  }

  return blocks;
}
