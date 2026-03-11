import Image from "next/image";
import { Github, Mail } from "lucide-react";

import { siteProfile } from "../../data/siteProfile";
import { ThemeToggle } from "../ui/ThemeToggle";

const socialIconMap = {
    github: Github,
    mail: Mail,
};

export function LeftSidebar() {
    return (
        <aside className="hidden lg:flex fixed top-14 left-0 bottom-0 z-40 w-64 border-r border-[var(--border)] bg-[var(--background)] flex-col p-6">
            {/* Profile Section */}
            <div className="mb-8 flex flex-col gap-4">
                <div className="relative w-48 h-48 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--card)] mx-auto lg:mx-0">
                    <Image
                        src={siteProfile.image.src}
                        alt={siteProfile.image.alt}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <div>
                    <h2 className="font-bold text-lg leading-tight">{siteProfile.name}</h2>
                    <p className="text-xs text-[var(--text-soft)] mt-1">{siteProfile.role}</p>
                </div>

                <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed whitespace-pre-line">
                    {siteProfile.bio}
                </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-between">
                <div className="flex gap-3 text-[var(--text-muted)]">
                    {siteProfile.socialLinks.map((link) => {
                        const Icon = socialIconMap[link.kind];
                        const isExternal = link.href.startsWith("http");

                        return (
                            <a
                                key={link.href}
                                href={link.href}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className="hover:text-[var(--foreground)] transition-colors"
                                aria-label={link.label}
                            >
                                <Icon size={18} />
                            </a>
                        );
                    })}
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
                        {siteProfile.status.label}
                    </div>
                </div>
                <div className="pb-1">
                    <ThemeToggle />
                </div>
            </div>
        </aside>
    );
}
