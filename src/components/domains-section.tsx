"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useStageLayer } from "@/components/stage";
import { site } from "@/lib/site";

/** `luminalabs.com.tr` splits at the first dot, which is where the name ends. */
function splitDomain(domain: string) {
  const dot = domain.indexOf(".");
  return { name: domain.slice(0, dot), tld: domain.slice(dot) };
}

function Tile({ domain, index }: { domain: string; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduceMotion = useReducedMotion();
  const layer = useStageLayer();
  const { name, tld } = splitDomain(domain);

  // On a stage the tiles cannot use `whileInView`: the screen is pinned, so
  // every tile counts as in view from the first frame and they would all have
  // finished arriving before the screen is ever shown. They ride the screen's
  // own arrival instead, each one a beat behind the last.
  const idle = useMotionValue(0);
  const start = Math.min(0.55, index * 0.028);
  const t = useTransform(layer?.enter ?? idle, [start, start + 0.45], [0, 1], { clamp: true });
  const y = useTransform(t, [0, 1], [46, 0]);
  const scale = useTransform(t, [0, 1], [0.82, 1]);

  // Light catching the tile, tracked 1:1 with the pointer and written straight
  // to custom properties so following the cursor costs no React render.
  const trackPointer = (event: React.PointerEvent<HTMLAnchorElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    node.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  const arrival = layer
    ? { style: reduceMotion ? { opacity: t } : { opacity: t, y, scale } }
    : {
        initial: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 },
        whileInView: reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.6 },
        transition: { type: "spring" as const, bounce: 0, duration: 0.5, delay: index * 0.03 },
      };

  return (
    <motion.li {...arrival}>
      <a
        ref={ref}
        href={`https://${domain}`}
        target="_blank"
        rel="noreferrer"
        onPointerMove={trackPointer}
        className="panel-sheen group/tile relative flex h-full flex-col justify-between gap-5 overflow-hidden rounded-[calc(var(--radius)-0.25rem)] border border-[var(--surface-edge)] bg-[var(--surface)] p-3.5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 active:translate-y-0 sm:p-4"
      >
        <span className="font-mono text-[0.625rem] tracking-[0.14em] text-soft">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[0.9375rem] leading-tight tracking-[-0.01em] break-all">
          {name}
          <span className="text-soft transition-colors duration-300 group-hover/tile:text-[var(--accent)]">
            {tld}
          </span>
        </span>
      </a>
    </motion.li>
  );
}

export function DomainsSection() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-5 flex items-baseline justify-between gap-4 border-b border-[var(--surface-edge)] pb-4">
        <h2 className="text-[1.5rem] leading-[1.05] tracking-[-0.03em] sm:text-[2rem]">
          Websites I own
        </h2>
        <span className="font-mono text-[0.75rem] tracking-[0.12em] text-[var(--accent)] tabular-nums">
          {String(site.domains.length).padStart(2, "0")}
        </span>
      </header>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-4">
        {site.domains.map((domain, index) => (
          <Tile key={domain} domain={domain} index={index} />
        ))}
      </ul>
    </div>
  );
}
