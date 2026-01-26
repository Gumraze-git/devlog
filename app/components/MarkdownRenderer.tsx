"use client";

import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import mermaid from "mermaid";

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
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const containerRef = useRef<HTMLDivElement>(null);

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
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        const lang = match ? match[1] : "";

                        if (!inline && lang === "mermaid") {
                            return (
                                <div className="mermaid my-8 flex justify-center bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-[var(--border)] overflow-x-auto">
                                    {String(children).replace(/\n$/, "")}
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
