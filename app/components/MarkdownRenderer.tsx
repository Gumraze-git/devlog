"use client";

import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Code2, GitCommitHorizontal } from "lucide-react";
import {
    buildTroubleSummary,
    createCodeKey,
    extractHeadingSlugByLine,
    normalizeArrowNotation,
    parseTroubleshootingContent,
    slugify,
    stripInlineMarkdown,
    TROUBLE_ROWS,
} from "../lib/markdown";
import MermaidDiagram from "./MermaidDiagram";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
    content: string;
    codeHtmlByKey?: Record<string, string>;
    className?: string;
}

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

type MarkdownAnchorProps = React.ComponentPropsWithoutRef<"a"> & {
    node?: unknown;
};

type ChipVariant = "default" | "code" | "commit" | "asis" | "tobe";

type ChipItem = {
    label: string;
    href?: string;
    variant: ChipVariant;
};

type CompareVariant = "asis" | "tobe" | "default";

type CompareCard = {
    label: string;
    variant: CompareVariant;
    summary?: string;
    bodyNodes: React.ReactNode[];
};

const languageLabelMap: Record<string, string> = {
    text: "Text",
    js: "JavaScript",
    jsx: "JSX",
    ts: "TypeScript",
    tsx: "TSX",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    bash: "Bash",
    shell: "Shell",
    sh: "Shell",
    java: "Java",
    kotlin: "Kotlin",
    python: "Python",
    go: "Go",
    rust: "Rust",
    sql: "SQL",
    xml: "XML",
    markdown: "Markdown",
    md: "Markdown",
    mermaid: "Mermaid",
    c: "C",
    cpp: "C++",
    cs: "C#",
    csharp: "C#",
};

function isExternalHttpLink(href?: string): boolean {
    if (!href) return false;
    return /^https?:\/\//i.test(href);
}

function normalizeChipVariant(value?: string, label?: string): ChipVariant {
    const normalizedVariant = (value || "").trim().toLowerCase();
    
    // Explicit variants take precedence
    if (
        normalizedVariant === "code" ||
        normalizedVariant === "commit" ||
        normalizedVariant === "asis" ||
        normalizedVariant === "tobe"
    ) return normalizedVariant as ChipVariant;

    // Fallback to label-based detection if variant is default/missing
    if (label) {
        const normalizedLabel = label.trim().toLowerCase().replace(/\s+/g, "").replace(/[^a-z-]/g, "");
        if (normalizedLabel === "asis" || normalizedLabel === "as-is") return "asis";
        if (normalizedLabel === "tobe" || normalizedLabel === "to-be") return "tobe";
    }

    return "default";
}

function parseChipLines(source: string): ChipItem[] {
    const lines = source.split("\n");
    const chips: ChipItem[] = [];

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (line.length === 0 || line.startsWith("#")) continue;

        const parts = line.split("|").map((part) => part.trim());
        const label = parts[0] ?? "";
        if (label.length === 0) continue;

        const rawHref = parts[1] ?? "";
        const href = rawHref.length > 0 && !/\s/.test(rawHref) ? rawHref : undefined;
        const variant = normalizeChipVariant(parts[2], label);

        chips.push({
            label,
            href,
            variant,
        });
    }

    return chips;
}

function formatLanguageLabel(lang: string): string {
    const normalized = lang.trim().toLowerCase();
    if (!normalized) return "Text";

    const known = languageLabelMap[normalized];
    if (known) return known;

    return normalized
        .split(/[-_]+/)
        .filter((segment) => segment.length > 0)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");
}

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


