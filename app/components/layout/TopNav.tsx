import Link from "next/link";
import { Terminal } from "lucide-react";

import { siteBrand, siteNavigation } from "../../data/siteProfile";

export function TopNav() {
    return (
        <nav className="fixed top-0 left-0 right-0 h-14 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md z-50 flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
                <Link href={siteBrand.href} className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity">
                    <div className="p-1.5 rounded bg-black text-white dark:bg-white dark:text-black">
                        <Terminal size={20} strokeWidth={3} />
                    </div>
                    <span className="text-lg tracking-tight">{siteBrand.label}</span>
                </Link>
            </div>

            <div className="flex items-center gap-6 text-sm font-medium text-[var(--text-muted)]">
                {siteNavigation.map((item) => (
                    <Link key={item.href} href={item.href} className="hover:text-[var(--foreground)] transition-colors">
                        {item.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
}
