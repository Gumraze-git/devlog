import Link from "next/link";
import { Terminal } from "lucide-react";

export function TopNav() {
    return (
        <nav className="fixed top-0 left-0 right-0 h-14 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md z-50 flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity">
                    <div className="p-1.5 rounded bg-black text-white dark:bg-white dark:text-black">
                        <Terminal size={20} strokeWidth={3} />
                    </div>
                    <span className="text-lg tracking-tight">DKim Devlog</span>
                </Link>
            </div>

            <div className="flex items-center gap-6 text-sm font-medium text-[var(--text-muted)]">
                <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
                    Home
                </Link>
                <Link href="/devlog" className="hover:text-[var(--foreground)] transition-colors">
                    Devlog
                </Link>
                <Link href="/projects" className="hover:text-[var(--foreground)] transition-colors">
                    Projects
                </Link>
                <Link href="/about" className="hover:text-[var(--foreground)] transition-colors">
                    About Me
                </Link>
            </div>
        </nav>
    );
}
