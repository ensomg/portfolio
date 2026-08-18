"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useStageLayer } from "@/components/stage";
import { StageExit, type Exit } from "@/components/stage-exit";
import { site } from "@/lib/site";

/**
 * Where each card goes when this screen is dismissed.
 *
 * Up and away. The bento tumbles through depth, the introduction is swept
 * sideways and the accounts drop off the bottom, so rising is the last
 * direction left that still reads as its own exit.
 */
const exits: Exit[] = [
  { x: -70, y: -430, r: -9, s: 0.86 },
  { x: 60, y: -480, r: 8, s: 0.84 },
  { x: -40, y: -520, r: -12, s: 0.82 },
  { x: 90, y: -560, r: 11, s: 0.8 },
];

function Card({
  contribution,
  index,
}: {
  contribution: { name: string; href: string; role?: string; description?: string };
  index: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduceMotion = useReducedMotion();
  const layer = useStageLayer();

  // Pinned on a stage, so the cards ride the screen's own arrival rather than
  // `whileInView`, which would have fired before the screen was ever shown.
  const idle = useMotionValue(0);
  const start = Math.min(0.5, index * 0.07);
  const t = useTransform(layer?.enter ?? idle, [start, start + 0.5], [0, 1], { clamp: true });
  const x = useTransform(t, [0, 1], [index % 2 === 0 ? -40 : 40, 0]);

  const trackPointer = (event: React.PointerEvent<HTMLAnchorElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    node.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <motion.div className="h-full" style={reduceMotion ? { opacity: t } : { opacity: t, x }}>
      <a
        ref={ref}
        href={contribution.href}
        target="_blank"
        rel="noreferrer"
        onPointerMove={trackPointer}
        className="panel-sheen group/card relative flex h-full flex-col gap-2 overflow-hidden rounded-[calc(var(--radius)-0.25rem)] border border-[var(--surface-edge)] bg-[var(--surface)] p-4 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 active:translate-y-0"
      >
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-[1rem] leading-tight tracking-[-0.015em] break-all">
            {contribution.name}
          </span>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="size-3 shrink-0 text-soft transition-colors duration-300 group-hover/card:text-[var(--accent)]"
          >
            <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        {contribution.role ? (
          <span className="font-mono text-[0.625rem] tracking-[0.14em] text-[var(--accent)] uppercase">
            {contribution.role}
          </span>
        ) : null}

        {contribution.description ? (
          <span className="text-[0.8125rem] leading-[1.5] text-soft">
            {contribution.description}
          </span>
        ) : null}
      </a>
    </motion.div>
  );
}

export function ContributionsSection() {
  const { contributions } = site;

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* The heading leaves with its cards. Left out of the exit it stayed
          behind while everything under it rose away. */}
      <StageExit exit={{ x: 0, y: -380, r: -3, s: 0.9 }} index={0}>
        <header className="mb-5 flex items-baseline justify-between gap-4 border-b border-[var(--surface-edge)] pb-4">
          <h2 className="text-[1.5rem] leading-[1.05] tracking-[-0.03em] sm:text-[2rem]">
            Sites I contributed to
          </h2>
          <span className="font-mono text-[0.75rem] tracking-[0.12em] text-[var(--accent)] tabular-nums">
            {String(contributions.length).padStart(2, "0")}
          </span>
        </header>
      </StageExit>

      {contributions.length === 0 ? (
        <p className="text-[0.875rem] leading-[1.6] text-soft">Nothing listed here yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
          {contributions.map((contribution, index) => (
            <li key={contribution.href} className="h-full">
              <StageExit exit={exits[index % exits.length]} index={index + 1} className="h-full">
                <Card contribution={contribution} index={index} />
              </StageExit>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
