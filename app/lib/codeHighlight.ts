import { bundledLanguages, codeToHtml } from "shiki";
import { createCodeKey, extractCodeBlocks } from "./markdown";

const codeHtmlCache = new Map<string, string>();
const shikiThemes = { light: "github-dark-high-contrast", dark: "github-dark-high-contrast" } as const;
const shikiFallbackLang = "md";
const shikiBundledLangSet = new Set<string>(Object.keys(bundledLanguages));
const troubleshootingLangs = new Set(["troubleshooting", "trouble", "troubleshoot"]);
const customRenderedLangs = new Set([
  "mermaid",
  "chips",
  "chip",
  "steps",
  "step",
  "reflections",
  "reflection",
  ...troubleshootingLangs,
]);

function resolveShikiLang(lang: string): string {
  const normalized = lang.trim().toLowerCase();
  if (!normalized) return shikiFallbackLang;

  const alias =
    normalized === "text" ||
    normalized === "txt" ||
    normalized === "plain" ||
    normalized === "plaintext"
      ? shikiFallbackLang
      : normalized;

  return shikiBundledLangSet.has(alias) ? alias : shikiFallbackLang;
}

function extractBacktickCodeBlocks(source: string): Array<{ lang: string; code: string }> {
  const blocks: Array<{ lang: string; code: string }> = [];
  const lines = source.split("\n");
  let inFence = false;
  let lang = "text";
  let buffer: string[] = [];
  let quoteDepth = 0;

  const parseFenceLine = (line: string) => {
    const quotedMatch = /^(>\s*)+```(.*)$/.exec(line.trim());
    if (quotedMatch) {
      const quotePrefix = quotedMatch[0].slice(0, quotedMatch[0].indexOf("```"));
      const depth = (quotePrefix.match(/>/g) ?? []).length;
      return {
        info: quotedMatch[2].trim(),
        quoteDepth: depth,
      };
    }

    const plainMatch = /^```(.*)$/.exec(line.trim());
    if (plainMatch) {
      return {
        info: plainMatch[1].trim(),
        quoteDepth: 0,
      };
    }

    return null;
  };

  const stripQuotedPrefix = (line: string, depth: number) => {
    if (depth === 0) return line;

    let next = line;
    for (let i = 0; i < depth; i += 1) {
      next = next.replace(/^\s*>\s?/, "");
    }
    return next;
  };

  for (const line of lines) {
    const fenceLine = parseFenceLine(line);

    if (!inFence) {
      if (!fenceLine) continue;
      inFence = true;
      quoteDepth = fenceLine.quoteDepth;
      const token = fenceLine.info.split(/\s+/)[0] ?? "";
      lang = token.replace(/^language-/, "") || "text";
      buffer = [];
      continue;
    }

    if (fenceLine && fenceLine.quoteDepth === quoteDepth) {
      blocks.push({ lang, code: buffer.join("\n").replace(/\n$/, "") });
      inFence = false;
      lang = "text";
      buffer = [];
      quoteDepth = 0;
      continue;
    }

    buffer.push(stripQuotedPrefix(line, quoteDepth));
  }

  return blocks;
}

async function highlightCode(code: string, lang: string) {
  const safeLang = resolveShikiLang(lang);
  try {
    return await codeToHtml(code, { lang: safeLang, themes: shikiThemes });
  } catch {
    return await codeToHtml(code, { lang: shikiFallbackLang, themes: shikiThemes });
  }
}

export async function buildCodeHtmlByKey(content: string): Promise<Record<string, string>> {
  const blocks = extractCodeBlocks(content).flatMap((block) => {
    const normalizedLang = block.lang.trim().toLowerCase();

    if (troubleshootingLangs.has(normalizedLang)) {
      return extractBacktickCodeBlocks(block.code).filter((innerBlock) => {
        const innerLang = innerBlock.lang.trim().toLowerCase();
        return !customRenderedLangs.has(innerLang);
      });
    }

    if (customRenderedLangs.has(normalizedLang)) {
      return [];
    }

    return [block];
  });

  if (blocks.length === 0) return {};

  const entries = await Promise.all(
    blocks.map(async (block) => {
      const lang = block.lang && block.lang.trim().length > 0 ? block.lang : "text";
      const key = createCodeKey(lang, block.code);
      const cached = codeHtmlCache.get(key);
      if (cached) return [key, cached] as const;
      const html = await highlightCode(block.code, lang);
      codeHtmlCache.set(key, html);
      return [key, html] as const;
    }),
  );

  return Object.fromEntries(entries);
}
