"use client";

import { useEffect } from "react";
import { useMotionValue, type MotionValue } from "motion/react";

/**
 * Page scroll as 0–1.
 *
 * Measured live rather than from a cached scroll range: the document grows when
 * the loader releases the page and again as sections settle, and a range read
 * once at mount is wrong from that moment on. A ResizeObserver on the document
 * keeps the denominator honest, and reads are coalesced onto the display clock.
 */
export function useScrollProgress(): MotionValue<number> {
  const progress = useMotionValue(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.set(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [progress]);

  return progress;
}
