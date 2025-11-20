import { useCallback, useRef, useState } from "react";

import SkillItem from "../../components/skill/SkillItem";
import { skillCategories, skills } from "../../data/skills";

export default function SkillSectionContent() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = useCallback((id: string) => {
    setActiveCategory((prev) => (prev === id ? null : id));
  }, []);

  const filteredSkills = skills.map((skill) => ({
    ...skill,
    active: !activeCategory || skill.categoryId === activeCategory,
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-left">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Skill</p>
        <h2 className="text-3xl font-bold text-slate-900">기술 스택 및 도구</h2>
        <p className="text-sm text-slate-600">카테고리를 선택해 주요 경험을 확인하세요.</p>
      </div>
      <div className="space-y-4 mx-auto w-full">
        {/*카테고리 필터 담당 영역*/}
        <div
          ref={trackRef}
          className="flex flex-wrap items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-1.5"
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
        {/*아이콘 담당 영역*/}
        <div className="flex flex-wrap gap-5 justify-center">
          {filteredSkills.map((skill) => (
            <SkillItem key={skill.label} label={skill.label} active={skill.active} image={skill.image} />
          ))}
        </div>
      </div>
    </div>
  );
}
