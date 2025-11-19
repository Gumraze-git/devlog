"use client";

import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

type SlideUpInViewProps = PropsWithChildren<{
  delay?: number;
}>;

export default function SlideUpInView({ delay = 0, children }: SlideUpInViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}
