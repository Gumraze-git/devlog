"use client";

import { Tag } from "lucide-react";
import TagBadge from "./ui/TagBadge";

interface TagFilterProps {
    tags: string[];
    selectedTags: string[];
    onToggle: (tag: string) => void;
}

export default function TagFilter({ tags, selectedTags, onToggle }: TagFilterProps) {
    return (
        <div className="sticky top-14 z-20 py-2 bg-[var(--background)]/90 backdrop-blur-sm border-b border-[var(--border)] transition-all duration-200">
            <div className="max-w-screen-xl mx-auto flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[var(--text-soft)] flex-shrink-0">
                    <Tag size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Tags</span>
                </div>

                <div className="relative flex-1 flex items-center overflow-hidden">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        <TagBadge
                            label="All"
                            size="sm"
                            active={selectedTags.length === 0}
                            ariaPressed={selectedTags.length === 0}
                            onClick={() => onToggle("all")}
                            className="flex-shrink-0"
                        />
                        {tags.map((tag) => {
                            const isActive = selectedTags.includes(tag);
                            return (
                                <TagBadge
                                    key={tag}
                                    label={tag}
                                    size="sm"
                                    active={isActive}
                                    ariaPressed={isActive}
                                    onClick={() => onToggle(tag)}
                                    className="flex-shrink-0"
                                />
                            );
                        })}
                    </div>

                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
