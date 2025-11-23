"use client";

import SectionWatcher from "../../components/layout/SectionWatcher";
import SlideUpInView from "../../components/layout/SlideUpInView";
import AboutSectionContent from "./AboutSection";
import SkillSectionContent from "./SkillSection";

export default function AboutSkillSection() {
  return (
    <SectionWatcher id="about" className="scroll-mt-32">
      <SlideUpInView>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card-muted)] p-8 shadow-sm mt-20 shadow-[var(--shadow)]">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-start">
            <AboutSectionContent />
            <SkillSectionContent />
          </div>
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}
