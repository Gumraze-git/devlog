import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DKim Devlog",
  description: "기술 블로그 & 포트폴리오",
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans bg-[var(--background)] text-[var(--foreground)]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2">
          Skip to content
      </a>
      {children}
      </body>
    </html>
  );
}
