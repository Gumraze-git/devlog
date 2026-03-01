"use client";

import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { createCodeKey, extractHeadingSlugByLine, slugify, stripInlineMarkdown } from "../lib/markdown";
import MermaidDiagram from "./MermaidDiagram";

interface MarkdownRendererProps {
    content: string;
    codeHtmlByKey?: Record<string, string>;
}

type TroubleKey = "title" | "problem" | "cause" | "solution" | "result";
type TroubleContent = Partial<Record<TroubleKey, string>>;

const troubleKeyMap: Record<string, TroubleKey> = {
    "title": "title",
    "제목": "title",
    "problem": "problem",
    "issue": "problem",
    "문제": "problem",
    "cause": "cause",
    "reason": "cause",
    "원인": "cause",
    "solution": "solution",
    "fix": "solution",
    "해결": "solution",
    "result": "result",
    "outcome": "result",
    "impact": "result",
    "결과": "result",
};

const troubleRows: Array<{ key: Exclude<TroubleKey, "title">; label: string }> = [
    { key: "problem", label: "문제" },
    { key: "cause", label: "원인" },
    { key: "solution", label: "해결" },
    { key: "result", label: "결과" },
];

const TROUBLE_SUMMARY_LIMIT = 70;

type PositionNode = {
    position?: {
        start?: {
            line?: number;
        };
        end?: {
            line?: number;
        };
    };
};

type MarkdownCodeProps = React.HTMLAttributes<HTMLElement> & {
    className?: string;
    children?: React.ReactNode;
    node?: PositionNode;
};

