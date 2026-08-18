"use client";

import Image from "next/image";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const TILE = 256;
/** The tile plane is wider than any column it sits in, so it always fills. */
const PLANE_W = 704;
const PLANE_H = 200;

function lonToX(lon: number, zoom: number) {
  return ((lon + 180) / 360) * TILE * 2 ** zoom;
}

function latToY(lat: number, zoom: number) {
  const rad = (lat * Math.PI) / 180;
  return (
    (0.5 - Math.log((1 + Math.sin(rad)) / (1 - Math.sin(rad))) / (4 * Math.PI)) * TILE * 2 ** zoom
  );
}

/**
 * The tiles covering a PLANE_W×PLANE_H window centred on the coordinate, with
 * their offsets inside it. Composing tiles in the browser keeps the page static
 * — no image pipeline and no server-side rasteriser to keep alive.
 */
function tileGrid(lat: number, lon: number, zoom: number) {
  const left = lonToX(lon, zoom) - PLANE_W / 2;
  const top = latToY(lat, zoom) - PLANE_H / 2;
  const max = 2 ** zoom;

  const tiles: { x: number; y: number; offsetX: number; offsetY: number }[] = [];
  for (let y = Math.floor(top / TILE); y <= Math.floor((top + PLANE_H - 1) / TILE); y += 1) {
    if (y < 0 || y >= max) continue;
    for (let x = Math.floor(left / TILE); x <= Math.floor((left + PLANE_W - 1) / TILE); x += 1) {
      tiles.push({
        x: ((x % max) + max) % max,
        y,
        offsetX: x * TILE - left,
        offsetY: y * TILE - top,
      });
    }
  }
  return tiles;
}

function TileLayer({ style, className }: { style: string; className?: string }) {
  const tiles = tileGrid(site.map.lat, site.map.lon, site.map.zoom);

  return (
    <div
      className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", className)}
      style={{ width: PLANE_W, height: PLANE_H }}
    >
      {tiles.map((tile) => (
        // eslint-disable-next-line @next/next/no-img-element -- absolute tile grid, not a content image
        <img
          key={`${style}-${tile.x}-${tile.y}`}
          src={`https://a.basemaps.cartocdn.com/${style}/${site.map.zoom}/${tile.x}/${tile.y}@2x.png`}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute max-w-none"
          style={{ left: tile.offsetX, top: tile.offsetY, width: TILE, height: TILE }}
        />
      ))}
    </div>
  );
}

export const mapHref = `https://www.openstreetmap.org/?mlat=${site.map.lat}&mlon=${site.map.lon}#map=${site.map.zoom}/${site.map.lat}/${site.map.lon}`;

export function MapCard() {
  return (
    <a
      href={mapHref}
      target="_blank"
      rel="noreferrer"
      title={site.location}
      className="relative block h-full min-h-[172px] w-full overflow-hidden rounded-[calc(var(--radius)-0.4rem)] bg-[oklch(0.9_0.003_285)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 dark:bg-[oklch(0.2_0.005_285)]"
    >
      {/* Both themes are composed once and swapped with opacity, so switching
          the theme never reveals a half-loaded map. */}
      <TileLayer style="light_all" className="opacity-100 dark:opacity-0" />
      <TileLayer style="dark_all" className="opacity-0 dark:opacity-100" />

      {/* A slow, faint pulse marking the spot — large and well under the flash threshold. */}
      <span className="pointer-events-none absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 animate-[ping_2.6s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-[var(--accent)]/25 motion-reduce:animate-none" />
      <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Image
          src={site.photo}
          alt={site.photoAlt}
          width={30}
          height={30}
          className="size-[30px] rounded-full object-cover shadow-[0_2px_8px_oklch(0_0_0/25%)] ring-2 ring-white"
        />
      </span>

      {/* Scroll-edge style fade instead of a hard border where the label sits. */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 p-3 text-[0.75rem] leading-[1.45] tracking-[0.01em] text-white/90">
        {site.location}
      </span>
    </a>
  );
}
