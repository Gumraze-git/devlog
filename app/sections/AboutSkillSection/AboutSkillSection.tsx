"use client";

import SectionWatcher from "../../components/layout/SectionWatcher";
import SlideUpInView from "../../components/layout/SlideUpInView";
import AboutSectionContent from "./AboutSection";
import SkillSectionContent from "./SkillSection";

export default function AboutSkillSection() {
  return (
    <SectionWatcher id="about" className="scroll-mt-32">
      <SlideUpInView>
        <div className="grid gap-10 md:gap-12 lg:grid-cols-[1.1fr_1fr] items-start mt-20">
          <AboutSectionContent />
          <SkillSectionContent />
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}
