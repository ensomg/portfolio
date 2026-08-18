import { site } from "@/lib/site";

export const revalidate = 3600;

const FALLBACK = "https://cdn.discordapp.com/embed/avatars/0.png";

/**
 * The current Discord avatar, served as the site icon.
 *
 * Discord rewrites the avatar hash every time the picture changes, so a file
 * committed to `public/` would go stale the first time he swaps it. Asking
 * Lanyard for the live hash keeps the favicon current on its own. Animated
 * avatars are requested as `.png` — a favicon should not be a video.
 */
export async function GET() {
  let url = FALLBACK;

  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${site.lanyard.discordId}`, {
      next: { revalidate },
    });

    if (response.ok) {
      const payload = (await response.json()) as {
        data?: { discord_user?: { id: string; avatar?: string | null } };
      };
      const user = payload.data?.discord_user;
      if (user?.avatar) {
        url = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
      }
    }
  } catch {
    // Fall through to the default Discord avatar.
  }

  const image = await fetch(url, { next: { revalidate } });

  if (!image.ok) {
    return new Response(null, { status: 502 });
  }

  return new Response(image.body, {
    headers: {
      "Content-Type": image.headers.get("Content-Type") ?? "image/png",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
