"use client";

import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import mermaid from "mermaid";
import { createCodeKey, createSlugger, stripInlineMarkdown } from "../lib/markdown";

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
    const slugger = createSlugger();
    const codeHtmlMap = codeHtmlByKey ?? {};

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

    return (
        <div ref={containerRef} className="prose prose-lg prose-zinc dark:prose-invert max-w-none prose-headings:tracking-tighter prose-headings:font-bold prose-headings:text-[var(--foreground)] prose-strong:text-[var(--foreground)] prose-strong:font-bold prose-p:text-[var(--text-muted)] prose-p:leading-relaxed prose-li:text-[var(--text-muted)] prose-li:leading-relaxed">
            <ReactMarkdown
                components={{
                    h2({ children, ...props }) {
                        const text = stripInlineMarkdown(getTextContent(children));
                        const slug = slugger(text);
                        return (
                            <h2 id={slug} className="scroll-mt-24" {...props}>
                                {children}
                            </h2>
                        );
                    },
                    h3({ children, ...props }) {
                        const text = stripInlineMarkdown(getTextContent(children));
                        const slug = slugger(text);
                        return (
                            <h3 id={slug} className="scroll-mt-24" {...props}>
                                {children}
                            </h3>
                        );
                    },
                    h4({ children, ...props }) {
                        const text = stripInlineMarkdown(getTextContent(children));
                        const slug = slugger(text);
                        return (
                            <h4 id={slug} className="scroll-mt-24" {...props}>
                                {children}
                            </h4>
                        );
                    },
                    code({
                        inline,
                        className,
                        children,
                        ...props
                    }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) {
                        const match = /language-([\\w-]+)/.exec(className || "");
                        const lang = match ? match[1] : "text";
                        const code = String(children).replace(/\\n$/, "");

                        if (!inline && lang === "mermaid") {
                            return (
                                <div className="mermaid my-8 flex justify-center bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-[var(--border)] overflow-x-auto">
                                    {code}
                                </div>
                            );
                        }

                        if (!inline) {
                            const key = createCodeKey(lang, code);
                            const highlighted = codeHtmlMap[key];
                            if (highlighted) {
                                return (
                                    <div
                                        className="not-prose shiki-wrapper"
                                        dangerouslySetInnerHTML={{ __html: highlighted }}
                                    />
                                );
                            }

                            return (
                                <pre className="not-prose">
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                </pre>
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
