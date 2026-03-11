export type SiteNavigationItem = {
  href: string;
  label: string;
};

export type SiteSocialLink = {
  href: string;
  label: string;
  kind: "github" | "mail";
};

export const siteBrand = {
  href: "/",
  label: "DKim Devlog",
};

export const siteNavigation: SiteNavigationItem[] = [
  { href: "/", label: "Home" },
  { href: "/devlog", label: "Devlog" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About Me" },
];

export const siteProfile = {
  name: "Daehwan Kim",
  role: "Backend Developer",
  bio: "개발 참 즐겁습니다.\n공식문서 읽는 것을 즐깁니다.\n배드민턴 치는 것을 좋아합니다.",
  image: {
    src: "https://htmacgfeigx1pttr.public.blob.vercel-storage.com/image/IMG_5362.jpeg",
    alt: "Profile",
  },
  status: {
    label: "Open to work",
  },
  socialLinks: [
    {
      href: "https://github.com/Gumraze-git",
      label: "GitHub",
      kind: "github" as const,
    },
    {
      href: "mailto:galaxydh4110@gmail.com",
      label: "Email",
      kind: "mail" as const,
    },
  ] satisfies SiteSocialLink[],
};