const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, codeHtmlByKey, className }) => {
    const codeHtmlMap = codeHtmlByKey ?? {};
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const renderedContent = useMemo(() => normalizeArrowNotation(content), [content]);
    const headingSlugByLine = useMemo(() => extractHeadingSlugByLine(renderedContent), [renderedContent]);

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

    const isCompareMarker = (node: React.ReactNode) => {
        const text = getTextContent(node).trim().toLowerCase();
        return text === "!compare" || text === "compare";
    };

    const normalizeCompareLabel = (value: string) => {
        return value.trim().toLowerCase().replace(/\s+/g, "").replace(/[^a-z-]/g, "");
    };

    const toCompareVariant = (value: string): CompareVariant => {
        const normalized = normalizeCompareLabel(value);
        if (normalized === "asis" || normalized === "as-is") return "asis";
        if (normalized === "tobe" || normalized === "to-be") return "tobe";
        return "default";
    };

    const isCompareChipNode = (node: React.ReactNode) => {
        if (!React.isValidElement<Record<string, unknown>>(node)) return false;
        return typeof node.props["data-compare-first-label"] === "string";
    };

    const getCompareChipLabel = (node: React.ReactNode): string | null => {
        if (!React.isValidElement<Record<string, unknown>>(node)) return null;
        const label = node.props["data-compare-first-label"];
        return typeof label === "string" && label.trim().length > 0 ? label.trim() : null;
    };

    const getRawCode = (node: React.ReactNode): string | null => {
        if (!React.isValidElement<Record<string, unknown>>(node)) return null;
        const rawCode = node.props["data-raw-code"];
        return typeof rawCode === "string" && rawCode.length > 0 ? rawCode : null;
    };

    const extractCompareSummary = (rawCode: string): string | undefined => {
        for (const line of rawCode.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const singleLineComment = /^\/\/\s*(.+)$/.exec(trimmed);
            if (singleLineComment) {
                return singleLineComment[1].trim();
            }

            break;
        }

        return undefined;
    };

    const buildCompareCard = (nodes: React.ReactNode[], fallbackLabel: string): CompareCard => {
        const chipNode = nodes.find((node) => isCompareChipNode(node));
        const label = getCompareChipLabel(chipNode) ?? fallbackLabel;
        const variant = toCompareVariant(label);
        const bodyNodes = nodes.filter((node) => !isCompareChipNode(node));
        const firstCodeNode = bodyNodes.find((node) => Boolean(getRawCode(node)));
        const summary = firstCodeNode ? extractCompareSummary(getRawCode(firstCodeNode) ?? "") : undefined;

        return {
            label,
            variant,
            summary,
            bodyNodes,
        };
    };

    const renderCompareLayout = (children: React.ReactNode, className: string) => {
        const nodes = React.Children.toArray(children).filter((node) => {
            const text = getTextContent(node).trim();
            if (text.length === 0) return false;
            return !isCompareMarker(node);
        });

        const leftColumn: React.ReactNode[] = [];
        const rightColumn: React.ReactNode[] = [];
        let currentColumn: "left" | "right" = "left";

        nodes.forEach((node) => {
            const normalizedText = normalizeCompareLabel(getTextContent(node));
            if (normalizedText === "to-be" || normalizedText === "tobe") {
                currentColumn = "right";
            }

            if (currentColumn === "left") {
                leftColumn.push(node);
            } else {
                rightColumn.push(node);
            }
        });

        const fallbackMidpoint = Math.ceil(nodes.length / 2);
        const col1 = leftColumn.length > 0 ? leftColumn : nodes.slice(0, fallbackMidpoint);
        const col2 = rightColumn.length > 0 ? rightColumn : nodes.slice(fallbackMidpoint);
        const cards = [
            buildCompareCard(col1, "As-Is"),
            buildCompareCard(col2, "To-Be"),
        ];

        return (
            <div className={className}>
                {cards.map((card) => (
                    <section
                        key={card.label}
                        className={`compare-card compare-card--${card.variant}`}
                    >
                        <header className="compare-card__header">
                            <span className={`compare-card__status compare-card__status--${card.variant}`}>
                                {card.label}
                            </span>
                            {card.summary ? (
                                <p className="compare-card__summary">
                                    {card.summary}
                                </p>
                            ) : null}
                        </header>
                        <div className="compare-card__body">
                            {card.bodyNodes}
                        </div>
                    </section>
                ))}
            </div>
        );
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
        const label = formatLanguageLabel(lang);

        if (isBlockCodeNode && lang === "mermaid") {
            return (
                <MermaidDiagram code={code} />
            );
        }

        if (isBlockCodeNode && (lang === "chips" || lang === "chip")) {
            const chips = parseChipLines(code);
            if (chips.length === 0) return null;

            return (
                <div
                    className="md-chip-list not-prose"
                    data-compare-first-label={chips[0]?.label ?? ""}
                >
                    {chips.map((chip, index) => {
                        const variantClassName = chip.variant !== "default" ? `md-chip--${chip.variant}` : "";
                        const className = ["md-chip", chip.href ? "md-chip--link" : "", variantClassName]
                            .filter(Boolean)
                            .join(" ");
                        const key = `${chip.label}-${chip.href ?? "text"}-${chip.variant}-${index}`;
                        const icon = chip.variant === "code"
                            ? <Code2 size={13} className="md-chip__icon" aria-hidden="true" />
                            : chip.variant === "commit"
                                ? <GitCommitHorizontal size={13} className="md-chip__icon" aria-hidden="true" />
                                : null;

                        if (!chip.href) {
                            return (
                                <span key={key} className={className}>
                                    {icon}
                                    {chip.label}
                                </span>
                            );
                        }

                        const external = isExternalHttpLink(chip.href);
                        return (
                            <a
                                key={key}
                                href={chip.href}
                                className={className}
                                target={external ? "_blank" : undefined}
                                rel={external ? "noopener noreferrer" : undefined}
                            >
                                {icon}
                                {chip.label}
                            </a>
                        );
                    })}
                </div>
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
                <section className="my-10 not-prose">
                    <div className="mb-8 flex items-center justify-center gap-4">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--accent)]/50" />
                        <span className="text-[13px] font-extrabold uppercase tracking-[0.25em] text-[var(--accent)]">
                            Reflections
                        </span>
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--accent)]/50" />
                    </div>

                    <div className="space-y-12">
                        {reflections.map((item, i) => (
                            <article
                                key={i}
                                className="relative px-2 sm:px-6 md:px-10"
                            >
                                <p className="mb-3 text-[12px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                                    Insight <span className="text-[var(--accent)]">{i + 1}</span>
                                </p>
                                <p className="text-base leading-[2.1] md:text-[17px] text-[var(--foreground)] tracking-tight font-medium opacity-90">
                                    {item}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>
            );
        }

        if (isBlockCodeNode && (lang === "troubleshooting" || lang === "trouble" || lang === "troubleshoot")) {
            const sections = parseTroubleshootingContent(code);
            const summary = buildTroubleSummary(sections);
            const activeRows = TROUBLE_ROWS.filter((row) => Boolean(sections[row.key]));

            return (
                <div className="trouble-card my-8 not-prose rounded-3xl border border-[var(--border)] bg-[var(--card-subtle)]/50 p-5 md:p-6 shadow-sm">
                    <div className="trouble-summary mb-5 flex items-center gap-3">
                        <span className="inline-flex h-8 items-center rounded-full border border-[var(--border)] bg-[var(--card)] px-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
                            Case Study
                        </span>
                        <h4 className="trouble-summary-title min-w-0 flex-1 text-[16px] md:text-lg font-bold leading-relaxed text-[var(--foreground)]">{summary}</h4>
                        <div className="h-px flex-1 bg-[var(--border)] hidden sm:block" />
                    </div>

                    <div className="trouble-content mt-4 space-y-4">
                        {activeRows.length > 0 ? (
                            activeRows.map((row) => (
                                <article
                                    key={row.key}
                                    className={`trouble-section trouble-section--${row.key} rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 md:px-5`}
                                >
                                    <div className="trouble-section-header mb-3 flex items-center gap-3">
                                        <p className="trouble-section-label text-[13px] font-bold uppercase tracking-[0.15em] text-[var(--text-soft)]">
                                            {row.label}
                                        </p>
                                    </div>
                                    <div className="trouble-section-body space-y-3">
                                        <ReactMarkdown
                                            components={{
                                                pre: ({ children: innerChildren }) => <>{innerChildren}</>,
                                                code: renderCode,
                                                p: ({ children: innerChildren }) => (
                                                    <p className="trouble-section-text text-[14px] leading-relaxed text-[var(--text-muted)]">
                                                        {innerChildren}
                                                    </p>
                                                ),
                                                li: ({ children: innerChildren }) => (
                                                    <li className="trouble-section-text text-[14px] leading-relaxed text-[var(--text-muted)]">
                                                        {innerChildren}
                                                    </li>
                                                ),
                                                ul: ({ children: innerChildren }) => (
                                                    <ul className="list-disc pl-5 space-y-1 mt-1 font-medium">{innerChildren}</ul>
                                                ),
                                                ol: ({ children: innerChildren }) => (
                                                    <ol className="list-decimal pl-5 space-y-1 mt-1 font-medium">{innerChildren}</ol>
                                                ),
                                                blockquote: ({ children: innerChildren }) => {
                                                    const textStr = getTextContent(innerChildren).trim();
                                                    if (textStr.includes("!compare")) {
                                                        return renderCompareLayout(
                                                            innerChildren,
                                                            "compare-grid my-4",
                                                        );
                                                    }
                                                    return (
                                                        <blockquote className="border-l-2 border-[var(--border)] pl-3 text-[var(--text-soft)] italic mt-2">
                                                            {innerChildren}
                                                        </blockquote>
                                                    );
                                                },
                                                a: renderMarkdownAnchor,
                                            }}
                                        >
                                            {normalizeArrowNotation(sections[row.key] || "")}
                                        </ReactMarkdown>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <p className="text-[14px] leading-relaxed text-[var(--text-muted)]">
                                작성된 내용이 없습니다.
                            </p>
                        )}
                    </div>
                </div>
            );
        }

        if (isBlockCodeNode) {
            const key = createCodeKey(lang, code);
            const highlighted = codeHtmlMap[key];
            if (highlighted) {
                return (
                    <div className="not-prose shiki-block" data-raw-code={code}>
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
                <div className="not-prose shiki-block" data-raw-code={code}>
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

        const inlineCodeClassName = ["md-inline-code", className].filter(Boolean).join(" ");
        return (
            <code className={inlineCodeClassName} {...props}>
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

    const renderMarkdownAnchor = ({ href, children, className, ...props }: MarkdownAnchorProps) => {
        const isExternal = isExternalHttpLink(href);
        const mergedClassName = ["md-link", className]
            .filter(Boolean)
            .join(" ");

        return (
            <a
                href={href}
                className={mergedClassName}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                {...props}
            >
                {children}
            </a>
        );
    };

    const containerClassName = [
        "markdown-prose prose prose-base md:prose-lg prose-zinc dark:prose-invert max-w-4xl mx-auto prose-headings:tracking-tighter prose-headings:font-bold prose-headings:text-[var(--foreground)] prose-strong:text-[var(--foreground)] prose-strong:font-bold prose-p:text-[var(--text-muted)] prose-p:leading-[1.6] prose-li:text-[var(--text-muted)] prose-li:leading-[1.4]",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={containerClassName}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    pre: ({ children }) => <>{children}</>,
                    h1({ children, node, ...props }) {
                        const slug = getHeadingSlug(children, node as PositionNode);
                        return (
                            <h1 id={slug} className="scroll-mt-24 !mt-12 !mb-6 text-[var(--foreground)]" {...props}>
                                {children}
                            </h1>
                        );
                    },
                    h2({ children, node, ...props }) {
                        const slug = getHeadingSlug(children, node as PositionNode);
                        return (
                            <h2 id={slug} className="scroll-mt-24 !mt-8 !mb-4 text-[var(--foreground)]" {...props}>
                                {children}
                            </h2>
                        );
                    },
                    h3({ children, node, ...props }) {
                        const slug = getHeadingSlug(children, node as PositionNode);
                        return (
                            <h3 id={slug} className="scroll-mt-24 !mt-6 !mb-3 text-[var(--foreground)]" {...props}>
                                {children}
                            </h3>
                        );
                    },
                    h4({ children, node, ...props }) {
                        const slug = getHeadingSlug(children, node as PositionNode);
                        return (
                            <h4 id={slug} className="scroll-mt-24 !mt-4 !mb-2 text-[var(--foreground)]" {...props}>
                                {children}
                            </h4>
                        );
                    },
                    p({ children }) {
                        const text = getTextContent(children);
                        // Summary-style highlight: only if explicit "| " marker is used 
                        // and it's not a fragmented table line (GFM handles tables now)
                        if (typeof text === "string" && text.trim().startsWith("|") && !text.includes("| --- |")) {
                            const raw = text.trim();
                            const content = raw.substring(1).trim();
                            // If it still looks like a table's raw content but wasn't caught by the table renderer, 
                            // we just render a plain p to be safe.
                            if (raw.split("|").filter(Boolean).length > 1 && !raw.includes(" || ")) {
                                return <p>{children}</p>;
                            }

                            return (
                                <p
                                    className="scroll-mt-24 !mt-8 !mb-4 border-l-4 border-zinc-900 dark:border-zinc-100 pl-6 font-bold text-2xl tracking-tighter !text-black dark:!text-white leading-[1.3] py-2"
                                >
                                    {content}
                                </p>
                            );
                        }
                        return <p className="leading-[1.85] text-[15.5px] text-[var(--foreground)]/85 tracking-[-0.01em] break-keep">{children}</p>;
                    },
                    // GFM Tables - Elegant Content Reading Style
                    table: ({ children }) => (
                        <div className="my-10 w-full overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar pb-4">
                                <table className="w-full border-collapse text-left">
                                    {children}
                                </table>
                            </div>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead>
                            {children}
                        </thead>
                    ),
                    th: ({ children }) => (
                        <th className="px-3 py-4 text-[15px] font-semibold text-[var(--foreground)] border-y border-[var(--border)] align-middle whitespace-nowrap bg-[var(--background)]">
                            {children}
                        </th>
                    ),
                    tr: ({ children }) => (
                        <tr className="border-b border-[var(--border-muted)] transition-colors hover:bg-[var(--card-subtle)]/20 last:border-b-0">
                            {children}
                        </tr>
                    ),
                    td: ({ children }) => (
                        <td className="px-3 py-[1.125rem] text-[15px] leading-[1.7] text-[var(--text-muted)] align-top first:font-medium first:text-[var(--foreground)] break-words">
                            {children}
                        </td>
                    ),
                    blockquote: ({ children }) => {
                        const textStr = getTextContent(children).trim();
                        if (textStr.includes("!compare") || textStr.includes("compare")) {
                            return renderCompareLayout(
                                children,
                                "compare-grid my-6",
                            );
                        }
                        return (
                            <blockquote className="border-l-2 border-[var(--border)] pl-4 text-[var(--text-soft)] italic my-4 py-2 bg-[var(--card-subtle)]/30 rounded-r-xl">
                                {children}
                            </blockquote>
                        );
                    },
                    code: renderCode,
                    a: renderMarkdownAnchor,
                }}
            >
                {renderedContent}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
