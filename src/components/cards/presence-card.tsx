"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { LanyardActivity, LanyardPresence } from "@/lib/lanyard";
import {
  activityImageUrl,
  avatarUrl,
  decorationUrl,
  displayName,
  formatElapsed,
  statusColor,
  statusLabel,
} from "@/lib/lanyard";

/** A Discord Rich Presence entry, laid out the way Discord itself does. */
export function RichPresenceCard({ activity }: { activity: LanyardActivity }) {
  const [now, setNow] = useState(() => Date.now());
  const large = activityImageUrl(activity.assets?.large_image, activity.application_id);
  const small = activityImageUrl(activity.assets?.small_image, activity.application_id);
  const start = activity.timestamps?.start;

  useEffect(() => {
    if (!start) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [start]);

  return (
    <div className="flex items-center gap-3">
      <div className="relative size-11 shrink-0">
        {large ? (
          <Image
            src={large}
            alt=""
            aria-hidden
            width={44}
            height={44}
            unoptimized
            className="size-11 rounded-[10px] object-cover"
          />
        ) : (
          <div className="size-11 rounded-[10px] bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)]" />
        )}
        {small ? (
          <Image
            src={small}
            alt=""
            aria-hidden
            width={18}
            height={18}
            unoptimized
            className="absolute -right-1 -bottom-1 size-[18px] rounded-full ring-2 ring-[var(--background)]"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="accent-serif truncate text-[0.9375rem] leading-tight">{activity.name}</p>
        {activity.details ? (
          <p className="truncate text-[0.75rem] leading-[1.45] tracking-[0.01em] text-soft">
            {activity.details}
          </p>
        ) : null}
        {activity.state ? (
          <p className="truncate text-[0.75rem] leading-[1.45] tracking-[0.01em] text-soft">
            {activity.state}
          </p>
        ) : null}
        {start ? (
          <p className="mt-0.5 text-[0.6875rem] tracking-[0.01em] tabular-nums text-soft">
            {formatElapsed(now - start)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** The Discord account itself: avatar, decoration, live status, devices. */
export function DiscordCard({ presence }: { presence: LanyardPresence }) {
  const user = presence.discord_user;
  const avatar = avatarUrl(user);
  const decoration = decorationUrl(user);
  const status = presence.discord_status;
  const devices = [
    presence.active_on_discord_desktop && "desktop",
    presence.active_on_discord_mobile && "mobile",
    presence.active_on_discord_web && "web",
  ].filter(Boolean) as string[];

  return (
    <div className="flex items-center gap-3">
      <div className="relative size-12 shrink-0">
        {avatar ? (
          <Image
            src={avatar}
            alt=""
            aria-hidden
            width={48}
            height={48}
            unoptimized
            className="size-12 rounded-full object-cover"
          />
        ) : (
          <div className="size-12 rounded-full bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)]" />
        )}
        {decoration ? (
          <Image
            src={decoration}
            alt=""
            aria-hidden
            width={64}
            height={64}
            unoptimized
            className="pointer-events-none absolute top-1/2 left-1/2 h-[132%] w-[132%] -translate-x-1/2 -translate-y-1/2 object-contain"
          />
        ) : null}
        <span
          title={statusLabel[status]}
          className="absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full ring-[3px] ring-[var(--background)]"
          style={{ backgroundColor: statusColor[status] }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="accent-serif truncate text-[0.9375rem] leading-tight">{displayName(user)}</p>
        <p className="truncate text-[0.75rem] leading-[1.45] tracking-[0.01em] text-soft">
          @{user.username}
        </p>
        <p className="text-[0.75rem] leading-[1.45] tracking-[0.01em] text-soft">
          {statusLabel[status]}
          {devices.length > 0 ? ` · ${devices.join(", ")}` : ""}
        </p>
      </div>
    </div>
  );
}
