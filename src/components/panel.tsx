"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useTransform } from "motion/react";
import { useSmoothViewportProgress } from "@/lib/use-scroll-progress";
import { crossFade } from "@/lib/spring";
import { cn } from "@/lib/utils";

/** A panel is clear of the screen by the time three quarters of it has gone. */
const SCATTER_END = 0.75;

export type Drift = { x: number; y: number; r: number };

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
  const progress = useSmoothViewportProgress();

  const range = [0, SCATTER_END];
  const x = useTransform(progress, range, [0, drift?.x ?? 0], { clamp: true });
  const y = useTransform(progress, range, [0, drift?.y ?? 0], { clamp: true });
  const rotate = useTransform(progress, range, [0, drift?.r ?? 0], { clamp: true });
  const scale = useTransform(progress, range, [1, 0.86], { clamp: true });
  const opacity = useTransform(progress, [0.05, SCATTER_END * 0.85], [1, 0], { clamp: true });
  const scatter = drift && !reduceMotion ? { x, y, rotate, scale, opacity } : undefined;

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
    <motion.div style={scatter} className={cn("will-change-transform", className)}>
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
