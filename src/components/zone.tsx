"use client";

import { useEffect, useRef } from "react";
import { useInView } from "motion/react";

/**
 * Repaints the whole site while this section holds the screen.
 *
 * The name is written to `<html data-zone>` rather than handled locally, so the
 * background, the floating chrome and every panel shift together — a change
 * that stopped at this section's edge would read as a styling accident rather
 * than a place you have arrived at.
 */
export function Zone({ name, children }: { name: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });

  useEffect(() => {
    const root = document.documentElement;
    if (inView) {
      root.dataset.zone = name;
    } else if (root.dataset.zone === name) {
      delete root.dataset.zone;
    }
  }, [inView, name]);

  // Leaving the page mid-zone should not strand the palette.
  useEffect(() => {
    const root = document.documentElement;
    return () => {
      if (root.dataset.zone === name) delete root.dataset.zone;
    };
  }, [name]);

  return <div ref={ref}>{children}</div>;
}
