"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Panel, PanelLink } from "@/components/panel";
import { StageExit, type Exit } from "@/components/stage-exit";
import { MinecraftAvatar } from "@/components/cards/minecraft-avatar";
import { RobloxAvatar } from "@/components/cards/roblox-avatar";
import { MinecraftIcon, RobloxIcon, SteamIcon } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import type { MinecraftAccount } from "@/app/api/minecraft/route";
import type { RobloxAccount } from "@/app/api/roblox/route";
import type { SteamAccount } from "@/app/api/steam/route";

/**
 * Where each card goes when this screen is dismissed.
 *
 * These drop and spin off the bottom. The bento tumbles through depth and the
 * introduction is swept sideways, so falling is the one direction left that
 * still reads as its own thing.
 */
const exits: Exit[] = [
  { x: -120, y: 420, r: -16, s: 0.9 },
  { x: 90, y: 470, r: 14, s: 0.88 },
  { x: -60, y: 520, r: -11, s: 0.86 },
];

function useAccount<T>(url: string): T | null {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    let live = true;
    fetch(url)
      .then((response) => (response.ok ? response.json() : null))
      .then((value) => live && setData(value))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [url]);

  return data;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[0.9375rem] leading-tight tabular-nums">{value}</span>
      <span className="text-[0.6875rem] tracking-[0.02em] text-soft">{label}</span>
    </div>
  );
}

// three.js is only worth downloading when Roblox has actually handed over a
// mesh, which needs an account session on the server.
const RobloxMesh = dynamic(
  () => import("@/components/cards/roblox-mesh").then((module) => module.RobloxMesh),
  { ssr: false },
);

function RobloxPanel() {
  const account = useAccount<RobloxAccount>("/api/roblox");
  const [meshFailed, setMeshFailed] = useState(false);
  const onFailed = useCallback(() => setMeshFailed(true), []);
  const mesh = meshFailed ? null : account?.mesh;

  return (
    <Panel
      solid
      label={
        <span className="inline-flex items-center gap-1.5">
          <RobloxIcon />
          Roblox
        </span>
      }
      action={
        <PanelLink href={`https://www.roblox.com/users/2662381053/profile`}>
          {account?.username ? `@${account.username}` : "Profile"}
        </PanelLink>
      }
      contentClassName="flex flex-col"
    >
      <div className="flex items-center gap-4">
        {mesh ? (
          <RobloxMesh
            obj={mesh.obj}
            texture={mesh.textures[0] ?? null}
            onFailed={onFailed}
            className="h-40 w-28 shrink-0"
          />
        ) : account?.image ? (
          <RobloxAvatar image={account.image} className="h-40 w-28 shrink-0" />
        ) : (
          <Skeleton className="h-40 w-28 shrink-0 rounded-[10px]" />
        )}
        <div className="min-w-0 flex-1 space-y-1">
          {account ? (
            <>
              <p className="accent-serif truncate text-[0.9375rem] leading-tight">
                {account.displayName ?? account.username ?? "Roblox"}
              </p>
              <p className="truncate text-[0.75rem] text-soft">@{account.username}</p>
              <p className="pt-1 text-[0.6875rem] text-soft">Drag to turn</p>
            </>
          ) : (
            <>
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}

function MinecraftPanel() {
  const account = useAccount<MinecraftAccount>("/api/minecraft");

  return (
    <Panel
      solid
      label={
        <span className="inline-flex items-center gap-1.5">
          <MinecraftIcon />
          Minecraft
        </span>
      }
      action={
        <PanelLink href="https://namemc.com/profile/ensomg">
          {account?.username ? `@${account.username}` : "Profile"}
        </PanelLink>
      }
      contentClassName="flex flex-col"
    >
      <div className="flex items-center gap-4">
        {account?.skin ? (
          <MinecraftAvatar
            skin={account.skin}
            model={account.model}
            className="h-40 w-24 shrink-0"
          />
        ) : (
          <Skeleton className="h-40 w-24 shrink-0 rounded-[10px]" />
        )}
        <div className="min-w-0 flex-1 space-y-1">
          {account ? (
            <>
              <p className="accent-serif truncate text-[0.9375rem] leading-tight">
                {account.username}
              </p>
              <p className="text-[0.75rem] text-soft">
                {account.model === "slim" ? "Slim model" : "Classic model"}
              </p>
              <p className="pt-1 text-[0.6875rem] text-soft">Drag to turn</p>
            </>
          ) : (
            <>
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-16" />
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}

function SteamPanel() {
  const account = useAccount<SteamAccount>("/api/steam");

  return (
    <Panel
      solid
      label={
        <span className="inline-flex items-center gap-1.5">
          <SteamIcon />
          Steam
        </span>
      }
      action={
        <PanelLink href={account?.profile ?? "https://steamcommunity.com/id/ensomg"}>
          @{account?.vanity ?? "ensomg"}
        </PanelLink>
      }
    >
      {!account ? (
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      ) : (
        <div className="space-y-3.5">
          <div className="flex gap-6">
            {/* Only shown when it was actually read — a total that contradicts
                the list underneath it is worse than no total. */}
            {account.totalHours !== null ? (
              <Stat value={`${account.totalHours}h`} label="on record" />
            ) : null}
            <Stat value={String(account.gameCount ?? 0)} label="games owned" />
          </div>

          <ul className="space-y-1.5">
            {account.top.map((game) => (
              <li key={game.appid} className="flex items-center gap-2.5">
                {game.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={game.icon}
                    alt=""
                    aria-hidden
                    className="size-5 shrink-0 rounded-[4px]"
                  />
                ) : (
                  <span className="size-5 shrink-0 rounded-[4px] bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)]" />
                )}
                <span className="min-w-0 flex-1 truncate text-[0.8125rem]">{game.name}</span>
                <span className="shrink-0 font-mono text-[0.6875rem] text-soft tabular-nums">
                  {game.hours}h
                </span>
              </li>
            ))}
          </ul>

          {account.source === "recorded" ? (
            <p className="text-[0.6875rem] tracking-[0.01em] text-soft">
              Snapshot — live figures need <span className="font-mono">STEAM_API_KEY</span>.
            </p>
          ) : null}
        </div>
      )}
    </Panel>
  );
}

export function AccountsSection() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Leaves with the cards below it, the same way. */}
      <StageExit exit={{ x: 0, y: 360, r: 3, s: 0.9 }} index={0}>
        <header className="mb-5 flex items-baseline justify-between gap-4 border-b border-[var(--surface-edge)] pb-4">
          <h2 className="text-[1.5rem] leading-[1.05] tracking-[-0.03em] sm:text-[2rem]">
            My accounts
          </h2>
          <span className="font-mono text-[0.75rem] tracking-[0.12em] text-[var(--accent)] tabular-nums">
            03
          </span>
        </header>
      </StageExit>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-6 md:gap-4">
        <StageExit exit={exits[0]} index={1} className="md:col-span-2">
          <RobloxPanel />
        </StageExit>
        <StageExit exit={exits[1]} index={2} className="md:col-span-2">
          <MinecraftPanel />
        </StageExit>
        <StageExit exit={exits[2]} index={3} className="md:col-span-2">
          <SteamPanel />
        </StageExit>
      </div>
    </div>
  );
}
