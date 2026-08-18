"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useStageLayer } from "@/components/stage";

/**
 * Where one piece of a screen goes when that screen is dismissed.
 *
 * Deliberately flat compared with the bento's tumble: no depth, no rotation on
 * two axes, just cards swept off the table. Two screens coming apart the same
 * way would read as one long effect rather than two places.
 */
export type Exit = {
  x: number;
  y: number;
  /** Roll, in degrees. */
  r: number;
  /** Scale it ends on. */
  s: number;
};

/**
 * Wraps one piece of a stage screen so it leaves on its own path.
 *
 * Outside a stage this renders nothing of its own, so the sections it is used
 * in still work anywhere else on the page.
 */
export function StageExit({
  exit,
  index = 0,
  className,
  children,
}: {
  exit: Exit;
  index?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const layer = useStageLayer();
  const reduceMotion = useReducedMotion();

  // Each piece lets go a beat after the one before it, so the screen comes
  // apart in sequence rather than all at once.
  const start = Math.min(0.3, index * 0.08);
  // A standing zero for when this is rendered outside a stage: the hook order
  // has to hold either way.
  const idle = useMotionValue(0);
  const t = useTransform(layer?.leave ?? idle, [start, 1], [0, 1], { clamp: true });

  const x = useTransform(t, [0, 1], [0, exit.x]);
  const y = useTransform(t, [0, 1], [0, exit.y]);
  const rotate = useTransform(t, [0, 1], [0, exit.r]);
  const scale = useTransform(t, [0, 1], [1, exit.s]);
  const opacity = useTransform(t, [0, 0.7], [1, 0], { clamp: true });
  const blur = useTransform(t, [0, 1], [0, 14]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  if (!layer) return <div className={className}>{children}</div>;

  return (
    <motion.div
      style={reduceMotion ? { opacity } : { x, y, rotate, scale, opacity, filter }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
