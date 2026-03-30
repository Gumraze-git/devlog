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

    const renderCompareLayout = (children: React.ReactNode) => {
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
            <div className="my-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {cards.map((card) => (
                    <section key={card.label} className="space-y-3">
                        <h4 className="text-[16px] md:text-[18px] font-bold text-[var(--foreground)] m-0 flex items-center gap-2">
                            {card.label}
                            {card.summary && (
                                <span className="text-[var(--text-muted)] font-normal text-[14px]">
                                    - {card.summary}
                                </span>
                            )}
                        </h4>
                        <div className="prose-p:mt-0 prose-pre:mt-2 w-full">
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
                            <div className="text-[var(--text-muted)] text-[16px] md:text-[17.5px] font-bold leading-relaxed group-hover:text-[var(--foreground)] transition-all duration-300">
                                {step}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (isBlockCodeNode && (lang === "features" || lang === "feature")) {
            const items = code
                .split(/(?:^|\n)-\s+/)
                .map((item) => item.trim())
                .filter(Boolean);

            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-8 not-prose">
                    {items.map((item, i) => {
                        const match = item.match(/^(?:\*\*)?(.*?)(?:\*\*)?:\s+([\s\S]*)$/);
                        const title = match ? match[1].replace(/\*\*/g, "").trim() : "";
                        const desc = match ? match[2].trim() : item;
                        return (
                            <div
                                key={i}
                                className="group relative flex flex-col gap-3 p-6 md:p-7 text-left rounded-[1.5rem] bg-[var(--card)] border border-[var(--border)] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-[var(--accent)]/50 transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                {title && (
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] opacity-70 group-hover:scale-125 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_8px_var(--accent)]" />
                                        <h4 className="text-[16.5px] md:text-[18px] font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors duration-300 tracking-tight m-0">
                                            {title}
                                        </h4>
                                    </div>
                                )}
                                <p className="text-[15px] md:text-[16px] leading-[1.75] text-[var(--text-muted)] group-hover:text-[var(--foreground)]/90 transition-colors duration-300 m-0 relative z-10">
                                    {desc}
                                </p>
                            </div>
                        );
                    })}
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

            const solutionDataRaw = sections["solution"] || "";
            let solutionIntro = solutionDataRaw;
            let compareValue = "";
            let asIsText = "";
            let toBeText = "";

            const compareMarker = "> !compare";
            const altCompareMarker = "!compare";
            const cIndex = solutionDataRaw.indexOf(compareMarker);
            const altIndex = solutionDataRaw.indexOf(altCompareMarker);

            if (cIndex !== -1) {
                solutionIntro = solutionDataRaw.substring(0, cIndex).trim();
                compareValue = solutionDataRaw.substring(cIndex + compareMarker.length).trim();
            } else if (altIndex !== -1) {
                solutionIntro = solutionDataRaw.substring(0, altIndex).trim();
                compareValue = solutionDataRaw.substring(altIndex + altCompareMarker.length).trim();
            }

            if (compareValue) {
                const cleanCompare = compareValue
                  .split("\n")
                  .filter((l: string) => !l.trim().endsWith("!compare"))
                  .map((l: string) => l.startsWith("> ") ? l.substring(2) : l.startsWith(">") ? l.substring(1) : l)
                  .join("\n");
                
                if (cleanCompare.includes("```chips")) {
                    const rawChunks = cleanCompare.split(/(?=```chips)/).filter((c: string) => c.trim().length > 0);
                    rawChunks.forEach((chunk: string) => {
                        const normalizedChunk = chunk.toLowerCase().replace(/\s+/g, "").replace(/[^a-z-]/g, "");
                        if (normalizedChunk.includes("asis") || normalizedChunk.includes("as-is")) {
                            asIsText += "\n" + chunk;
                        } else if (normalizedChunk.includes("tobe") || normalizedChunk.includes("to-be")) {
                            toBeText += "\n" + chunk;
                        } else {
                            if (!asIsText) asIsText += "\n" + chunk;
                            else if (toBeText) toBeText += "\n" + chunk;
                            else asIsText += "\n" + chunk;
                        }
                    });
                } else {
                    const blocks: string[] = [];
                    const regex = /```[a-z]*\s*[\s\S]*?```/gi;
                    let match;
                    while ((match = regex.exec(cleanCompare)) !== null) {
                        blocks.push(match[0]);
                    }
                    if (blocks.length >= 2) {
                        asIsText = blocks[0];
                        toBeText = blocks[1];
                    } else if (blocks.length === 1) {
                        asIsText = blocks[0];
                    }
                }
            }

            const SharedComponents: import("react-markdown").Components = {
                pre: ({ children: innerChildren }) => <>{innerChildren}</>,
                code: renderCode,
                a: renderMarkdownAnchor,
                p: ({ children: innerChildren }) => <p className="m-0 leading-snug">{innerChildren}</p>,
                ul: ({ children: innerChildren }) => (
                    <ul className="list-disc leading-snug pl-4 !m-0 !my-1.5 marker:text-[var(--text-muted)]">
                        {innerChildren}
                    </ul>
                ),
                ol: ({ children: innerChildren }) => (
                    <ol className="list-decimal leading-snug pl-4 !m-0 !my-1.5 marker:text-[var(--text-muted)]">
                        {innerChildren}
                    </ol>
                ),
                li: ({ children: innerChildren }) => <li className="first:!mt-0 !mt-0.5 !mb-0 leading-snug">{innerChildren}</li>,
                blockquote: ({ children: innerChildren }) => {
                    const textStr = getTextContent(innerChildren).trim();
                    if (textStr.includes("!compare") || textStr.includes("compare")) {
                        return renderCompareLayout(innerChildren);
                    }
                    return (
                        <blockquote className="border-l-2 border-[var(--border)] pl-3 text-[var(--text-soft)] italic my-1.5 py-0.5">
                            {innerChildren}
                        </blockquote>
                    );
                },
            };

            return (
                <div className="!mt-2 !mb-4">
                    <h3 className="text-[20px] md:text-[22px] font-bold tracking-tight text-[var(--foreground)] !mt-0 !mb-2">
                        {summary}
                    </h3>
                    
                    <div className="space-y-2">
                        {sections["problem"] && (
                            <div className="space-y-1.5 bg-[var(--card-subtle)]/30 border border-[var(--border)] rounded-lg px-2.5 pb-2.5 pt-2.5 lg:px-3.5 lg:pb-3.5 lg:pt-3">
                                <h4 className="flex items-center gap-2 text-[15px] md:text-[16px] font-bold tracking-[0.1em] text-[var(--text-soft)] uppercase !m-0 !mb-2 leading-none">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] outline outline-2 outline-[var(--text-muted)]/20" />
                                    문제
                                </h4>
                                <div className="text-[14px] md:text-[15px] text-[var(--text-muted)] w-full">
                                    <ReactMarkdown components={SharedComponents}>{normalizeArrowNotation(sections["problem"])}</ReactMarkdown>
                                </div>
                            </div>
                        )}

                        {(sections["cause"] || solutionIntro || asIsText || toBeText) && (
                            <div className="flex flex-col lg:grid lg:grid-cols-2 relative my-1.5 bg-[var(--card-subtle)]/30 border border-[var(--border)] rounded-lg px-2.5 pb-2.5 pt-2.5 lg:px-3.5 lg:pb-3.5 lg:pt-3 gap-y-3 lg:gap-y-0 lg:gap-x-4">
                                {/* 1. CAUSE TEXT (Row 1, Col 1) */}
                                <div className="order-1 lg:order-none lg:pb-2">
                                    <h4 className="flex items-center gap-2 text-[15px] md:text-[16px] font-bold tracking-[0.1em] text-rose-500/90 dark:text-rose-400/90 uppercase !m-0 !mb-2 leading-none">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500/80 outline outline-2 outline-rose-500/20" />
                                        AS IS
                                    </h4>
                                    {sections["cause"] && (
                                        <div className="text-[14px] md:text-[15px] text-[var(--text-muted)]">
                                            <ReactMarkdown components={SharedComponents}>{normalizeArrowNotation(sections["cause"])}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>

                                {/* 2. SOLUTION TEXT (Row 1, Col 2) */}
                                <div className="order-3 lg:order-none lg:pb-2 lg:border-l lg:border-[var(--border-muted)] lg:pl-4">
                                    <div className="lg:hidden w-full h-[1px] bg-[var(--border-muted)]/30 mb-2 mt-0" />
                                    <h4 className="flex items-center gap-2 text-[15px] md:text-[16px] font-bold tracking-[0.1em] text-emerald-500/90 dark:text-emerald-400/90 uppercase !m-0 !mb-2 leading-none">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 outline outline-2 outline-emerald-500/20" />
                                        TO BE
                                    </h4>
                                    {solutionIntro && (
                                        <div className="text-[14px] md:text-[15px] text-[var(--text-muted)]">
                                            <ReactMarkdown components={SharedComponents}>{normalizeArrowNotation(solutionIntro)}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>

                                {/* 3. AS-IS CODE (Row 2, Col 1) */}
                                <div className="order-2 lg:order-none h-full">
                                    {asIsText && (
                                        <div className="text-[14px] md:text-[15px] text-[var(--text-muted)] w-full hover:z-10 relative [&_.shiki-block]:!mt-1 [&_.shiki-block]:!mb-0">
                                            <ReactMarkdown components={SharedComponents}>{normalizeArrowNotation(asIsText.replace(/```chips[\s\S]*?```/g, "").trim())}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>

                                {/* 4. TO-BE CODE (Row 2, Col 2) */}
                                <div className="order-4 lg:order-none lg:border-l lg:border-[var(--border-muted)] lg:pl-4 h-full">
                                    {toBeText && (
                                        <div className="text-[14px] md:text-[15px] text-[var(--text-muted)] w-full hover:z-10 relative [&_.shiki-block]:!mt-1 [&_.shiki-block]:!mb-0">
                                            <ReactMarkdown components={SharedComponents}>{normalizeArrowNotation(toBeText.replace(/```chips[\s\S]*?```/g, "").trim())}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {sections["result"] && (
                            <div className="space-y-1.5 bg-[var(--card-subtle)]/30 border border-[var(--border)] rounded-lg px-2.5 pb-2.5 pt-2.5 lg:px-3.5 lg:pb-3.5 lg:pt-3 w-full">
                                <h4 className="flex items-center gap-2 text-[15px] md:text-[16px] font-bold tracking-[0.1em] text-[var(--text-soft)] uppercase !m-0 !mb-2 leading-none">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] outline outline-2 outline-[var(--text-muted)]/20" />
                                    결과
                                </h4>
                                <div className="text-[14px] md:text-[15px] text-[var(--text-muted)]">
                                    <ReactMarkdown components={SharedComponents}>{normalizeArrowNotation(sections["result"])}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>

                    <hr className="my-8 border-t-[1.5px] border-dashed border-[var(--border-muted)] w-full" />
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
                        return <p className="leading-[1.85] text-[16px] md:text-[18px] text-[var(--foreground)]/85 tracking-[-0.01em] break-keep">{children}</p>;
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
                        <th className="px-3 py-4 text-[15px] md:text-[17px] font-semibold text-[var(--foreground)] border-y border-[var(--border)] align-middle whitespace-nowrap bg-[var(--background)]">
                            {children}
                        </th>
                    ),
                    tr: ({ children }) => (
                        <tr className="border-b border-[var(--border-muted)] transition-colors hover:bg-[var(--card-subtle)]/20 last:border-b-0">
                            {children}
                        </tr>
                    ),
                    td: ({ children }) => (
                        <td className="px-3 py-[1.125rem] text-[15px] md:text-[17px] leading-[1.7] text-[var(--text-muted)] align-top first:font-medium first:text-[var(--foreground)] break-words">
                            {children}
                        </td>
                    ),
                    blockquote: ({ children }) => {
                        const textStr = getTextContent(children).trim();
                        if (textStr.includes("!compare") || textStr.includes("compare")) {
                            return renderCompareLayout(
                                children
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
