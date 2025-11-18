"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

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
  const firstSection = sections[0] ?? "";
  const [activeId, setActiveId] = useState(firstSection);
  const sectionsKey = sections.join("|");

  const activate = useCallback(
    (id: string) => {
      setActiveId(id);
    },
    []
  );

  const deactivate = useCallback((id: string) => {
    setActiveId((prev) => (prev === id ? "" : prev));
  }, []);

  const value = useMemo(
    () => ({ activeId, sections, activate, deactivate }),
    [activeId, sectionsKey, activate, deactivate]
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
