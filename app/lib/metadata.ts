import type { Metadata } from "next";
import { getCanonicalPath, getCanonicalUrl } from "./site";

type SeoImage = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: Metadata["keywords"];
  type?: "website" | "article";
  images?: SeoImage[];
  publishedTime?: string;
};

const defaultOgImages: SeoImage[] = [
  {
    url: "/og-default.svg",
    width: 1200,
    height: 630,
    alt: "DKIM DEVLOG",
  },
];

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  type = "website",
  images = defaultOgImages,
  publishedTime,
}: PageMetadataOptions): Metadata {
  const canonicalPath = getCanonicalPath(path);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    keywords,
    openGraph: {
      type,
      url: getCanonicalUrl(canonicalPath),
      title,
      description,
      siteName: "DKim Devlog",
      locale: "ko_KR",
      images,
      publishedTime,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((image) => image.url),
    },
  };
}
