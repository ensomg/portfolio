"use client";

import { motion, useReducedMotion, useTransform } from "motion/react";
import { useScrollProgress } from "@/lib/use-scroll-progress";

/**
 * The nudge that says there is more below. It fades out as soon as the page
 * starts moving — once you know, it has nothing left to tell you.
 */
export function ScrollCue() {
  const progress = useScrollProgress();
  const reduceMotion = useReducedMotion();
  const opacity = useTransform(progress, [0, 0.03], [1, 0], { clamp: true });

  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none fixed inset-x-0 bottom-6 z-10 flex justify-center sm:bottom-8"
    >
      <motion.span
        aria-hidden
        animate={reduceMotion ? undefined : { y: [0, 5, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="text-soft"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="size-5"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.span>
    </motion.div>
  );
}
