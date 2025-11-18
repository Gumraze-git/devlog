"use client";

import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

import { useSectionWatch } from "./SectionWatchProvider";

type SectionWatcherProps = PropsWithChildren<{
  id: string;
  className?: string;
}>;

export default function SectionWatcher({ id, className, children }: SectionWatcherProps) {
  const { activate, deactivate } = useSectionWatch();

  return (
    <motion.section
      id={id}
      className={className}
      viewport={{ margin: "-5% 0px -5% 0px" }}
      onViewportEnter={() => activate(id)}
      onViewportLeave={() => deactivate(id)}
    >
      {children}
    </motion.section>
  );
}
