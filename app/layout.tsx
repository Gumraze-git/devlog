import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "./components/layout/AppLayout";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import { getSiteUrl } from "./lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: {
    default: "DKim Devlog",
    template: "%s | DKim Devlog",
  },
  description: "기술 블로그 & 포트폴리오",
  verification: {
    google: "As2DRwrXZFrHrx3gzjbMqTHPzXVmwgSiSrl0d2ZSths",
  },
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "DKim Devlog",
    description: "기술 블로그 & 포트폴리오",
    url: siteUrl,
    siteName: "DKim Devlog",
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "DKIM DEVLOG",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DKim Devlog",
    description: "기술 블로그 & 포트폴리오",
    images: ["/og-default.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-sans bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
