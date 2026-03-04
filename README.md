This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# devlog

## Mermaid Readability Rules

- Keep text/background contrast at least 4.5:1 and key non-text diagram elements at least 3:1.
- Prefer Mermaid frontmatter `config` for dense, per-diagram tuning (`er.fontSize`, `entityPadding`, `minEntityWidth`, `layoutDirection`).
- Keep renderer-level theme variables as shared defaults, and only use per-diagram overrides when content density requires it.
- Mermaid change checklist: validate contrast in both light and dark mode.
- Mermaid change checklist: visually inspect ER cardinality symbols, relationship labels, and markers.
- Mermaid change checklist: re-check style priority when mixing `classDef default`, custom `classDef`, and direct `style` statements.
- Do not force `font-weight` or fixed color on `.nodeLabel`, `.entityLabel`, `.cluster-label` in post-render CSS.
- Prefer theme variables and in-diagram syntax (for example markdown strings) over post-render label typography overrides.

### Mermaid Palette Baseline

| Role | Dark | Light |
|---|---|---|
| entity/node fill | `#2870bd` | `#8b8d98` |
| entity/node text | `#fcfcfd` | `#0f172a` |
| relationship/label fill | `#696e77` | `#80838d` |
| relationship/label text | `#fcfcfd` | `#0f172a` |
| line/marker/border | `#70b8ff` | `#60646c` |
| semantic success stroke (`sem-success`) | `#3dd68c` | `#218358` |
| semantic warning stroke (`sem-warning`) | `#ffca16` | `#ab6400` |
| semantic danger stroke (`sem-danger`) | `#ff9592` | `#ce2c31` |
| semantic info stroke (`sem-info`) | `#70b8ff` | `#0d74ce` |
| ER attribute rows (`rowEven/rowOdd`) | `#ffffff` | `#ffffff` |

### Flowchart Semantic Class Rules

- Use semantic classes on flowchart nodes only (`class <nodes> sem-success|sem-warning|sem-danger|sem-info;`).
- Semantic classes are stroke-only overrides to avoid breaking text contrast inside nodes.
- Keep ER diagrams on neutral structural colors unless there is a clear domain need for semantic emphasis.
- For ER diagrams, keep the entity title row colored and attribute rows white (`rowEven/rowOdd = #ffffff`).

### Mermaid Contrast Check

- Run `npm run check:mermaid-contrast` after Mermaid palette updates.
- This gate enforces text contrast `>= 4.5:1` and non-text contrast `>= 3.0:1` for the shared palette.
