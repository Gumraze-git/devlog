const LOCAL_SITE_URL = "http://localhost:3000";

function isLocalHost(value: string): boolean {
  const withoutProtocol = value.replace(/^https?:\/\//i, "");
  return /^(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(:\d+)?(?:\/.*)?$/i.test(withoutProtocol);
}

export function normalizeSiteUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return LOCAL_SITE_URL;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const protocol = isLocalHost(trimmed) ? "http" : "https";
  return `${protocol}://${trimmed}`;
}

export function getSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate || candidate.trim().length === 0) continue;
    return normalizeSiteUrl(candidate);
  }

  return LOCAL_SITE_URL;
}

export function getCanonicalPath(path = "/"): string {
  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") return "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function getCanonicalUrl(path = "/"): string {
  const siteUrl = getSiteUrl();
  const canonicalPath = getCanonicalPath(path);
  return canonicalPath === "/" ? siteUrl : `${siteUrl}${canonicalPath}`;
}
