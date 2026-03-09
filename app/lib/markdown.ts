export type HeadingItem = {
  depth: number;
  text: string;
  slug: string;
};

type HeadingWithLine = HeadingItem & {
  line: number;
};

export type CodeBlock = {
  lang: string;
  code: string;
};

export type ProjectContentSection = {
  title: string;
  slug: string;
  content: string;
};

export type TroubleKey = "title" | "problem" | "cause" | "solution" | "result";
export type TroubleContent = Partial<Record<TroubleKey, string>>;

export type TroubleshootingCase = {
  id: string;
  title: string;
  problem?: string;
  cause?: string;
  solution?: string;
  result?: string;
};

export type TroubleshootingTabContent = {
  introContent: string;
  cases: TroubleshootingCase[];
};

const troubleKeyMap: Record<string, TroubleKey> = {
  title: "title",
  제목: "title",
  problem: "problem",
  issue: "problem",
  문제: "problem",
  cause: "cause",
  reason: "cause",
  원인: "cause",
  solution: "solution",
  fix: "solution",
  해결: "solution",
  result: "result",
  outcome: "result",
  impact: "result",
  결과: "result",
};

export const TROUBLE_ROWS: Array<{ key: Exclude<TroubleKey, "title">; label: string }> = [
  { key: "problem", label: "문제" },
  { key: "cause", label: "원인" },
  { key: "solution", label: "해결" },
  { key: "result", label: "결과" },
];

const TROUBLE_SUMMARY_LIMIT = 70;

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

function parseHeadingsWithLine(content: string): HeadingWithLine[] {
  const headings: HeadingWithLine[] = [];
  const slugger = createSlugger();
  const lines = content.split("\n");
  let inCodeBlock = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
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
      line: index + 1,
    });
  }

  return headings;
}

function trimEdgeEmptyLines(lines: string[]): string[] {
  const next = [...lines];
  while (next.length > 0 && next[0].trim().length === 0) next.shift();
  while (next.length > 0 && next[next.length - 1].trim().length === 0) next.pop();
  return next;
}

function normalizeTroubleLabel(raw: string): TroubleKey | undefined {
  const key = raw.trim().replace(/\*\*/g, "").toLowerCase();
  return troubleKeyMap[key];
}

function createTroubleSectionStore() {
  return {
    title: [] as string[],
    problem: [] as string[],
    cause: [] as string[],
    solution: [] as string[],
    result: [] as string[],
  };
}

function stripMarkdownForSummary(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripSectionOrdinal(text: string): string {
  const stripped = text.replace(/^\d+(?:\.\d+)*\s*(?:[.)-]\s*)?/, "").trim();
  return stripped || text;
}

export function extractHeadings(content: string): HeadingItem[] {
  return parseHeadingsWithLine(content).map(({ depth, text, slug }) => ({
    depth,
    text,
    slug,
  }));
}

export function extractHeadingSlugByLine(content: string): Map<number, string> {
  return new Map(
    parseHeadingsWithLine(content).map((heading) => [heading.line, heading.slug]),
  );
}

export function splitMarkdownIntoSections(content: string): ProjectContentSection[] {
  const headings = parseHeadingsWithLine(content);
  if (headings.length === 0) return [];

  const minDepth = Math.min(...headings.map((heading) => heading.depth));
  const topHeadings = headings.filter((heading) => heading.depth === minDepth);
  if (topHeadings.length === 0) return [];

  const lines = content.split("\n");

  return topHeadings.map((heading, index) => {
    const nextHeadingLine = topHeadings[index + 1]?.line ?? lines.length + 1;
    const sectionLines = trimEdgeEmptyLines(lines.slice(heading.line, nextHeadingLine - 1));

    return {
      title: stripSectionOrdinal(heading.text),
      slug: heading.slug,
      content: sectionLines.join("\n"),
    };
  });
}

