"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type Stats = {
  platform: "github" | "x";
  handle: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  publicRepos?: number;
  recentCommits?: number;
  posts?: number;
  followers: number;
  following: number;
};

const numberFormat = new Intl.NumberFormat("en-US");

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[0.9375rem] leading-tight tabular-nums">{numberFormat.format(value)}</p>
      <p className="text-[0.6875rem] tracking-[0.02em] text-soft">{label}</p>
    </div>
  );
}

export function SocialCard({
  platform,
  handle,
  href,
}: {
  platform: "github" | "x";
  handle: string;
  href: string;
}) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (stats || failed) return;
    const controller = new AbortController();

    fetch(`/api/social?platform=${platform}&handle=${handle}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("failed"))))
      .then((payload: Stats) => setStats(payload))
      .catch((error: Error) => {
        if (error.name !== "AbortError") setFailed(true);
      });

    return () => controller.abort();
  }, [stats, failed, platform, handle]);

  if (failed) {
    return (
      <p className="text-[0.8125rem] text-soft">
        Stats are unavailable right now —{" "}
        <a href={href} target="_blank" rel="noreferrer" className="quiet-link">
          open the profile
        </a>
        .
      </p>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 shrink-0 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {stats.avatar ? (
          <Image
            src={stats.avatar}
            alt=""
            aria-hidden
            width={44}
            height={44}
            unoptimized
            className="size-11 shrink-0 rounded-full object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="accent-serif truncate text-[0.9375rem] leading-tight">{stats.name}</p>
          {stats.bio ? (
            <p className="truncate text-[0.75rem] leading-[1.45] tracking-[0.01em] text-soft">
              {stats.bio}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {platform === "github" ? (
          <>
            <Stat label="repos" value={stats.publicRepos ?? 0} />
            <Stat label="followers" value={stats.followers} />
            <Stat label="recent commits" value={stats.recentCommits ?? 0} />
          </>
        ) : (
          <>
            <Stat label="posts" value={stats.posts ?? 0} />
            <Stat label="followers" value={stats.followers} />
            <Stat label="following" value={stats.following} />
          </>
        )}
      </div>

    </div>
  );
}
