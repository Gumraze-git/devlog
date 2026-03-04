"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

    const isDark = resolvedTheme === "dark";

    return (
        <button
            type="button"
            disabled={!mounted}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)] transition-all"
            aria-label="Toggle theme"
        >
            {mounted ? (
                isDark ? <Sun size={16} /> : <Moon size={16} />
            ) : (
                <span className="block size-4" aria-hidden="true" />
            )}
        </button>
    );
}
