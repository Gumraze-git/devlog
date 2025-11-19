"use client";

import { useCallback, useRef, useState } from "react";

import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";
import SkillItem from "../components/skill/SkillItem";
import { skillCategories, skills } from "../data/skills";

export default function AboutSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = useCallback(
    (id: string) => {
      setActiveCategory((prev) => (prev === id ? null : id));
    },
    []
  );

  const filteredSkills = skills.map((skill) => ({
    ...skill,
    active: !activeCategory || skill.categoryId === activeCategory,
  }));

  return (
    <SectionWatcher id="about" className="scroll-mt-32">
      <SlideUpInView>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm mt-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-start">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">About</p>
                <h2 className="text-3xl font-bold text-slate-900">기록하는 개발자</h2>
                <p className="text-slate-700">
                  문제의 원인을 기록하고 개발 원리에 기반하여 해결하는 것을 즐깁니다.
                  언제나 기록을 통해서 지속적인 학습을 통해 최신 기술을 습득합니다.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Skill</p>
                <h2 className="text-3xl font-bold text-slate-900">기술 스택 및 도구</h2>
                <p className="text-sm text-slate-600">카테고리를 선택해 주요 경험을 확인하세요.</p>
              </div>
              <div
                ref={trackRef}
                className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1.5 ml-8 mr-8"
              >
                {skillCategories.map((category) => {
                  const isActive = activeCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      className={`relative z-10 rounded-full px-3 py-1 text-sm font-semibold transition ${
                        isActive ? "text-emerald-600" : "text-slate-500"
                      }`}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-4">
                {filteredSkills.map((skill) => (
                  <SkillItem key={skill.label} label={skill.label} active={skill.active} image={skill.image} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}
