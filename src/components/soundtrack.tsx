"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { getTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";

const VOLUME = 0.15;
const FADE_MS = 500;
const STORAGE_KEY = "soundtrack-muted";

/**
 * Each theme's track, started by the visitor's first click.
 *
 * Browsers refuse audio until a real gesture, so nothing can play on load —
 * the first pointer down anywhere on the page is what unlocks it. Switching
 * themes crossfades rather than cutting: an abrupt swap in the middle of a bar
 * is the kind of thing you notice and cannot unhear.
 *
 * Muting is remembered, and a muted visitor is never unmuted by a click.
 */
export function Soundtrack({ className }: { className?: string }) {
  const { theme } = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRef = useRef<number | undefined>(undefined);
  const [muted, setMuted] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [available, setAvailable] = useState(true);

  const track = getTheme(theme).track;

  const fadeTo = useCallback((target: number, done?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;

    window.clearInterval(fadeRef.current);
    const from = audio.volume;
    const started = performance.now();

    fadeRef.current = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - started) / FADE_MS);
      audio.volume = from + (target - from) * t;
      if (t === 1) {
        window.clearInterval(fadeRef.current);
        done?.();
      }
    }, 16);
  }, []);

  // The first gesture is the only moment audio can legally start, and it is
  // also the first moment the stored preference matters — reading it here
  // rather than on mount keeps it out of an effect that would only ever fight
  // the render that follows it.
  useEffect(() => {
    if (unlocked) return;

    const unlock = () => {
      setUnlocked(true);
      setMuted(window.localStorage.getItem(STORAGE_KEY) === "on");
    };
    // `click` is listened for alongside `pointerdown` because activation
    // through the keyboard or assistive tech never produces a pointer event.
    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("click", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });

    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, [unlocked]);

  // Play, swap and crossfade in one place so the three cannot disagree.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!track || muted || !unlocked) {
      fadeTo(0, () => audio.pause());
      return;
    }

    const swap = () => {
      const absolute = new URL(track, window.location.origin).href;
      if (audio.src !== absolute) {
        audio.src = track;
        audio.load();
      }
      audio.volume = 0;
      audio.play().then(
        () => {
          setAvailable(true);
          fadeTo(VOLUME);
        },
        () => setAvailable(false),
      );
    };

    // Same file across themes: keep it playing rather than restarting the
    // track every time the palette changes.
    const absolute = new URL(track, window.location.origin).href;
    if (!audio.paused && audio.src === absolute) {
      fadeTo(VOLUME);
      return;
    }

    if (audio.paused) swap();
    else fadeTo(0, swap);
  }, [track, muted, unlocked, fadeTo]);

  useEffect(() => () => window.clearInterval(fadeRef.current), []);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    // A click on the control is itself the gesture that unlocks playback.
    setUnlocked(true);
  };

  const silent = muted || !track || !available;

  return (
    <>
      <audio ref={audioRef} loop preload="none" onError={() => setAvailable(false)} />
      <button
        type="button"
        aria-pressed={!silent}
        title={track ? (muted ? "Play the soundtrack" : "Mute the soundtrack") : "This theme has no track"}
        disabled={!track}
        onClick={toggle}
        className={cn(className, "active:scale-95 disabled:cursor-default disabled:opacity-40")}
      >
        <span className="sr-only">Toggle the soundtrack</span>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[17px]"
        >
          <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
          {silent ? (
            <path d="m16 9 5 6M21 9l-5 6" />
          ) : (
            <>
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              <path d="M18.5 6a9 9 0 0 1 0 12" />
            </>
          )}
        </svg>
      </button>
    </>
  );
}
