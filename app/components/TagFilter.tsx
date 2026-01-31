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
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${!currentTag
                        ? "bg-[var(--accent-strong)] text-white border-[var(--accent-strong)]"
                        : "bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-soft)]"
                    }`}
            >
                All
            </button>
            {tags.map((tag) => (
                <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${currentTag === tag
                            ? "bg-[var(--accent-strong)] text-white border-[var(--accent-strong)]"
                            : "bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-soft)]"
                        }`}
                >
                    #{tag}
                </button>
            ))}
        </div>
    );
}
