"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    return (
        <button
            suppressHydrationWarning
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)] transition-all"
            aria-label="Toggle theme"
        >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
    );
}
