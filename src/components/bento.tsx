"use client";

import Link from "next/link";
import { Panel, PanelLink, type Drift } from "@/components/panel";
import { MapCard, mapHref } from "@/components/cards/map-card";
import { SpotifyCard } from "@/components/cards/spotify-card";
import { SocialCard } from "@/components/cards/social-card";
import { DiscordCard, RichPresenceCard } from "@/components/cards/presence-card";
import { DiscordIcon, SpotifyIcon, techIcons } from "@/components/icons";
import { Wordmark } from "@/components/wordmark";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanyard } from "@/lib/use-lanyard";
import { site } from "@/lib/site";

function Interests() {
  return (
    <>
      {site.interests.map((interest, index) => {
        const Icon = techIcons[interest.label];
        return (
          <span key={interest.label}>
            {index > 0 ? (index === site.interests.length - 1 ? ", and " : ", ") : ""}
            <a
              href={interest.href}
              target="_blank"
              rel="noreferrer"
              className="quiet-link inline-flex items-baseline gap-1"
            >
              {Icon ? <Icon /> : null}
              <span>{interest.label}</span>
            </a>
          </span>
        );
      })}
    </>
  );
}

/**
 * Where each panel goes when the first screen is scrolled away. The values
 * follow the grid: things on the left carry left, the bottom row drops, and
 * everything picks up a little rotation so the screen comes apart instead of
 * sliding off in formation.
 */
const drifts: Record<string, Drift> = {
  hero: { x: -260, y: -140, r: -5 },
  place: { x: 280, y: -170, r: 6 },
  now: { x: -300, y: 40, r: -4 },
  discord: { x: 300, y: 30, r: 4 },
  github: { x: -230, y: 190, r: -6 },
  x: { x: 20, y: 260, r: 2 },
  projects: { x: 250, y: 200, r: 6 },
};

function NowPanel({ index }: { index: number }) {
  const { presence, ready } = useLanyard();
  const spotify = presence?.listening_to_spotify ? presence.spotify : null;
  const activity = presence?.activities?.find((entry) => entry.type === 0) ?? null;

  return (
    <Panel
      index={index}
      label={spotify ? "Now playing" : "Now"}
      action={spotify ? <PanelLink href={site.lanyard.spotifyHref}>Spotify</PanelLink> : null}
      drift={drifts.now}
      className="md:col-span-3"
    >
      {!ready ? (
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 shrink-0 rounded-[10px]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ) : spotify ? (
        <SpotifyCard spotify={spotify} />
      ) : activity ? (
        <RichPresenceCard activity={activity} />
      ) : (
        <div className="flex h-full items-center gap-2 text-soft">
          <SpotifyIcon />
          <span className="text-[0.875rem]">Not listening to anything right now.</span>
        </div>
      )}
    </Panel>
  );
}

function DiscordPanel({ index }: { index: number }) {
  const { presence, ready } = useLanyard();

  return (
    <Panel
      index={index}
      label="Discord"
      action={<PanelLink href={site.discord.href}>Profile</PanelLink>}
      drift={drifts.discord}
      className="md:col-span-3"
    >
      {!ready ? (
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ) : presence ? (
        <DiscordCard presence={presence} />
      ) : (
        <p className="flex items-center gap-2 text-soft">
          <DiscordIcon />
          <span className="text-[0.875rem]">@ensomg</span>
        </p>
      )}
    </Panel>
  );
}

export function Bento() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-6 md:gap-4">
      <Panel
        index={0}
        drift={drifts.hero}
        className="md:col-span-4"
        contentClassName="flex flex-col justify-center"
      >
        <h1 className="w-fit">
          <Wordmark className="h-9 sm:h-12" />
        </h1>

        <p className="mt-3 max-w-[32rem] text-[0.9375rem] leading-[1.65] text-soft sm:text-[1rem]">
          I work on{" "}
          <a
            href={site.work.href}
            target="_blank"
            rel="noreferrer"
            className="quiet-link text-foreground"
          >
            {site.work.label}
          </a>
          . I am interested in <Interests />. It is nice to meet you.
        </p>
      </Panel>

      <Panel
        index={1}
        label="Place"
        action={<PanelLink href={mapHref}>Map</PanelLink>}
        drift={drifts.place}
        className="md:col-span-2"
        contentClassName="flex"
      >
        <MapCard />
      </Panel>

      <NowPanel index={2} />
      <DiscordPanel index={3} />

      <Panel
        index={4}
        label="GitHub"
        action={<PanelLink href={site.github.href}>@{site.github.handle}</PanelLink>}
        drift={drifts.github}
        className="md:col-span-2"
      >
        <SocialCard platform="github" handle={site.github.handle} href={site.github.href} />
      </Panel>

      <Panel
        index={5}
        label="X"
        action={<PanelLink href={site.x.href}>@{site.x.handle}</PanelLink>}
        drift={drifts.x}
        className="md:col-span-2"
      >
        <SocialCard platform="x" handle={site.x.handle} href={site.x.href} />
      </Panel>

      <Panel
        index={6}
        label="Projects"
        drift={drifts.projects}
        className="md:col-span-2"
        contentClassName="flex items-center"
      >
        {/* The whole panel is the target — a small link inside a large card is a
            worse tap target than the card itself. */}
        <Link href="/projects" className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 focus-visible:ring-inset rounded-[var(--radius)]">
          <span className="sr-only">See projects</span>
        </Link>
        <span className="flex w-full items-center justify-between gap-3">
          <span className="text-[0.9375rem]">Things I&apos;m building</span>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="size-4 shrink-0 text-soft transition-transform duration-300 group-hover/panel:translate-x-0.5"
          >
            <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Panel>

    </div>
  );
}
