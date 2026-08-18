"use client";

import { useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useSmoothStageProgress } from "@/lib/use-scroll-progress";

/**
 * Where the second screen starts arriving, and where it has fully landed.
 *
 * These overlap the scatter deliberately. Wait for the first screen to be gone
 * before starting the second and the middle of the scroll is a dim trough with
 * neither of them in it.
 */
const ARRIVE_FROM = 0.26;
const ARRIVE_TO = 0.78;

/** Past this it is solid enough to be worth clicking. */
const REACHABLE = 0.65;

/**
 * The first two screens share one viewport that stays pinned.
 *
 * Scrolling a section away and the next one up means the arriving screen is
 * always a rectangle sliding into frame. Here the first screen comes apart on
 * its own timings while the second one comes forward out of the depth behind
 * it, so the second screen arrives instead of being pushed in. Nothing moves
 * vertically — the scroll is spent entirely on the two of them trading places.
 */
export function Stage({ front, back }: { front: React.ReactNode; back: React.ReactNode }) {
  const progress = useSmoothStageProgress();
  const reduceMotion = useReducedMotion();
  const [reachable, setReachable] = useState(false);

  const t = useTransform(progress, [ARRIVE_FROM, ARRIVE_TO], [0, 1], { clamp: true });
  const scale = useTransform(t, [0, 1], [0.86, 1]);
  const z = useTransform(t, [0, 1], [-300, 0]);
  const blur = useTransform(t, [0, 1], [10, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  // A threshold, not a per-frame style: this crosses twice in a whole scroll,
  // so a render is cheaper than writing pointer-events every frame.
  useMotionValueEvent(t, "change", (value) => {
    const next = value > REACHABLE;
    setReachable((current) => (current === next ? current : next));
  });

  return (
    <div className="relative min-h-[300dvh]">
      <div
        className="sticky top-0 grid h-dvh w-full place-items-center overflow-hidden px-3 sm:px-5"
        // One shared space, so the two screens read as the same room rather
        // than two pictures crossfading.
        style={{ perspective: 1400 }}
      >
        <div className="col-start-1 row-start-1 w-full max-w-5xl">{front}</div>

        <motion.div
          aria-hidden={!reachable}
          style={
            reduceMotion
              ? { opacity: t }
              : { opacity: t, scale, z, filter, transformStyle: "preserve-3d" }
          }
          className={
            "col-start-1 row-start-1 w-full max-w-5xl " +
            (reachable ? "" : "pointer-events-none")
          }
        >
          {back}
        </motion.div>
      </div>
    </div>
  );
}
