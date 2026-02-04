# AGENTS.md

## Purpose
This file gives coding agents the project-specific context needed to work safely and efficiently.

## Instruction precedence
- The closest AGENTS.md to the file you are editing should take precedence.
- If a subdirectory needs different rules, add a nested AGENTS.md there.

## Quick commands (npm)
- Dev server: `npm run dev`
- Build: `npm run build`
- Start (prod): `npm run start`
- Lint: `npm run lint`

## Stack and tooling
- Next.js (App Router), React, TypeScript, Tailwind CSS.
- ESLint uses Next.js core-web-vitals + TypeScript configs.
- TypeScript is `strict`.
- Path alias: `@/*`.

## Project layout
- `app/`: App Router routes, layouts, pages, and UI.
- `app/components/`: Reusable UI components (see `app/components/ui/` for primitives).
- `app/sections/`: Page sections.
- `app/lib/`: Shared helpers and utilities.
- `app/data/`: Local data sources.
- `posts/`: Content (organized by topic).
- `public/`: Static assets.

## Content pipeline (project-specific)
- Devlog list is built from Velog RSS in `app/lib/posts.ts` (`getAllPostsWithVelog`). Local devlog files are only used by the detail page and should live in `posts/devlog/` if you add them.
- Projects and education content are parsed from `posts/projects/` and `posts/education/` via `app/lib/projects.ts` and `app/lib/education.ts` (front matter required).
- Markdown rendering (including `mermaid`) uses `app/components/MarkdownRenderer.tsx`. Reuse this component for new markdown pages.
- Velog username comes from `VELOG_USERNAME` or `NEXT_PUBLIC_VELOG_USERNAME` (default is hardcoded).
- Remote images must be whitelisted in `next.config.ts` (`images.remotePatterns`).

## Frontend development guidelines
- Prefer existing patterns and directory conventions for new UI.
- Keep components small and focused; split large sections into subcomponents.
- Use Server Components by default; add `"use client"` only when required.
- Keep styles in Tailwind utility classes; update `app/globals.css` only for global styles.
- Ensure responsive behavior (mobile + desktop) for layout changes.
- For non-native interactive elements, add appropriate ARIA attributes.
- Prefer `next/image` for large images.
- If you add animations, prefer `framer-motion` (already in deps).

## Quality checks
- ALWAYS run `npm run lint` after meaningful code changes.
- Run `npm run build` when you change Next.js config, routing, or server/client boundaries.
- There is no automated test script configured yet; add one if you introduce tests.

## Dependency changes
- Ask before adding new production dependencies.
- If you add or upgrade dependencies, update `package.json` and `package-lock.json` together.

## Change summaries
- When you change UI behavior or layout, summarize the user-visible impact in the final response.
