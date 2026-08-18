"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { LanyardSpotify } from "@/lib/lanyard";
import { formatDuration } from "@/lib/lanyard";
import { crossFade, springMove } from "@/lib/spring";
import { cn } from "@/lib/utils";

type LyricLine = { time: number; text: string };

const LINE_HEIGHT = 24;
const VISIBLE_LINES = 3;

/** Elapsed playback time, ticked on the display clock rather than a timer. */
function useElapsed(start: number, end: number) {
  const [elapsed, setElapsed] = useState(() => Math.max(0, Date.now() - start));

  useEffect(() => {
    let frame = 0;
    const duration = Math.max(1, end - start);

    const tick = () => {
      setElapsed(Math.min(duration, Math.max(0, Date.now() - start)));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, end]);

  return elapsed;
}

/**
 * Synced lyrics for the current track, or `null` while they are still being
 * looked up. Results are stamped with the track they belong to, so a stale
 * response for the previous song is simply not the current answer — no reset
 * pass through state is needed when the track changes.
 */
function useLyrics(spotify: LanyardSpotify): LyricLine[] | null {
  const [result, setResult] = useState<{ trackId: string; lines: LyricLine[] } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const trackId = spotify.track_id;
    const duration = Math.round((spotify.timestamps.end - spotify.timestamps.start) / 1000);
    const params = new URLSearchParams({
      track: spotify.song,
      artist: spotify.artist,
      duration: String(duration),
    });

    fetch(`/api/lyrics?${params}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : { lines: [] }))
      .then((payload: { lines: LyricLine[] }) => setResult({ trackId, lines: payload.lines ?? [] }))
      .catch(() => setResult({ trackId, lines: [] }));

    return () => controller.abort();
  }, [
    spotify.track_id,
    spotify.song,
    spotify.artist,
    spotify.timestamps.end,
    spotify.timestamps.start,
  ]);

  return result?.trackId === spotify.track_id ? result.lines : null;
}

/** Index of the last line whose timestamp has passed. */
function currentLine(lines: LyricLine[] | null, elapsedMs: number): number {
  if (!lines || lines.length === 0) return -1;
  const seconds = elapsedMs / 1000;
  let index = -1;
  for (const line of lines) {
    if (line.time > seconds) break;
    index += 1;
  }
  return index;
}

export function SpotifyCard({ spotify }: { spotify: LanyardSpotify }) {
  const reduceMotion = useReducedMotion();
  const elapsed = useElapsed(spotify.timestamps.start, spotify.timestamps.end);
  const lyrics = useLyrics(spotify);
  const duration = Math.max(1, spotify.timestamps.end - spotify.timestamps.start);
  const progress = Math.min(100, (elapsed / duration) * 100);

  const current = currentLine(lyrics, elapsed);
  const hasLyrics = Boolean(lyrics && lyrics.length > 0);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-3">
        <Image
          src={spotify.album_art_url}
          alt=""
          aria-hidden
          width={48}
          height={48}
          unoptimized
          className="size-12 shrink-0 rounded-[10px] object-cover shadow-[0_2px_10px_-4px_oklch(0_0_0/40%)]"
        />
        <div className="min-w-0 flex-1">
          <p className="accent-serif truncate text-[0.9375rem] leading-tight">{spotify.song}</p>
          <p className="truncate text-[0.75rem] leading-[1.4] tracking-[0.01em] text-soft">
            {spotify.artist}
          </p>
        </div>
      </div>

      <div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Track progress"
          className="h-[3px] overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--foreground)_14%,transparent)]"
        >
          {/* Driven straight off the clock — no transition to lag behind it. */}
          <div
            className="h-full rounded-full bg-[var(--accent)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[0.6875rem] tracking-[0.01em] tabular-nums text-soft">
          <span>{formatDuration(elapsed)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {hasLyrics ? (
        <div
          className="relative overflow-hidden border-t border-[var(--rule)] pt-3"
          style={{ height: LINE_HEIGHT * VISIBLE_LINES + 12 }}
          aria-label="Synced lyrics"
        >
          <motion.div
            animate={{ y: -Math.max(0, current) * LINE_HEIGHT }}
            transition={reduceMotion ? crossFade : springMove}
            style={{ willChange: "transform" }}
          >
            {(lyrics ?? []).map((line, index) => (
              <p
                key={`${line.time}-${index}`}
                className={cn(
                  "truncate font-serif text-[0.75rem] italic leading-6 transition-[opacity,color] duration-500",
                  index === current
                    ? "text-foreground opacity-100"
                    : "text-muted-foreground opacity-45",
                )}
                style={{ height: LINE_HEIGHT }}
              >
                {line.text || "♪"}
              </p>
            ))}
          </motion.div>
        </div>
      ) : lyrics === null ? (
        <p className="border-t border-[var(--rule)] pt-3 text-[0.6875rem] tracking-[0.01em] text-soft">
          Looking for lyrics…
        </p>
      ) : null}
    </div>
  );
}
