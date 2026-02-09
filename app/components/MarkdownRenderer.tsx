"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import mermaid from "mermaid";
import { createCodeKey, slugify, stripInlineMarkdown } from "../lib/markdown";

// Initialize mermaid with some nice default styling
mermaid.initialize({
    startOnLoad: true,
    theme: "base",
    themeVariables: {
        primaryColor: "#3b82f6",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#1d4ed8",
        lineColor: "#94a3b8",
        secondaryColor: "#f1f5f9",
        tertiaryColor: "#ffffff",
    },
    securityLevel: "loose",
});

interface MarkdownRendererProps {
    content: string;
    codeHtmlByKey?: Record<string, string>;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, codeHtmlByKey }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const codeHtmlMap = codeHtmlByKey ?? {};
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

    useEffect(() => {
        // Re-render mermaid diagrams whenever content changes
        if (containerRef.current) {
            mermaid.contentLoaded();
        }
    }, [content]);

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

    return (
        <div ref={containerRef} className="prose prose-lg prose-zinc dark:prose-invert max-w-none prose-headings:tracking-tighter prose-headings:font-bold prose-headings:text-[var(--foreground)] prose-strong:text-[var(--foreground)] prose-strong:font-bold prose-p:text-[var(--text-muted)] prose-p:leading-relaxed prose-li:text-[var(--text-muted)] prose-li:leading-relaxed">
            <ReactMarkdown
                components={{
                    pre: ({ children }) => <>{children}</>,
                    h1({ children, ...props }) {
                        const text = stripInlineMarkdown(getTextContent(children));
                        const slug = slugify(text);
                        return (
                            <h1 id={slug} className="scroll-mt-24 !mt-12 !mb-6" {...props}>
                                {children}
                            </h1>
                        );
                    },
                    h2({ children, ...props }) {
                        const text = stripInlineMarkdown(getTextContent(children));
                        const slug = slugify(text);
                        return (
                            <h2 id={slug} className="scroll-mt-24 !mt-8 !mb-4" {...props}>
                                {children}
                            </h2>
                        );
                    },
                    h3({ children, ...props }) {
                        const text = stripInlineMarkdown(getTextContent(children));
                        const slug = slugify(text);
                        return (
                            <h3 id={slug} className="scroll-mt-24 !mt-6 !mb-3" {...props}>
                                {children}
                            </h3>
                        );
                    },
                    h4({ children, ...props }) {
                        const text = stripInlineMarkdown(getTextContent(children));
                        const slug = slugify(text);
                        return (
                            <h4 id={slug} className="scroll-mt-24 !mt-4 !mb-2" {...props}>
                                {children}
                            </h4>
                        );
                    },
                    p({ children, ...props }) {
                        const text = getTextContent(children);
                        if (typeof text === "string" && text.trim().startsWith("|")) {
                            const content = text.trim().substring(1).trim();
                            const slug = slugify(content);
                            return (
                                <h2
                                    id={slug}
                                    className="scroll-mt-24 !mt-8 !mb-4 border-l-4 border-zinc-800 dark:border-zinc-200 pl-4 font-bold text-2xl tracking-tighter text-[var(--foreground)]"
                                    {...props}
                                >
                                    {content}
                                </h2>
                            );
                        }
                        return <p {...props}>{children}</p>;
                    },
                    code({
                        inline,
                        className,
                        children,
                        ...props
                    }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) {
                        const match = /language-([\w-]+)/.exec(className || "");
                        const lang = match ? match[1] : "text";
                        const code = String(children).replace(/\n$/, "");
                        const label = lang === "text" ? "TEXT" : lang.toUpperCase();

                        if (!inline && lang === "mermaid") {
                            return (
                                <div className="mermaid my-8 flex justify-center bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-[var(--border)] overflow-x-auto">
                                    {code}
                                </div>
                            );
                        }

                        if (!inline && (lang === "steps" || lang === "step")) {
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

                        if (!inline && (lang === "reflections" || lang === "reflection")) {
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

                        if (!inline) {
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
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
