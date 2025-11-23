"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type SectionWatchContextValue = {
  activeId: string;
  activate: (id: string) => void;
  deactivate: (id: string) => void;
  sections: string[];
};

const SectionWatchContext = createContext<SectionWatchContextValue | undefined>(undefined);

type SectionWatchProviderProps = {
  sections: string[];
  children: React.ReactNode;
};

export function SectionWatchProvider({ sections, children }: SectionWatchProviderProps) {
  // 첫 섹션을 Home으로 설정
  const firstSection = sections[0];
  // 기본 active 상태
  const [activeId, setActiveId] = useState(firstSection);

  const activate = useCallback(
    (id: string) => {
      setActiveId(id);
    },
    []
  );

  const deactivate = useCallback((id: string) => {
    setActiveId((prev) => (prev === id ? "" : prev));
  }, []);

  // 페이지 최상단 감지
  useEffect(() => {
    const checkScrollEnds = () => {
      // window.scrollY는 document의 세로 스크롤 위치를 나타냄.
      // window.scrollY < 20은 현재 스크롤이 최상단에 가까운지를 검사함.
      if (window.scrollY < 20) {
        setActiveId(firstSection);
        return;
      }

      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 40;
      if (nearBottom) {
        // contact로 설정
        setActiveId(sections[sections.length - 1]);
      }
    };
    // 페이지가 스크롤 될 때마다 checkScrollEnds 함수가 호출
    window.addEventListener("scroll", checkScrollEnds, { passive: true });
    return () => window.removeEventListener("scroll", checkScrollEnds);
  }, [firstSection, sections]);

  const value = useMemo(
    () => ({ activeId, sections, activate, deactivate }),
    [activeId, sections, activate, deactivate]
  );

  return <SectionWatchContext.Provider value={value}>{children}</SectionWatchContext.Provider>;
}

export function useSectionWatch() {
  const context = useContext(SectionWatchContext);
  if (!context) {
    throw new Error("useSectionWatch must be used within SectionWatchProvider");
  }
  return context;
}
