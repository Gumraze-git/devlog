"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type SectionWatchContextValue = {
  activeId: string;
  activate: (id: string) => void;
  markInteracted: () => void;
  sections: string[];
};

const SectionWatchContext = createContext<SectionWatchContextValue | undefined>(undefined);

type SectionWatchProviderProps = {
  sections: string[];
  children: React.ReactNode;
};

export function SectionWatchProvider({ sections, children }: SectionWatchProviderProps) {
  const firstSection = sections[0] ?? "";
  const [activeId, setActiveId] = useState(firstSection);
  const [hasInteracted, setHasInteracted] = useState(false);
  const sectionsKey = sections.join("|");

  useEffect(() => {
    const handleScroll = () => {
      setHasInteracted(true);
    };
    window.addEventListener("scroll", handleScroll, { once: true, passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activate = useCallback(
    (id: string) => {
      if (!hasInteracted && id !== firstSection) return;
      setActiveId(id);
    },
    [hasInteracted, firstSection]
  );

  const markInteracted = useCallback(() => {
    setHasInteracted(true);
  }, []);

  const value = useMemo(
    () => ({ activeId, sections, activate, markInteracted }),
    [activeId, sectionsKey, activate, markInteracted]
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
