import { NextResponse } from "next/server";

export const revalidate = 86400;

export type LyricLine = { time: number; text: string };

/** "feat."/"&"/"," collaborations confuse the search; match on the lead artist. */
function primaryArtist(artist: string): string {
  return artist.split(/[,;&]| feat\.? | ft\.? | x /i)[0]?.trim() || artist;
}

/** Strip the parenthetical noise Spotify appends to titles. */
function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/\((?:feat|ft|with)[^)]*\)/gi, "")
    .replace(/-\s*(remaster(ed)?|radio edit|single version)[^-]*$/i, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function parseSynced(lrc: string | null | undefined): LyricLine[] {
  if (!lrc) return [];

  const lines: LyricLine[] = [];
  for (const raw of lrc.split("\n")) {
    const stamps = [...raw.matchAll(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
    if (stamps.length === 0) continue;

    const text = raw.replace(/\[[^\]]*\]/g, "").trim();
    for (const stamp of stamps) {
      const minutes = Number(stamp[1]);
      const seconds = Number(stamp[2]);
      const fraction = stamp[3] ? Number(stamp[3].padEnd(3, "0")) / 1000 : 0;
      lines.push({ time: minutes * 60 + seconds + fraction, text });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

type LrclibResult = {
  trackName: string;
  artistName: string;
  duration: number;
  syncedLyrics: string | null;
};

function pickBest(results: LrclibResult[], track: string, durationSec?: number) {
  const synced = results.filter((result) => result.syncedLyrics);
  if (synced.length === 0) return null;

  const wanted = normalizeTitle(track);
  return (
    synced
      .map((result) => {
        let score = 0;
        if (normalizeTitle(result.trackName) === wanted) score += 100;
        if (durationSec && Number.isFinite(result.duration)) {
          score += Math.max(0, 40 - Math.abs(result.duration - durationSec) * 4);
        }
        return { result, score };
      })
      .sort((a, b) => b.score - a.score)[0]?.result ?? null
  );
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const track = params.get("track")?.trim();
  const artist = params.get("artist")?.trim();
  const duration = Number(params.get("duration"));

  if (!track || !artist) {
    return NextResponse.json({ lines: [] satisfies LyricLine[] });
  }

  try {
    const search = new URLSearchParams({
      track_name: track,
      artist_name: primaryArtist(artist),
    });
    const response = await fetch(`https://lrclib.net/api/search?${search}`, {
      headers: { "User-Agent": "ensomg.sh personal site" },
      next: { revalidate },
    });

    if (!response.ok) return NextResponse.json({ lines: [] });

    const results = (await response.json()) as LrclibResult[];
    const best = pickBest(
      Array.isArray(results) ? results : [],
      track,
      Number.isFinite(duration) ? duration : undefined,
    );

    return NextResponse.json({ lines: parseSynced(best?.syncedLyrics) });
  } catch {
    return NextResponse.json({ lines: [] });
  }
}
