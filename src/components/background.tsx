"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useTransform } from "motion/react";
import { useScrollProgress } from "@/lib/use-scroll-progress";

/**
 * Full-bleed footage that gives way to black.
 *
 * The first screen is the clip, softly blurred, with the panels floating on it.
 * Scrolling takes the light out of the room: the footage dims to nothing and
 * the page settles onto flat black, so the sections below are read on a plain
 * ground instead of competing with moving video.
 *
 * Drop a clip at `public/bg.mp4` and it plays here. If it is missing, fails to
 * decode, or the visitor asked for reduced motion, the gradient field stands in
 * and the same fade applies to it.
 */
export function Background() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playable, setPlayable] = useState(false);
  const reduceMotion = useReducedMotion();

  const progress = useScrollProgress();
  // Everything the clip contributes is gone by the time the second screen is
  // centred; the black is fully down shortly after.
  const lit = useTransform(progress, [0, 0.3], [1, 0], { clamp: true });
  const dark = useTransform(progress, [0, 0.35], [0, 1], { clamp: true });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;

    // Autoplay can be refused after the element is mounted, and browsers pause
    // background video when the tab is hidden without ever resuming it. Treat
    // the clip as the background only while it is genuinely running, and ask
    // again whenever it stops.
    const start = () => {
      video.play().then(
        () => setPlayable(true),
        () => setPlayable(false),
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
  }, [reduceMotion]);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <motion.div className="absolute inset-0" style={{ opacity: lit }}>
        {/* Stand-in field: three very slow, very large pools of light, well
            under the threshold where per-frame movement becomes visible. */}
        <span className="field field-a" />
        <span className="field field-b" />
        <span className="field field-c" />

        {!reduceMotion ? (
          // The reveal is kept on its own element: a CSS transition on the same
          // property the scroll drives would lag a second behind every wheel event.
          <div
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: playable ? 1 : 0 }}
          >
            <video
              ref={videoRef}
              src="/bg.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onError={() => setPlayable(false)}
              // The slight scale hides the soft edges the blur would otherwise
              // pull in from outside the frame.
              className="absolute inset-0 size-full scale-105 object-cover opacity-60 blur-[5px]"
            />
          </div>
        ) : null}

        {/* Keeps panel text legible over whatever is playing. */}
        <div className="absolute inset-0 bg-[var(--veil)]" />
      </motion.div>

      {/* The black the page comes to rest on. */}
      <motion.div className="absolute inset-0 bg-[var(--ground)]" style={{ opacity: dark }} />
    </div>
  );
}