export function parseTroubleshootingContent(source: string): TroubleContent {
  const sections = createTroubleSectionStore();
  let currentKey: TroubleKey | null = null;
  let inBacktickCodeFence = false;

  const append = (key: TroubleKey, line: string) => {
    sections[key].push(line);
  };

  for (const rawLine of source.split("\n")) {
    const trimmed = rawLine.trim();
    const fenceMatch = /^>*\s*```/.exec(trimmed);

    if (fenceMatch) {
      if (!currentKey) currentKey = "problem";
      append(currentKey, rawLine);
      inBacktickCodeFence = !inBacktickCodeFence;
      continue;
    }

    if (!inBacktickCodeFence) {
      const labelMatch = /^(?:\*\*)?([A-Za-z가-힣]+)(?:\*\*)?\s*[:：]\s*(.*)$/.exec(trimmed);
      if (labelMatch) {
        const mapped = normalizeTroubleLabel(labelMatch[1]);
        if (mapped) {
          currentKey = mapped;
          if (labelMatch[2].length > 0) {
            append(mapped, labelMatch[2]);
          }
          continue;
        }
      }
    }

    if (!currentKey) {
      if (trimmed.length === 0) continue;
      currentKey = "problem";
    }

    append(currentKey, rawLine);
  }

  const result: TroubleContent = {};
  (Object.keys(sections) as TroubleKey[]).forEach((key) => {
    const cleaned = trimEdgeEmptyLines(sections[key]);
    if (cleaned.length > 0) {
      result[key] = cleaned.join("\n");
    }
  });

  return result;
}

export function buildTroubleSummary(sections: TroubleContent): string {
  if (sections.title) {
    return stripInlineMarkdown(sections.title) || "트러블슈팅 펼쳐보기";
  }

  if (sections.problem) {
    const plain = stripMarkdownForSummary(sections.problem);
    if (plain.length <= TROUBLE_SUMMARY_LIMIT) return plain;
    return `${plain.slice(0, TROUBLE_SUMMARY_LIMIT - 3).trimEnd()}...`;
  }

  return "트러블슈팅 펼쳐보기";
}

function replaceArrowOutsideInlineCode(line: string): string {
  let output = "";
  let cursor = 0;

  while (cursor < line.length) {
    const tickStart = line.indexOf("`", cursor);
    if (tickStart === -1) {
      output += line.slice(cursor).replace(/->/g, "→");
      break;
    }

    output += line.slice(cursor, tickStart).replace(/->/g, "→");

    let tickCount = 1;
    while (tickStart + tickCount < line.length && line[tickStart + tickCount] === "`") {
      tickCount += 1;
    }

    const delimiter = "`".repeat(tickCount);
    const tickEnd = line.indexOf(delimiter, tickStart + tickCount);
    if (tickEnd === -1) {
      output += line.slice(tickStart);
      break;
    }

    output += line.slice(tickStart, tickEnd + tickCount);
    cursor = tickEnd + tickCount;
  }

  return output;
}

export function normalizeArrowNotation(source: string): string {
  const lines = source.split("\n");
  let inCodeFence = false;
  let fenceChar: "`" | "~" | "" = "";
  let fenceLength = 0;

  const transformed = lines.map((line) => {
    const trimmedStart = line.trimStart();
    const fenceMatch = /^(`{3,}|~{3,})/.exec(trimmedStart);

    if (fenceMatch) {
      const marker = fenceMatch[1];
      const markerChar = marker[0] as "`" | "~";
      const markerLength = marker.length;

      if (!inCodeFence) {
        inCodeFence = true;
        fenceChar = markerChar;
        fenceLength = markerLength;
        return line;
      }

      if (markerChar === fenceChar && markerLength >= fenceLength) {
        inCodeFence = false;
        fenceChar = "";
        fenceLength = 0;
        return line;
      }
    }

    if (inCodeFence) {
      return line;
    }

    return replaceArrowOutsideInlineCode(line);
  });

  return transformed.join("\n");
}

function extractTroubleshootingBlocks(content: string): {
  introContent: string;
  caseSources: string[];
} {
  const introLines: string[] = [];
  const caseSources: string[] = [];
  const lines = content.split("\n");
  let inTroubleshootingBlock = false;
  let activeFence = "";
  let currentBlock: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!inTroubleshootingBlock) {
      const startMatch = /^(~~~|```)\s*(troubleshooting|trouble|troubleshoot)\s*$/.exec(trimmed);
      if (startMatch) {
        inTroubleshootingBlock = true;
        activeFence = startMatch[1];
        currentBlock = [];
        continue;
      }

      if (caseSources.length === 0) {
        introLines.push(line);
      }
      continue;
    }

    const endMatch = /^(~~~|```)\s*$/.exec(trimmed);
    if (endMatch && endMatch[1] === activeFence) {
      caseSources.push(currentBlock.join("\n"));
      inTroubleshootingBlock = false;
      activeFence = "";
      currentBlock = [];
      continue;
    }

    currentBlock.push(line);
  }

  if (inTroubleshootingBlock && currentBlock.length > 0) {
    caseSources.push(currentBlock.join("\n"));
  }

  return {
    introContent: trimEdgeEmptyLines(introLines).join("\n"),
    caseSources,
  };
}

export function parseTroubleshootingTabContent(content: string): TroubleshootingTabContent {
  const { introContent, caseSources } = extractTroubleshootingBlocks(content);
  const slugger = createSlugger();

  const cases = caseSources.map((source, index) => {
    const parsed = parseTroubleshootingContent(source);
    const fallbackTitle = `트러블슈팅 ${index + 1}`;
    const title = parsed.title ? stripInlineMarkdown(parsed.title) || fallbackTitle : fallbackTitle;

    return {
      id: `trouble-${slugger(title)}`,
      title,
      problem: parsed.problem,
      cause: parsed.cause,
      solution: parsed.solution,
      result: parsed.result,
    };
  });

  return {
    introContent,
    cases,
  };
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
