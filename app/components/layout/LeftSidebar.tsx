import Link from "next/link";
import Image from "next/image";
import { Github, Mail } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";

export function LeftSidebar() {
    return (
        <aside className="hidden lg:flex fixed top-14 left-0 bottom-0 w-64 border-r border-[var(--border)] bg-[var(--background)] flex-col p-6">
            {/* Profile Section */}
            <div className="mb-8 flex flex-col gap-4">
                <div className="relative w-48 h-48 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--card)] mx-auto lg:mx-0">
                    <Image
                        src="https://htmacgfeigx1pttr.public.blob.vercel-storage.com/image/IMG_5362.jpeg"
                        alt="Profile"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <div>
                    <h2 className="font-bold text-lg leading-tight">Daehwan Kim</h2>
                    <p className="text-xs text-[var(--text-soft)] mt-1">Backend Developer</p>
                </div>

                <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed whitespace-pre-line">
                    개발 참 즐겁습니다.{"\n"}
                    공식문서 읽는 것을 즐깁니다.{"\n"}
                    배드민턴 치는 것을 좋아합니다.
                </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-between">
                <div className="flex gap-3 text-[var(--text-muted)]">
                    <a href="https://github.com/Gumraze-git" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)] transition-colors">
                        <Github size={18} />
                    </a>
                    <a href="mailto:galaxydh4110@gmail.com" className="hover:text-[var(--foreground)] transition-colors">
                        <Mail size={18} />
                    </a>
                </div>
            </div>



            {/* Status & Theme Toggle */}
            <div className="mt-auto flex items-end justify-between">
                <div>
                    <div className="text-xs font-semibold text-[var(--text-soft)] uppercase tracking-wider mb-3">
                        Status
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Open to work
                    </div>
                </div>
                <div className="pb-1">
                    <ThemeToggle />
                </div>
            </div>
        </aside>
    );
}
