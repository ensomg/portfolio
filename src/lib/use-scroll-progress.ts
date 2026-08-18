"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring, type MotionValue } from "motion/react";

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

/**
 * The same value, softened.
 *
 * Native scrolling stays exactly as the wheel and the trackpad deliver it —
 * hijacking it is how pages end up feeling laggy and unpredictable. What gets
 * smoothed is everything scroll *drives*: the spring trails the real position
 * by a hair, so transforms glide instead of stepping, and a flick still lands
 * where the gesture said it would.
 */
export function useSmoothScrollProgress(): MotionValue<number> {
  const progress = useScrollProgress();
  return useSpring(progress, { stiffness: 220, damping: 40, mass: 0.6, restDelta: 0.0005 });
}

/**
 * How far the pinned stage has been scrolled, as 0–1.
 *
 * The first screen is held still while it comes apart, so its motion is spread
 * over more than one viewport of scrolling. Measured against a single screen it
 * would all be over within the first flick of the wheel.
 */
export const STAGE_TRAVEL = 1.55;

export function useStageProgress(): MotionValue<number> {
  const progress = useMotionValue(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      const span = window.innerHeight * STAGE_TRAVEL;
      progress.set(span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 0);
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [progress]);

  return progress;
}

/** The stage progress, softened the same way. */
export function useSmoothStageProgress(): MotionValue<number> {
  const progress = useStageProgress();
  return useSpring(progress, { stiffness: 220, damping: 40, mass: 0.6, restDelta: 0.0005 });
}

/**
 * How far the first screen has been scrolled away, as 0–1 of one viewport.
 *
 * Anything tied to leaving the first screen has to be measured against the
 * screen, not the document: page fractions shift every time a section is added,
 * so an effect tuned to look right today finishes halfway up the fold tomorrow.
 */
export function useViewportProgress(): MotionValue<number> {
  const progress = useMotionValue(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      progress.set(Math.min(1, Math.max(0, window.scrollY / window.innerHeight)));
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [progress]);

  return progress;
}

/** The viewport progress, softened the same way. */
export function useSmoothViewportProgress(): MotionValue<number> {
  const progress = useViewportProgress();
  return useSpring(progress, { stiffness: 220, damping: 40, mass: 0.6, restDelta: 0.0005 });
}
