"use client";

import { motion, useReducedMotion } from "motion/react";
import { crossFade, springMove } from "@/lib/spring";
import { GitHubIcon } from "@/components/icons";
import { ThemePicker } from "@/components/theme-picker";
import { Soundtrack } from "@/components/soundtrack";
import { site } from "@/lib/site";

const control =
  "flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground " +
  "transition-colors duration-200 hover:text-foreground focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50";

/**
 * Floating chrome, not a fixed strip: content scrolls underneath the glass.
 */
export function FloatingChrome() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-end p-4 sm:p-5">
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(6px)" }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={reduceMotion ? crossFade : { ...springMove, delay: 0.5 }}
        className="material pointer-events-auto flex items-center gap-0.5 rounded-full p-1"
      >
        <a
          href={site.github.href}
          target="_blank"
          rel="noreferrer"
          title="GitHub profile"
          className={control}
        >
          <span className="sr-only">GitHub profile</span>
          <GitHubIcon className="size-[17px]" />
        </a>

        <Soundtrack className={control} />
        <ThemePicker triggerClassName={control} />
      </motion.div>
    </div>
  );
}
