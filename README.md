# ensomg.sh

Personal site. A loader, a full-bleed background clip, and a bento of glass
panels over it, most of them showing live data.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **Tailwind CSS v4** + **shadcn/ui**
- **Motion** for spring-based, interruptible animation
- **next-themes** for system + manual dark/light

## Background video

`public/bg.mp4` plays full-bleed behind everything, softly blurred and held back
to 60% so the panels in front stay the thing you read. Swap the file to change
it; the blur and opacity live in `src/components/background.tsx`.

If that file is removed, or autoplay is refused, or the visitor asked for reduced
motion, the animated gradient field in `globals.css` stands in, so the page never
depends on the video arriving. Nothing else needs changing.

A good clip is dark, slow, loops cleanly, and is heavily compressed. Aim for a
few MB, `h.264`, no audio track.

## Live data

| Panel | Source |
| --- | --- |
| Now playing | [Lanyard](https://github.com/Phineas/lanyard) — Discord presence and Spotify, seeded over REST then kept on a WebSocket |
| Now playing (lyrics) | `/api/lyrics` proxies [lrclib.net](https://lrclib.net) and parses the LRC into timed lines |
| Discord | The same Lanyard socket — one connection for the whole page, shared through `LanyardProvider` |
| Place | CARTO basemap tiles composed in the browser; both themes are built once and swapped with opacity |
| GitHub / X | `/api/social` proxies the GitHub API and vxtwitter, cached for 5 minutes |
| Projects (`/projects`) | Server-rendered from `src/lib/repos.ts` — hand-picked entries if `site.projects` has any, otherwise recent public repos |

No API keys anywhere.

## Motion

Anything the user can touch moves on a spring, never a fixed-duration CSS
transition, so motion can be interrupted and redirected mid-flight. Defaults
live in `src/lib/spring.ts`: critically damped (`bounce: 0`) for everything that
did not begin with a gesture. The Spotify progress bar is driven straight off
the clock with `requestAnimationFrame`, and the panel sheen tracks the pointer
1:1 by writing CSS custom properties; neither costs a React render.

`prefers-reduced-motion`, `prefers-reduced-transparency`, and `prefers-contrast`
each change what the page does: motion becomes a short cross-fade, the video
never starts, glass turns opaque, borders become defined.

## Editing content

Everything the page says lives in `src/lib/site.ts`: name, intro, links,
coordinates, and the Discord ID.

The Projects screen (`/projects`) falls back to your recent GitHub repos. Fill
in `site.projects` and it uses those instead; no other change needed. It is
capped at six entries so the screen never scrolls.

## Develop

```bash
npm install
npm run dev
```

```bash
npm run build
```
