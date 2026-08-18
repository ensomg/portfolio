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
  connected: boolean;
  /**
   * `live` came from Steam just now. `recorded` is the snapshot below, used
   * when no STEAM_API_KEY is set or Steam will not answer — playtime is only
   * readable through the Web API, and the profile has to be public. The card
   * says which one it is rather than passing a snapshot off as live.
   */
  source: "live" | "recorded";
  steamId: string | null;
  totalHours: number | null;
  gameCount: number | null;
  top: SteamGame[];
};

/**
 * Read off the profile by hand. Kept deliberately small: only figures that were
 * actually on the page, so the card is never showing a number nobody checked.
 */
const recorded: SteamAccount = {
  vanity: VANITY,
  profile: `https://steamcommunity.com/id/${VANITY}`,
  connected: true,
  source: "recorded",
  steamId: null,
  totalHours: null,
  gameCount: 200,
  top: [
    { appid: 227300, name: "Euro Truck Simulator 2", hours: 2880.4, icon: null },
    { appid: 1293830, name: "Forza Horizon 4", hours: 2382, icon: null },
    { appid: 394690, name: "Tower Unite", hours: 2371.3, icon: null },
    { appid: 1551360, name: "Forza Horizon 5", hours: 2240.5, icon: null },
  ],
};

type OwnedGame = {
  appid: number;
  name?: string;
  playtime_forever?: number;
  img_icon_url?: string;
};

export async function GET() {
  const key = process.env.STEAM_API_KEY;
  if (!key) return NextResponse.json(recorded);

  try {
    const resolved = await fetch(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${key}&vanityurl=${VANITY}`,
      { next: { revalidate } },
    );
    if (!resolved.ok) return NextResponse.json(recorded);

    const { response } = (await resolved.json()) as {
      response?: { success?: number; steamid?: string };
    };
    const steamId = response?.success === 1 ? response.steamid : undefined;
    if (!steamId) return NextResponse.json(recorded);

    const owned = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${key}` +
        `&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`,
      { next: { revalidate } },
    );
    if (!owned.ok) return NextResponse.json({ ...recorded, steamId });

    const payload = (await owned.json()) as {
      response?: { game_count?: number; games?: OwnedGame[] };
    };
    const games = payload.response?.games ?? [];
    // An empty library means the profile is private, not that he owns nothing.
    if (games.length === 0) return NextResponse.json({ ...recorded, steamId });

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
      source: "live",
      steamId,
      totalHours: Math.round(minutes / 60),
      gameCount: payload.response?.game_count ?? games.length,
      top,
    } satisfies SteamAccount);
  } catch {
    return NextResponse.json(recorded);
  }
}
