import { ExternalLink, Github } from "lucide-react";

import type { ProjectSourceLink } from "./projectDetail.helpers";

type ProjectSourceLinksProps = {
  sourceLinks: ProjectSourceLink[];
};

function sourceIconFor(label: string, url: string) {
  const normalized = `${label} ${url}`.toLowerCase();
  return normalized.includes("github") ? Github : ExternalLink;
}

export default function ProjectSourceLinks({ sourceLinks }: ProjectSourceLinksProps) {
  if (sourceLinks.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {sourceLinks.map((source) => {
        const Icon = sourceIconFor(source.label, source.url);

        return (
          <a
            key={`${source.label}-${source.url}`}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[13px] font-bold text-[var(--foreground)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50"
            aria-label={source.label}
          >
            <Icon size={15} aria-hidden className="opacity-90" />
            {source.label}
          </a>
        );
      })}
    </div>
  );
}
