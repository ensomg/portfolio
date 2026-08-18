import { NextResponse } from "next/server";

export const revalidate = 1800;

const VANITY = "ensomg";

export type SteamGame = {
  appid: number;
  name: string;
  /** Hours, one decimal. */
  hours: number;
  icon: string | null;
};

export type SteamAccount = {
  vanity: string;
  profile: string;
  /**
   * False when no STEAM_API_KEY is set, or when Steam will not answer for this
   * account. Playtime is only readable through the Web API — there is no
   * public endpoint for it — and the profile has to be public.
   */
  connected: boolean;
  steamId: string | null;
  totalHours: number | null;
  gameCount: number | null;
  top: SteamGame[];
};

const disconnected: SteamAccount = {
  vanity: VANITY,
  profile: `https://steamcommunity.com/id/${VANITY}`,
  connected: false,
  steamId: null,
  totalHours: null,
  gameCount: null,
  top: [],
};

type OwnedGame = {
  appid: number;
  name?: string;
  playtime_forever?: number;
  img_icon_url?: string;
};

export async function GET() {
  const key = process.env.STEAM_API_KEY;
  if (!key) return NextResponse.json(disconnected);

  try {
    const resolved = await fetch(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${key}&vanityurl=${VANITY}`,
      { next: { revalidate } },
    );
    if (!resolved.ok) return NextResponse.json(disconnected);

    const { response } = (await resolved.json()) as {
      response?: { success?: number; steamid?: string };
    };
    const steamId = response?.success === 1 ? response.steamid : undefined;
    if (!steamId) return NextResponse.json(disconnected);

    const owned = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${key}` +
        `&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`,
      { next: { revalidate } },
    );
    if (!owned.ok) return NextResponse.json({ ...disconnected, steamId });

    const payload = (await owned.json()) as {
      response?: { game_count?: number; games?: OwnedGame[] };
    };
    const games = payload.response?.games ?? [];

    const minutes = games.reduce((total, game) => total + (game.playtime_forever ?? 0), 0);
    const top = games
      .filter((game) => (game.playtime_forever ?? 0) > 0)
      .sort((a, b) => (b.playtime_forever ?? 0) - (a.playtime_forever ?? 0))
      .slice(0, 5)
      .map((game) => ({
        appid: game.appid,
        name: game.name ?? `App ${game.appid}`,
        hours: Math.round((game.playtime_forever ?? 0) / 6) / 10,
        icon: game.img_icon_url
          ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
          : null,
      }));

    return NextResponse.json({
      vanity: VANITY,
      profile: `https://steamcommunity.com/id/${VANITY}`,
      connected: true,
      steamId,
      totalHours: Math.round(minutes / 60),
      gameCount: payload.response?.game_count ?? games.length,
      top,
    } satisfies SteamAccount);
  } catch {
    return NextResponse.json(disconnected);
  }
}
