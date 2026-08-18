"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion, useReducedMotion, useTransform } from "motion/react";
import { useSmoothViewportProgress } from "@/lib/use-scroll-progress";
import { getTheme } from "@/lib/themes";

const SHARED_VIDEO = "/bg.mp4";

/**
 * One clip. It reports upward when it cannot play so the theme can fall back
 * instead of leaving a black rectangle where the background should be.
 */
function Clip({ src, onFail }: { src: string; onFail: (src: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Autoplay can be refused after mount, and browsers pause background video
    // when the tab is hidden without ever resuming it. Ask again whenever it
    // stops, and only treat the clip as the background while it is running.
    const start = () => {
      video.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") start();
    };

    start();
    video.addEventListener("pause", start);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      video.removeEventListener("pause", start);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [src]);

  return (
    <motion.video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      onError={() => onFail(src)}
      initial={{ opacity: 0 }}
      animate={{ opacity: playing ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      // The slight scale hides the soft edges the blur would otherwise pull in
      // from outside the frame.
      className="absolute inset-0 size-full scale-105 object-cover opacity-60 blur-[5px]"
    />
  );
}

/**
 * Full-bleed footage that gives way to black.
 *
 * The first screen is the theme's clip, softly blurred, with the panels
 * floating on it. Scrolling takes the light out of the room: the footage dims
 * to nothing and the page settles onto flat black, so the sections below are
 * read on a plain ground rather than competing with moving video.
 *
 * Each theme names its own clip under `public/`. A missing file falls back to
 * the shared one, and a missing shared one leaves the gradient field — the
 * page never depends on a video arriving.
 */
export function Background() {
  const { theme } = useTheme();
  const reduceMotion = useReducedMotion();
  // A clip is only given up on after it has failed twice. A single error can
  // come from a request cancelled mid-switch, and blacklisting a good file for
  // the rest of the session because of one of those is worse than retrying.
  const [failures, setFailures] = useState<Record<string, number>>({});
  const dead = (file: string) => (failures[file] ?? 0) >= 2;

  const wanted = getTheme(theme).video;
  const src = dead(wanted) ? SHARED_VIDEO : wanted;
  const showClip = !reduceMotion && !dead(SHARED_VIDEO);

  const progress = useSmoothViewportProgress();
  // The footage is spent by the time the first screen has been scrolled away,
  // and the black is fully down as the second screen arrives.
  const lit = useTransform(progress, [0, 0.8], [1, 0], { clamp: true });
  const dark = useTransform(progress, [0, 0.95], [0, 1], { clamp: true });

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <motion.div className="absolute inset-0" style={{ opacity: lit }}>
        {/* Stand-in field: three very slow, very large pools of light, well
            under the threshold where per-frame movement becomes visible. */}
        <span className="field field-a" />
        <span className="field field-b" />
        <span className="field field-c" />

        <AnimatePresence>
          {showClip ? (
            <Clip
              key={src}
              src={src}
              onFail={(bad) =>
                setFailures((current) => ({ ...current, [bad]: (current[bad] ?? 0) + 1 }))
              }
            />
          ) : null}
        </AnimatePresence>

        {/* Keeps panel text legible over whatever is playing. */}
        <div className="absolute inset-0 bg-[var(--veil)]" />
      </motion.div>

      {/* The black the page comes to rest on. */}
      <motion.div className="absolute inset-0 bg-[var(--ground)]" style={{ opacity: dark }} />
    </div>
  );
}
