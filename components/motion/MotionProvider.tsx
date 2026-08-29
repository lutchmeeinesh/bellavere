"use client";

import { MotionConfig } from "framer-motion";

/**
 * Global Framer Motion config. `reducedMotion="user"` disables transform and
 * layout animations for users with `prefers-reduced-motion` set.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
