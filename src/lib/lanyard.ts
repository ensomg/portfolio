export type LanyardAsset = {
  large_image?: string;
  large_text?: string;
  small_image?: string;
  small_text?: string;
};

export type LanyardActivity = {
  id: string;
  name: string;
  type: number;
  state?: string;
  details?: string;
  application_id?: string;
  assets?: LanyardAsset;
  timestamps?: { start?: number; end?: number };
};

export type LanyardSpotify = {
  track_id: string;
  song: string;
  artist: string;
  album: string;
  album_art_url: string;
  timestamps: { start: number; end: number };
};

export type LanyardUser = {
  id: string;
  username: string;
  global_name?: string | null;
  display_name?: string | null;
  avatar?: string | null;
  discriminator?: string;
  public_flags?: number;
  avatar_decoration_data?: { asset: string; sku_id?: string } | null;
  clan?: { tag?: string; badge?: string; identity_guild_id?: string } | null;
};

export type LanyardPresence = {
  discord_user: LanyardUser;
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify: LanyardSpotify | null;
  active_on_discord_desktop?: boolean;
  active_on_discord_mobile?: boolean;
  active_on_discord_web?: boolean;
};

export const statusLabel: Record<LanyardPresence["discord_status"], string> = {
  online: "online",
  idle: "idle",
  dnd: "do not disturb",
  offline: "offline",
};

export const statusColor: Record<LanyardPresence["discord_status"], string> = {
  online: "#23a55a",
  idle: "#f0b232",
  dnd: "#f23f43",
  offline: "#80848e",
};

/** Discord CDN asset URL for a Rich Presence image key. */
export function activityImageUrl(
  key: string | undefined,
  applicationId: string | undefined,
): string | null {
  if (!key) return null;
  if (key.startsWith("mp:external/")) {
    return `https://media.discordapp.net/external/${key.slice("mp:external/".length)}`;
  }
  if (key.startsWith("spotify:")) {
    return `https://i.scdn.co/image/${key.slice("spotify:".length)}`;
  }
  if (!applicationId) return null;
  return `https://cdn.discordapp.com/app-assets/${applicationId}/${key}.png`;
}

export function avatarUrl(user: LanyardUser | undefined): string | null {
  if (!user?.avatar) return null;
  const ext = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
}

export function decorationUrl(user: LanyardUser | undefined): string | null {
  const asset = user?.avatar_decoration_data?.asset;
  if (!asset) return null;
  return `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=160`;
}

export function displayName(user: LanyardUser | undefined): string {
  return user?.global_name || user?.display_name || user?.username || "";
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** "2 hours 14 minutes" style elapsed label for Rich Presence. */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} elapsed`;
  return `${minutes}:${String(seconds).padStart(2, "0")} elapsed`;
}
