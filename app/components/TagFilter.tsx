"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Tag } from "lucide-react";

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
        <div className="sticky top-14 z-20 -mx-4 px-4 py-3 bg-[var(--background)]/90 backdrop-blur-sm border-b border-[var(--border)] transition-all duration-200">
            <div className="max-w-screen-xl mx-auto flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[var(--text-soft)] flex-shrink-0">
                    <Tag size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Tags</span>
                </div>

                <div className="relative flex-1 flex items-center overflow-hidden">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        <button
                            onClick={() => handleTagClick("all")}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 border flex-shrink-0 ${!currentTag
                                ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                                : "bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-soft)] hover:text-[var(--foreground)]"
                                }`}
                        >
                            All
                        </button>
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => handleTagClick(tag)}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 border flex-shrink-0 ${currentTag === tag
                                    ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                                    : "bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-soft)] hover:text-[var(--foreground)]"
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
