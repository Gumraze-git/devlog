export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;
  if (!fromEnv) return "http://localhost:3000";
  return fromEnv.replace(/\/$/, "");
}
