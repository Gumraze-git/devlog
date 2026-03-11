import type { Metadata } from "next";

import { AboutExperienceSection } from "./AboutExperienceSection";
import { AboutHeroSection } from "./AboutHeroSection";
import { AboutProjectsSection } from "./AboutProjectsSection";
import { AboutSkillsSection } from "./AboutSkillsSection";
import { AboutVisionSection } from "./AboutVisionSection";
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

export default function AboutPage() {
  return <AboutContent />;
}
