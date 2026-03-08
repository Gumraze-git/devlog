# Devlog Publishing Workflow

## Goal
- Publish the canonical article on `gumraze.com` first.
- Keep Velog as a summary/distribution channel.

## New post flow
1. Write the article in Velog.
2. Run `npm run import:velog -- <velog-url>` to generate `posts/devlog/<slug>.md`.
3. Review the imported markdown:
   - fix images or HTML blocks if needed
   - confirm title, description, tags, thumbnail, and `velog_url`
   - confirm the filename matches the front matter `slug`
4. Commit and deploy the site.
5. After the site is live, edit the Velog post into a summary version:
   - keep 2-4 short introductory paragraphs
   - place the site URL near the top
   - avoid leaving the full article duplicated on Velog

## Search Console checklist
1. Verify the domain property in Google Search Console with a DNS TXT record.
2. Submit `https://gumraze.com/sitemap.xml`.
3. Use URL Inspection for:
   - `/`
   - `/devlog`
   - the new `/devlog/[slug]`
4. Recheck indexing status 1-3 weeks later with:
   - Search Console `Pages`
   - Search Console `Search results`
   - Google query `site:gumraze.com "article title"`

## Notes
- New posts should live on the site as the full canonical version.
- Velog should be treated as a funnel, not the source of truth.
