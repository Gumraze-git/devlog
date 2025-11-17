"use client";

import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

import { useSectionWatch } from "./SectionWatchProvider";

type SectionWatcherProps = PropsWithChildren<{
  id: string;
  className?: string;
}>;

export default function SectionWatcher({ id, className, children }: SectionWatcherProps) {
  const { activate } = useSectionWatch();

  return (
    <motion.section
      id={id}
      className={className}
      viewport={{ margin: "-50% 0px -30% 0px" }}
      onViewportEnter={() => activate(id)}
    >
      {children}
    </motion.section>
  );
}
