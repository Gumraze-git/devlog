import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionHeader } from "./components/common/SectionHeader";
import { FeaturedProjectsSection } from "./components/home/FeaturedProjectsSection";
import { FeaturedProjectsSkeleton } from "./components/home/FeaturedProjectsSkeleton";
import { HomeHeroSection } from "./components/home/HomeHeroSection";
import { RecentPostsSection } from "./components/home/RecentPostsSection";
import { RecentPostsSkeleton } from "./components/home/RecentPostsSkeleton";

export const revalidate = 1800;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <div className="space-y-12 md:space-y-16 animate-in fade-in duration-500 pb-20">
      <HomeHeroSection />

      {/* Featured / Recent Devlog */}
      <section className="space-y-8">
        <SectionHeader
          eyebrow="Live Feed"
          title="Latest Devlog"
          action={(
            <Link href="/devlog" className="group flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]">
              Display all
              <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        />

        <Suspense fallback={<RecentPostsSkeleton />}>
          <RecentPostsSection />
        </Suspense>
      </section>

      {/* Featured Projects */}
      <section className="space-y-8">
        <SectionHeader
          eyebrow="Archive"
          title="Project"
          action={(
            <Link href="/projects" className="group flex items-center text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]">
              View All
              <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        />

        <Suspense fallback={<FeaturedProjectsSkeleton />}>
          <FeaturedProjectsSection />
        </Suspense>
      </section>

    </div>
  );
}
