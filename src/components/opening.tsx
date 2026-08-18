"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Wordmark } from "@/components/wordmark";

/** How long the mark holds the screen before the site opens. */
const DWELL = 3000;

/**
 * The entrance.
 *
 * One timer drives both halves so they cannot drift: the veil lifts and blurs
 * away at the same moment the site expands to fill the frame from slightly
 * inside it. The scale is dropped the instant it lands — a lingering transform
 * would make every `position: fixed` child inside it position against this
 * element instead of the viewport.
 */
export function Opening({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [settled, setSettled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    const started = performance.now();

    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) =>
            window.addEventListener("load", () => resolve(), { once: true }),
          ),
    ]);

    ready.then(() => {
      const wait = Math.max(0, DWELL - (performance.now() - started));
      window.setTimeout(() => !cancelled && setOpen(true), wait);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Hold the page still while the overlay owns the screen.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "" : "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
        animate={
          open ? (reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }) : undefined
        }
        transition={
          reduceMotion
            ? { duration: 0.3, ease: "easeOut" }
            : { type: "spring", bounce: 0, duration: 0.9 }
        }
        onAnimationComplete={() => setSettled(true)}
        style={settled ? { transform: "none", opacity: 1 } : { originY: 0.5 }}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {!open ? (
          <motion.div
            key="loader"
            initial={false}
            exit={
              reduceMotion
                ? { opacity: 0, transition: { duration: 0.25, ease: "easeOut" } }
                : {
                    opacity: 0,
                    scale: 1.06,
                    filter: "blur(12px)",
                    transition: { type: "spring", bounce: 0, duration: 0.7 },
                  }
            }
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          >
            {/* Barely there — the entrance is the point, and the mark should not
                still be competing with the site once it arrives. */}
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: "blur(10px)" }}
              animate={reduceMotion ? { opacity: 0.22 } : { opacity: 0.22, scale: 1, filter: "blur(0px)" }}
              transition={{ type: "spring", bounce: 0, duration: 0.9 }}
            >
              <Wordmark className="h-12 sm:h-16" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
