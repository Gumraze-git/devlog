import { useCallback, useRef, useState } from "react";

import SkillItem from "../../components/skill/SkillItem";
import { skillCategories, skills } from "../../data/skills";

export default function SkillSectionContent() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = useCallback((id: string) => {
    if (id === "all") {
      setActiveCategory(null);
      return;
    }
    setActiveCategory((prev) => (prev === id ? null : id));
  }, []);

  const filteredSkills = skills.map((skill) => ({
    ...skill,
    active: !activeCategory || skill.categoryId === activeCategory,
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-left">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-strong)]">Skill</p>
        <h2 className="text-3xl font-bold text-[var(--foreground)]">기술 스택 및 도구</h2>
        <p className="text-sm text-[var(--text-muted)]">카테고리를 선택해 주요 경험을 확인하세요.</p>
      </div>
      <div className="space-y-4 mx-auto w-full">
        {/*카테고리 필터 담당 영역*/}
        <div
          ref={trackRef}
          className="flex flex-wrap items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-subtle)] p-1.5"
        >
          {skillCategories.map((category) => {
            const isActive = category.id === "all" ? activeCategory === null : activeCategory === category.id;
            return (
              <button
                key={category.id}
                className={`relative z-10 rounded-full px-3 py-1 text-sm font-semibold transition ${
                  isActive ? "text-[var(--accent-strong)]" : "text-[var(--text-soft)]"
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </button>
            );
          })}
        </div>
        {/*아이콘 담당 영역*/}
        <div className="relative flex flex-wrap justify-center gap-3 overflow-visible">
          {filteredSkills.map((skill) => (
            <SkillItem
              key={skill.label}
              label={skill.label}
              active={skill.active}
              image={skill.image}
              size={skill.size}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
