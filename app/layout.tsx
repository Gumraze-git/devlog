import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/app/components/layout/NavBar";
// import { ScrollProgress } from "@/app/components/ScrollProgress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DKim Devlog",
  description: "기술 블로그 & 포트폴리오",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className="font-sans bg-slate-950 text-slate-100"
      >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2">
          Skip to content
      </a>
      {/*<ScrollProgress />*/}
      <NavBar />
      <main id="main" className="mx-auto max-w-6xl px-4 py-16">
          {children}
      </main>
      </body>
    </html>
  );
}
