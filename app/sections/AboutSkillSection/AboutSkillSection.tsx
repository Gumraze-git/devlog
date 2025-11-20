"use client";

import SectionWatcher from "../../components/layout/SectionWatcher";
import SlideUpInView from "../../components/layout/SlideUpInView";
import AboutSectionContent from "./AboutSection";
import SkillSectionContent from "./SkillSection";

export default function AboutSkillSection() {
  return (
    <SectionWatcher id="about" className="scroll-mt-32">
      <SlideUpInView>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm mt-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-start">
            <AboutSectionContent />
            <SkillSectionContent />
          </div>
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}
