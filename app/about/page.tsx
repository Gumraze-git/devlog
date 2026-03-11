import type { Metadata } from "next";
import { Suspense } from "react";

import { AboutExperienceSection } from "./AboutExperienceSection";
import { AboutHeroSection } from "./AboutHeroSection";
import { AboutProjectsSection } from "./AboutProjectsSection";
import { AboutSkillsSection } from "./AboutSkillsSection";
import { AboutVisionSection } from "./AboutVisionSection";
import { Skeleton } from "../components/ui/Skeleton";
import { experienceItems } from "../data/experience";
import { createPageMetadata } from "../lib/metadata";
import { getAboutProjects } from "../lib/projects";

export const metadata: Metadata = createPageMetadata({
    title: "About",
    description: "개발자 소개, 경험, 프로젝트 요약 정보를 담은 페이지입니다.",
    path: "/about",
});

function AboutContent() {
  const aboutProjects = getAboutProjects();

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-32">
      <AboutHeroSection />
      <AboutExperienceSection items={experienceItems} />
      <AboutProjectsSection aboutProjects={aboutProjects} />
      <AboutSkillsSection />
      <AboutVisionSection />
    </div>
  );
}

function AboutSkeleton() {
  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-32">
      <section className="grid items-start gap-10 md:grid-cols-[1fr_auto]">
        <div className="order-2 space-y-6 md:order-1">
          <Skeleton className="h-12 w-3/4 md:h-16" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        </div>
        <Skeleton className="order-1 h-56 w-56 rounded-2xl md:order-2 md:h-64 md:w-64" />
      </section>

      <section className="space-y-8">
        <div className="border-b border-[var(--border)] pb-4">
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="space-y-12">
          {[1, 2].map((i) => (
            <div key={i} className="grid gap-8 md:grid-cols-[250px_1fr]">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={<AboutSkeleton />}>
      <AboutContent />
    </Suspense>
  );
}
