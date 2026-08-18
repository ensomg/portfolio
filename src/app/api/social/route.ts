import { NextResponse } from "next/server";

export const revalidate = 300;

const USER_AGENT = "ensomg.sh personal site";

type GithubStats = {
  platform: "github";
  handle: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  recentCommits: number;
};

type XStats = {
  platform: "x";
  handle: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  posts: number;
  followers: number;
  following: number;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": USER_AGENT },
    next: { revalidate },
  });
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  return response.json() as Promise<T>;
}

async function getGithub(handle: string): Promise<GithubStats> {
  const profile = await fetchJson<{
    login: string;
    name: string | null;
    bio: string | null;
    avatar_url: string;
    public_repos: number;
    followers: number;
    following: number;
  }>(`https://api.github.com/users/${handle}`);

  // Commit counts are a nicety — a rate-limited events call should not take the
  // whole card down with it.
  let recentCommits = 0;
  try {
    const events = await fetchJson<
      { type: string; payload?: { commits?: unknown[] } }[]
    >(`https://api.github.com/users/${handle}/events/public?per_page=100`);
    recentCommits = events.reduce(
      (total, event) =>
        event.type === "PushEvent" ? total + (event.payload?.commits?.length ?? 0) : total,
      0,
    );
  } catch {
    recentCommits = 0;
  }

  return {
    platform: "github",
    handle,
    name: profile.name || profile.login,
    avatar: profile.avatar_url ?? null,
    bio: profile.bio ?? null,
    publicRepos: profile.public_repos ?? 0,
    followers: profile.followers ?? 0,
    following: profile.following ?? 0,
    recentCommits,
  };
}

async function getX(handle: string): Promise<XStats> {
  const profile = await fetchJson<{
    name?: string;
    description?: string;
    profile_image_url?: string;
    tweet_count?: number;
    followers_count?: number;
    following_count?: number;
  }>(`https://api.vxtwitter.com/${handle}`);

  return {
    platform: "x",
    handle,
    name: profile.name || handle,
    avatar: profile.profile_image_url ?? null,
    bio: profile.description ?? null,
    posts: profile.tweet_count ?? 0,
    followers: profile.followers_count ?? 0,
    following: profile.following_count ?? 0,
  };
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const platform = params.get("platform");
  const handle = params.get("handle")?.trim();

  if (!platform || !handle) {
    return NextResponse.json({ error: 'Missing "platform" or "handle".' }, { status: 400 });
  }

  try {
    if (platform === "github") return NextResponse.json(await getGithub(handle));
    if (platform === "x") return NextResponse.json(await getX(handle));
    return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch social stats." },
      { status: 502 },
    );
  }
}
