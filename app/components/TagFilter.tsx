"use strict";

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface TagFilterProps {
    tags: string[];
}

export default function TagFilter({ tags }: TagFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentTag = searchParams.get("tag");

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value === "all") {
                params.delete(name);
            } else {
                params.set(name, value);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleTagClick = (tag: string) => {
        const query = createQueryString("tag", tag);
        router.push(`/devlog${query ? `?${query}` : ""}`, { scroll: false });
    };

    return (
        <div className="flex flex-wrap gap-2 mb-8 items-center">
            <span className="text-sm font-medium text-[var(--text-soft)] mr-2">Categories:</span>
            <button
                onClick={() => handleTagClick("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border backdrop-blur-md ${!currentTag
                    ? "bg-[var(--accent-strong)]/90 text-white border-[var(--accent-strong)] shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105"
                    : "bg-[var(--card-subtle)]/30 border-[var(--border)]/50 text-[var(--text-muted)] hover:bg-[var(--card-subtle)]/60 hover:scale-105 hover:border-[var(--accent)]/50 hover:text-[var(--accent-strong)]"
                    }`}
            >
                All
            </button>
            {tags.map((tag) => (
                <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border backdrop-blur-md ${currentTag === tag
                        ? "bg-[var(--accent-strong)]/90 text-white border-[var(--accent-strong)] shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105"
                        : "bg-[var(--card-subtle)]/30 border-[var(--border)]/50 text-[var(--text-muted)] hover:bg-[var(--card-subtle)]/60 hover:scale-105 hover:border-[var(--accent)]/50 hover:text-[var(--accent-strong)]"
                        }`}
                >
                    #{tag}
                </button>
            ))}
        </div>
    );
}
