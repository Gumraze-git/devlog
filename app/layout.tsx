import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "./components/layout/AppLayout";
import { ThemeProvider } from "./components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "DKim Devlog",
  description: "기술 블로그 & 포트폴리오",
  metadataBase: new URL("https://your-domain.com"),
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "DKim Devlog",
    description: "기술 블로그 & 포트폴리오",
    url: "https://your-domain.com",
    siteName: "DKim Devlog",
    images: [
      {
        url: "https://your-domain.com/og-default.svg",
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
    images: ["https://your-domain.com/og-default.svg"],
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
