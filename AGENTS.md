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
- `app/lib/`: Shared helpers and utilities.
- `app/data/`: Local data sources.
- `posts/`: Content (organized by topic).
- `public/`: Static assets.

## Content pipeline (project-specific)
- Devlog list is built from Velog RSS in `app/lib/posts.ts` (`getAllPostsWithVelog`). Local devlog files are only used by the detail page and should live in `posts/devlog/` if you add them.
- Project content is parsed from `posts/projects/` via `app/lib/projects.ts` (front matter required).
- `posts/education/` currently stores content only; do not assume there is an active page or loader for it unless you add one.
- Markdown rendering (including `mermaid`) uses `app/components/MarkdownRenderer.tsx`. Reuse this component for new markdown pages.
- For project troubleshooting accordions, use `~~~troubleshooting` blocks with labeled sections: `제목:`, `문제:`, `원인:`, `해결:`, `결과:`. Each section can contain multiline markdown, bullet/number lists, and fenced code blocks.
- Label lines must start at the beginning of the line (for example `문제:`). List items like `- 문제: ...` are treated as normal bullets, not section labels.
- Example:
  ```
  ~~~troubleshooting
  제목: 예시

  문제:
  - 사용자 플로우가 특정 조건에서 중단됨
  - 문제: 예외 응답 형식이 도메인별로 달라짐

  해결:
  - [x] 공통 오류 계약으로 통일
  - [x] 핵심 경로 회귀 테스트 추가
  ~~~
  ```
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
- In every final response, ALWAYS include a concise `Manual QA` section with step-by-step checks relevant to the change, even when automated checks pass.
- When changes affect routing, caching, server/client boundaries, data fetching, or UI behavior, the `Manual QA` section should cover direct URL entry, refresh behavior, back/forward navigation, and the main happy path plus at least one failure or empty-state scenario.

## Dependency changes
- Ask before adding new production dependencies.
- If you add or upgrade dependencies, update `package.json` and `package-lock.json` together.

## Change summaries
- When you change UI behavior or layout, summarize the user-visible impact in the final response.
- Pair the change summary with concrete manual verification steps so the user can validate behavior locally without inferring the checks.

## Official references used for this guide
- Next.js App Router: https://nextjs.org/docs/app
- Next.js Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js Image (`next/image`): https://nextjs.org/docs/app/getting-started/images
- React Server Components and directives: https://react.dev/reference/rsc/server-components
- Tailwind CSS v4 docs: https://tailwindcss.com/docs
- TypeScript `strict`: https://www.typescriptlang.org/tsconfig/strict.html
