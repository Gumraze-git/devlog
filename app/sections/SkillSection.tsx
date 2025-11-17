"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";

import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";
import SkillItem from "../components/skill/SkillItem";
import { skillCategories, skills } from "../data/skills";

export default function SkillSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const indicatorX = useMotionValue(0);
  const indicatorWidth = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = useCallback(
    (id: string, el: HTMLButtonElement | null) => {
      const nextId = activeCategory === id ? null : id;
      setActiveCategory(nextId);
      if (!el || !trackRef.current || !nextId) {
        indicatorX.set(0);
        indicatorWidth.set(0);
        return;
      }
      const buttonRect = el.getBoundingClientRect();
      const trackRect = trackRef.current.getBoundingClientRect();
      indicatorX.set(buttonRect.left - trackRect.left);
      indicatorWidth.set(buttonRect.width);
    },
    [activeCategory, indicatorWidth, indicatorX]
  );

  const filteredSkills = skills.map((skill) => ({
    ...skill,
    active: !activeCategory || skill.categoryId === activeCategory,
  }));

  return (
    <SectionWatcher id="skill" className="scroll-mt-32">
      <SlideUpInView>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Skill</p>
            <h2 className="text-3xl font-bold text-slate-900">사용 도구 & 역량</h2>
            <p className="text-slate-600">프로덕션 경험이 있는 기술 스택을 카테고리별로 정리합니다.</p>
          </div>
          <div className="space-y-8">
            <div
              ref={trackRef}
              className="relative flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1"
            >
              {skillCategories.map((category) => {
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    className={`relative z-10 rounded-full px-3 py-1 text-sm font-semibold transition ${
                      isActive ? "text-emerald-600" : "text-slate-500"
                    }`}
                    onClick={(e) => handleCategoryClick(category.id, e.currentTarget)}
                  >
                    {category.name}
                  </button>
                );
              })}
              <motion.div
                className="absolute inset-y-1 rounded-full bg-white shadow-sm"
                style={{ x: indicatorX, width: indicatorWidth }}
                animate={{ opacity: activeCategory ? 1 : 0 }}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {filteredSkills.map((skill) => (
                <SkillItem key={skill.label} label={skill.label} active={skill.active} icon={skill.icon} />
              ))}
            </div>
          </div>
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}
