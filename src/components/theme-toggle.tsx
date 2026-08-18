"use client";

import { useTheme } from "next-themes";
import { motion, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { crossFade, springMove } from "@/lib/spring";
import { GitHubIcon } from "@/components/icons";
import { site } from "@/lib/site";

const chrome =
  "flex size-9 items-center justify-center rounded-full text-muted-foreground " +
  "transition-colors duration-200 hover:text-foreground focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-[var(--accent-link)]/50";

/**
 * Floating chrome, not a fixed strip: content scrolls underneath the glass.
 */
export function FloatingChrome() {
  const { resolvedTheme, setTheme } = useTheme();
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
          className={chrome}
        >
          <span className="sr-only">GitHub profile</span>
          <GitHubIcon className="size-[17px]" />
        </a>

        <button
          type="button"
          title="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className={`${chrome} active:scale-95`}
        >
          <span className="sr-only">Toggle theme</span>
          {/* Which icon shows is a styling question, so CSS answers it. Nothing
              here depends on client-only state, so the first paint is correct. */}
          <Sun className="size-[17px] dark:hidden" strokeWidth={1.6} />
          <Moon className="hidden size-[17px] dark:block" strokeWidth={1.6} />
        </button>
      </motion.div>
    </div>
  );
}
