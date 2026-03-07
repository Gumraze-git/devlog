import type { MetadataRoute } from "next";
import { getCanonicalUrl, getSiteUrl } from "./lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: getCanonicalUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
