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
- Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4.
- ESLint uses Next.js core-web-vitals + TypeScript configs.
- TypeScript is `strict`.
- Path alias: `@/*`.
- Package manager: `npm` (`package-lock.json` is source of truth).

## Environment baseline
- Local environment is macOS + `zsh`.
- Ensure Node.js version is compatible with Next.js 16 before running build/dev.
- Keep secrets in `.env.local` (never commit secrets).
- Velog integration uses `VELOG_USERNAME` or `NEXT_PUBLIC_VELOG_USERNAME`.

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
- Remote images must be whitelisted in `next.config.ts` (`images.remotePatterns`).

## Frontend development guidelines
- Prefer existing patterns and directory conventions for new UI.
- Keep components small and focused; split large sections into subcomponents.
- Use Server Components by default; add `"use client"` only when required (events/hooks/browser APIs).
- Keep server/client boundaries explicit; when moving logic client-side, check bundle and hydration impact.
- Keep styles in Tailwind utility classes; update `app/globals.css` only for global styles.
- Ensure responsive behavior (mobile + desktop) for layout changes.
- For non-native interactive elements, add appropriate ARIA attributes.
- Prefer `next/image` for large images.
- If you add animations, prefer `framer-motion` (already in deps).
- For markdown content pages, prefer `MarkdownRenderer` instead of introducing a second renderer.
- When using remote images in content, update `next.config.ts` first.

## Data fetching and rendering rules
- Prefer server-side data fetching in App Router.
- If freshness matters, set cache behavior intentionally (`revalidate` or uncached fetch) instead of relying on defaults.
- For static content pages, keep deterministic output to avoid hydration mismatches.

## Quality checks
- ALWAYS run `npm run lint` after meaningful code changes.
- Run `npm run build` when you change Next.js config, routing, or server/client boundaries.
- There is no automated test script configured yet; add one if you introduce tests.

## Dependency changes
- Ask before adding new production dependencies.
- If you add or upgrade dependencies, update `package.json` and `package-lock.json` together.

## Change summaries
- When you change UI behavior or layout, summarize the user-visible impact in the final response.

## Official references used for this guide
- Next.js App Router: https://nextjs.org/docs/app
- Next.js Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js Image (`next/image`): https://nextjs.org/docs/app/getting-started/images
- React Server Components and directives: https://react.dev/reference/rsc/server-components
- Tailwind CSS v4 docs: https://tailwindcss.com/docs
- TypeScript `strict`: https://www.typescriptlang.org/tsconfig/strict.html
