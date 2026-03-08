import { getCanonicalUrl } from "./site";

type ArticleJsonLdInput = {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  keywords?: string[];
};

export function createArticleJsonLd({
  title,
  description,
  path,
  datePublished,
  dateModified,
  image,
  keywords,
}: ArticleJsonLdInput) {
  const canonicalUrl = getCanonicalUrl(path);
  const resolvedImage = image
    ? (image.startsWith("http://") || image.startsWith("https://") ? image : getCanonicalUrl(image))
    : getCanonicalUrl("/og-default.svg");

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    datePublished,
    dateModified: dateModified ?? datePublished,
    image: [resolvedImage],
    keywords,
    author: {
      "@type": "Person",
      name: "Daehwan Kim",
    },
    publisher: {
      "@type": "Organization",
      name: "DKim Devlog",
      logo: {
        "@type": "ImageObject",
        url: getCanonicalUrl("/icon.png"),
      },
    },
  };
}
