"use client";

import { useRef } from "react";
import { easeIn, motion, useMotionTemplate, useReducedMotion, useTransform } from "motion/react";
import { useSmoothStageProgress } from "@/lib/use-scroll-progress";
import { crossFade } from "@/lib/spring";
import { cn } from "@/lib/utils";

/** A panel is clear of the screen by the time three quarters of it has gone. */
const SCATTER_END = 0.8;

export type Drift = {
  /** Where it goes, in px. `z` toward the viewer is positive. */
  x: number;
  y: number;
  z: number;
  /** Roll, and the two tumble axes, in degrees. */
  r: number;
  rx: number;
  ry: number;
  /** Scale it ends on — above 1 for pieces thrown at the camera. */
  s: number;
  /** Fraction of the screen scrolled before this one lets go. */
  d: number;
};

/**
 * A glass panel. Panels arrive by materializing — blur and scale resolve
 * together — so each one reads as a pane sliding into place rather than a
 * rectangle switching on.
 */
export function Panel({
  label,
  action,
  index = 0,
  solid = false,
  drift,
  className,
  contentClassName,
  children,
}: {
  label?: string;
  action?: React.ReactNode;
  index?: number;
  /** Opaque card, for the sections below the fold where the ground is flat. */
  solid?: boolean;
  /**
   * Direction this panel leaves in as the first screen is scrolled away.
   * Each panel carries on outward from roughly where it sits, so the screen
   * comes apart rather than sliding off as one slab.
   */
  drift?: Drift;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const progress = useSmoothStageProgress();

  // A single eased value drives every channel, so the panel cannot come apart
  // in one axis before another. Easing in matters: a linear throw reads as a
  // drift, while holding still and then accelerating reads as being flung.
  const t = useTransform(progress, [drift?.d ?? 0, SCATTER_END], [0, 1], {
    clamp: true,
    ease: easeIn,
  });

  const x = useTransform(t, [0, 1], [0, drift?.x ?? 0]);
  const y = useTransform(t, [0, 1], [0, drift?.y ?? 0]);
  const z = useTransform(t, [0, 1], [0, drift?.z ?? 0]);
  const rotate = useTransform(t, [0, 1], [0, drift?.r ?? 0]);
  const rotateX = useTransform(t, [0, 1], [0, drift?.rx ?? 0]);
  const rotateY = useTransform(t, [0, 1], [0, drift?.ry ?? 0]);
  const scale = useTransform(t, [0, 1], [1, drift?.s ?? 1]);
  const opacity = useTransform(t, [0, 0.72], [1, 0], { clamp: true });
  // Fast motion reads better smeared than sharp — the blur is the speed.
  const blur = useTransform(t, [0, 1], [0, 16]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  const scatter = !drift
    ? undefined
    : reduceMotion
      ? { opacity }
      : { x, y, z, rotate, rotateX, rotateY, scale, opacity, filter };

  // Light catching the glass, tracked 1:1 with the pointer. Written straight to
  // custom properties so following the cursor never costs a React render.
  const trackPointer = (event: React.PointerEvent<HTMLElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    node.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  const body = (
    <motion.section
      ref={ref}
      onPointerMove={trackPointer}
      initial={
        reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.985, filter: "blur(8px)" }
      }
      animate={
        reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
      }
      transition={
        reduceMotion
          ? { ...crossFade, delay: index * 0.03 }
          : { type: "spring", bounce: 0, duration: 0.6, delay: 0.1 + index * 0.07 }
      }
      className={cn(
        "group/panel relative flex h-full flex-col overflow-hidden",
        solid ? "panel-solid" : "panel panel-sheen hover:bg-[var(--panel-hover)]",
        "transition-[background-color,border-color] duration-300",
        !drift && className,
      )}
    >
      {label ? (
        <header className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2 sm:px-5 sm:pt-4">
          <h2 className="panel-label">{label}</h2>
          {action}
        </header>
      ) : null}
      <div className={cn("flex-1 px-4 pb-4 sm:px-5 sm:pb-5", !label && "pt-4 sm:pt-5", contentClassName)}>
        {children}
      </div>
    </motion.section>
  );

  // The entrance and the scroll-away live on separate elements. Sharing one
  // would put two writers on the same transform, and the panel would fight
  // itself for a frame every time the page moved.
  if (!scatter) return body;

  return (
    <motion.div
      style={{ ...scatter, transformStyle: "preserve-3d" }}
      className={cn("will-change-transform", className)}
    >
      {body}
    </motion.div>
  );
}

/** The small "open it" affordance in a panel header. */
export function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-[0.6875rem] tracking-[0.02em] text-soft",
        "opacity-0 transition-[opacity,color] duration-200 group-hover/panel:opacity-100",
        "hover:text-[var(--accent)] focus-visible:opacity-100 focus-visible:outline-none",
        "active:text-[var(--accent)]",
      )}
    >
      {children}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3">
        <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
