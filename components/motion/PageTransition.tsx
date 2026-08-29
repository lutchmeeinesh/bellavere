"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Route-change transition: content fades in and rises 12px over 0.45s.
 * Used by `template.tsx` files so it re-runs on every navigation.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