function isBlockCode(node: PositionNode | undefined, className: string | undefined, rawCode: string): boolean {
    const startLine = node?.position?.start?.line;
    const endLine = node?.position?.end?.line;
    if (typeof startLine === "number" && typeof endLine === "number") {
        return endLine > startLine;
    }

    if (/language-[\w-]+/.test(className || "")) {
        return true;
    }

    return rawCode.includes("\n");
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

function parseTroubleshootingContent(source: string): TroubleContent {
    const sections = createTroubleSectionStore();
    let currentKey: TroubleKey | null = null;
    let inBacktickCodeFence = false;

    const append = (key: TroubleKey, line: string) => {
        sections[key].push(line);
    };

    for (const rawLine of source.split("\n")) {
        const trimmed = rawLine.trim();
        const fenceMatch = /^```/.exec(trimmed);

        if (fenceMatch) {
            if (!currentKey) currentKey = "problem";
            append(currentKey, rawLine);
            inBacktickCodeFence = !inBacktickCodeFence;
            continue;
        }

        if (!inBacktickCodeFence) {
            const labelMatch = /^(?:[-*]\s*)?(?:\*\*)?([A-Za-z가-힣]+)(?:\*\*)?\s*[:：]\s*(.*)$/.exec(trimmed);
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

function buildTroubleSummary(sections: TroubleContent): string {
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

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, codeHtmlByKey }) => {
    const codeHtmlMap = codeHtmlByKey ?? {};
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const headingSlugByLine = useMemo(() => extractHeadingSlugByLine(content), [content]);

    const getTextContent = (children: React.ReactNode): string => {
        if (typeof children === "string" || typeof children === "number") {
            return String(children);
        }

        if (Array.isArray(children)) {
            return children.map((child) => getTextContent(child)).join("");
        }

        if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
            return getTextContent(children.props.children);
        }

        return "";
    };

    const copyToClipboard = async (value: string, key: string) => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(value);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = value;
                textarea.style.position = "fixed";
                textarea.style.left = "-9999px";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand("copy");
                textarea.remove();
            }
            setCopiedKey(key);
            window.setTimeout(() => setCopiedKey(null), 1200);
        } catch {
            setCopiedKey(null);
        }
    };

    function renderCode({
        className,
        children,
        node,
        ...props
    }: MarkdownCodeProps) {
        const match = /language-([\w-]+)/.exec(className || "");
        const lang = match ? match[1] : "text";
        const rawCode = String(children);
        const code = rawCode.replace(/\n$/, "");
        const isBlockCodeNode = isBlockCode(node, className, rawCode);
        const label = lang === "text" ? "TEXT" : lang.toUpperCase();

        if (isBlockCodeNode && lang === "mermaid") {
            return (
                <MermaidDiagram code={code} />
            );
        }

        if (isBlockCodeNode && (lang === "steps" || lang === "step")) {
            const steps = code
                .split("\n")
                .filter((line) => /^\d+\./.test(line.trim()))
                .map((line) => line.replace(/^\d+\.\s*/, "").trim());

            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 not-prose">
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className="group flex gap-4 p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] items-center shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-black/5 hover:border-[var(--accent)]"
                        >
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--accent)] flex items-center justify-center font-bold text-sm shadow-inner group-hover:bg-[var(--accent)] group-hover:text-white transition-colors duration-300">
                                {i + 1}
                            </div>
                            <div className="text-[var(--text-muted)] text-[15px] font-bold leading-relaxed group-hover:text-[var(--foreground)] transition-all duration-300">
                                {step}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (isBlockCodeNode && (lang === "reflections" || lang === "reflection")) {
            const numberedItems = code
                .split("\n")
                .filter((line) => /^\d+\./.test(line.trim()))
                .map((line) => line.replace(/^\d+\.\s*/, "").trim())
                .filter(Boolean);

            const paragraphItems = code
                .split(/\n{2,}/)
                .map((block) => block.replace(/\n/g, " ").trim())
                .filter(Boolean);

            const reflections = numberedItems.length > 0 ? numberedItems : paragraphItems;

            return (
                <section className="my-8 not-prose rounded-3xl border border-[var(--border)] bg-[var(--card-subtle)] p-5 md:p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <span className="inline-flex h-8 items-center rounded-full border border-[var(--border)] bg-[var(--card)] px-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
                            Reflection
                        </span>
                        <div className="h-px flex-1 bg-[var(--border)]" />
                    </div>

                    <div className="space-y-3">
                        {reflections.map((item, i) => (
                            <article
                                key={i}
                                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 md:px-5"
                            >
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                                    Insight {i + 1}
                                </p>
                                <p className="text-[15px] leading-relaxed text-[var(--text-muted)]">{item}</p>
                            </article>
                        ))}
                    </div>
                </section>
            );
        }

        if (isBlockCodeNode && (lang === "troubleshooting" || lang === "trouble" || lang === "troubleshoot")) {
            const sections = parseTroubleshootingContent(code);
            const summary = buildTroubleSummary(sections);
            const activeRows = troubleRows.filter((row) => Boolean(sections[row.key]));

            return (
                <details className="group my-6 not-prose rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-sm transition-colors open:border-[var(--accent)] open:bg-[var(--card-subtle)]">
                    <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
                        <span className="inline-flex h-7 items-center rounded-full border border-[var(--border)] bg-[var(--card-subtle)] px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]">
                            Trouble
                        </span>
                        <span className="text-[15px] font-semibold leading-relaxed text-[var(--foreground)]">{summary}</span>
                        <span className="ml-auto text-xs text-[var(--text-soft)] transition-transform duration-200 group-open:rotate-180">▼</span>
                    </summary>

                    <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
                        {activeRows.length > 0 ? (
                            activeRows.map((row) => (
                                <article
                                    key={row.key}
                                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"
                                >
                                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-soft)]">
                                        {row.label}
                                    </p>
                                    <div className="space-y-3">
                                        <ReactMarkdown
                                            components={{
                                                pre: ({ children: innerChildren }) => <>{innerChildren}</>,
                                                code: renderCode,
                                                p: ({ children: innerChildren }) => (
                                                    <p className="text-[14px] leading-relaxed text-[var(--text-muted)]">
                                                        {innerChildren}
                                                    </p>
                                                ),
                                                li: ({ children: innerChildren }) => (
                                                    <li className="text-[14px] leading-relaxed text-[var(--text-muted)]">
                                                        {innerChildren}
                                                    </li>
                                                ),
                                                ul: ({ children: innerChildren }) => (
                                                    <ul className="list-disc pl-5 space-y-1">{innerChildren}</ul>
                                                ),
                                                ol: ({ children: innerChildren }) => (
                                                    <ol className="list-decimal pl-5 space-y-1">{innerChildren}</ol>
                                                ),
                                                blockquote: ({ children: innerChildren }) => (
                                                    <blockquote className="border-l-2 border-[var(--border)] pl-3 text-[var(--text-soft)] italic">
                                                        {innerChildren}
                                                    </blockquote>
                                                ),
                                            }}
                                        >
                                            {sections[row.key] || ""}
                                        </ReactMarkdown>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <p className="text-[14px] leading-relaxed text-[var(--text-muted)]">
                                작성된 트러블슈팅 내용이 없습니다.
                            </p>
                        )}
                    </div>
                </details>
            );
        }

        if (isBlockCodeNode) {
            const key = createCodeKey(lang, code);
            const highlighted = codeHtmlMap[key];
            if (highlighted) {
                return (
                    <div className="not-prose shiki-block">
                        <div className="shiki-header">
                            <span className="shiki-lang">{label}</span>
                            <button
                                type="button"
                                className="shiki-copy"
                                onClick={() => copyToClipboard(code, key)}
                            >
                                {copiedKey === key ? "Copied" : "Copy"}
                            </button>
                        </div>
                        <div
                            className="shiki-wrapper"
                            dangerouslySetInnerHTML={{ __html: highlighted }}
                        />
                    </div>
                );
            }

            return (
                <div className="not-prose shiki-block">
                    <div className="shiki-header">
                        <span className="shiki-lang">{label}</span>
                        <button
                            type="button"
                            className="shiki-copy"
                            onClick={() => copyToClipboard(code, key)}
                        >
                            {copiedKey === key ? "Copied" : "Copy"}
                        </button>
                    </div>
                    <pre className="shiki-fallback">
                        <code className={className} {...props}>
                            {children}
                        </code>
                    </pre>
                </div>
            );
        }

        return (
            <code className={className} {...props}>
                {children}
            </code>
        );
    }

    const getHeadingSlug = (children: React.ReactNode, node?: PositionNode): string => {
        const line = node?.position?.start?.line;
        if (typeof line === "number") {
            const lineSlug = headingSlugByLine.get(line);
            if (lineSlug) {
                return lineSlug;
            }
        }

        const text = stripInlineMarkdown(getTextContent(children));
        return slugify(text);
    };

    return (
        <div className="prose prose-base md:prose-lg prose-zinc dark:prose-invert max-w-4xl mx-auto prose-headings:tracking-tighter prose-headings:font-bold prose-headings:text-[var(--foreground)] prose-strong:text-[var(--foreground)] prose-strong:font-bold prose-p:text-[var(--text-muted)] prose-p:leading-loose prose-li:text-[var(--text-muted)] prose-li:leading-loose">
            <ReactMarkdown
                components={{
                    pre: ({ children }) => <>{children}</>,
                    h1({ children, node, ...props }) {
                        const slug = getHeadingSlug(children, node as PositionNode);
                        return (
                            <h1 id={slug} className="scroll-mt-24 !mt-12 !mb-6" {...props}>
                                {children}
                            </h1>
                        );
                    },
                    h2({ children, node, ...props }) {
                        const slug = getHeadingSlug(children, node as PositionNode);
                        return (
                            <h2 id={slug} className="scroll-mt-24 !mt-8 !mb-4" {...props}>
                                {children}
                            </h2>
                        );
                    },
                    h3({ children, node, ...props }) {
                        const slug = getHeadingSlug(children, node as PositionNode);
                        return (
                            <h3 id={slug} className="scroll-mt-24 !mt-6 !mb-3" {...props}>
                                {children}
                            </h3>
                        );
                    },
                    h4({ children, node, ...props }) {
                        const slug = getHeadingSlug(children, node as PositionNode);
                        return (
                            <h4 id={slug} className="scroll-mt-24 !mt-4 !mb-2" {...props}>
                                {children}
                            </h4>
                        );
                    },
                    p({ children }) {
                        const text = getTextContent(children);
                        if (typeof text === "string" && text.trim().startsWith("|")) {
                            const content = text.trim().substring(1).trim();
                            const slug = slugify(content);
                            return (
                                <h2
                                    id={slug}
                                    className="scroll-mt-24 !mt-8 !mb-4 border-l-4 border-zinc-800 dark:border-zinc-200 pl-4 font-bold text-2xl tracking-tighter text-[var(--foreground)]"
                                >
                                    {content}
                                </h2>
                            );
                        }
                        return <p>{children}</p>;
                    },
                    hr: () => (
                        <hr className="!my-8 border-zinc-200 dark:border-zinc-800" />
                    ),
                    code: renderCode,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
