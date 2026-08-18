"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { crossFade, springMove } from "@/lib/spring";
import { themes } from "@/lib/themes";
import { cn } from "@/lib/utils";

/**
 * The palette list. It opens from the button it belongs to rather than the
 * centre of the panel, so the relationship between the two is obvious, and it
 * leaves along the same path it arrived on.
 */
export function ThemePicker({ triggerClassName }: { triggerClassName?: string }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Theme"
        onClick={() => setOpen((value) => !value)}
        className={cn(triggerClassName, "active:scale-95")}
      >
        <span className="sr-only">Choose a theme</span>
        {/* The swatch is the current theme, painted from the live accent so it
            is right on the first frame without knowing which theme resolved. */}
        <span className="size-[15px] rounded-full bg-[var(--accent)] ring-1 ring-[var(--panel-edge)]" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            role="menu"
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96, filter: "blur(6px)" }
            }
            animate={
              reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
            }
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96, filter: "blur(6px)" }
            }
            transition={reduceMotion ? crossFade : springMove}
            className="material absolute right-0 bottom-[calc(100%+0.5rem)] w-40 origin-bottom-right rounded-[calc(var(--radius)-0.25rem)] p-1"
          >
            {themes.map((entry) => {
              const active = theme === entry.id;
              return (
                <li key={entry.id} role="none">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => {
                      setTheme(entry.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-[calc(var(--radius)-0.5rem)] px-2.5 py-1.5 text-left text-[0.8125rem]",
                      "transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50",
                      "active:bg-[color-mix(in_oklab,var(--foreground)_14%,transparent)]",
                      active ? "text-foreground" : "text-soft",
                    )}
                  >
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: entry.dot }}
                    />
                    <span className="flex-1">{entry.label}</span>
                    {active ? (
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="size-3 shrink-0"
                      >
                        <path d="m5 13 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
