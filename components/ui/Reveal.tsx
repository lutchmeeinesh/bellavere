"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";

/**
 * Scroll-reveal primitives. `Reveal` fades + rises a single block when it
 * enters the viewport (once). `RevealStagger` + `RevealItem` do the same for
 * a group with 0.08s stagger between children.
 *
 * Content is always rendered visible, so it shows without JavaScript and
 * never waits for hydration to paint. Once the page is interactive, blocks
 * that are still below the fold are hidden (off screen, so nobody sees it)
 * and revealed as they scroll into view; blocks already on screen stay put.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealState = "hidden" | "visible";

function useScrollReveal() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });
  const [belowFold, setBelowFold] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (reduceMotion || !element) return;
    if (element.getBoundingClientRect().top > window.innerHeight) {
      setBelowFold(true);
    }
  }, [reduceMotion]);

  const state: RevealState = belowFold && !inView ? "hidden" : "visible";
  return { ref, state };
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  const { ref, state } = useScrollReveal();
  const Component = motion[as];
  const variants: Variants = {
    hidden: { opacity: 0, y, transition: { duration: 0 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: EASE } },
  };

  return (
    <Component
      ref={ref as React.Ref<never>}
      className={className}
      variants={variants}
      initial={false}
      animate={state}
    >
      {children}
    </Component>
  );
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, transition: { duration: 0 } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function RevealStagger({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
}) {
  const { ref, state } = useScrollReveal();
  const Component = motion[as];

  return (
    <Component
      ref={ref as React.Ref<never>}
      className={className}
      variants={containerVariants}
      initial={false}
      animate={state}
    >
      {children}
    </Component>
  );
}

/** A child of `RevealStagger`; follows the group's state. */
export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "span";
}) {
  const Component = motion[as];

  return (
    <Component className={className} variants={itemVariants} initial={false}>
      {children}
    </Component>
  );
}
