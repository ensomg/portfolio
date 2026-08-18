import { NextResponse } from "next/server";

export const revalidate = 3600;

const USERNAME = "ensomg";

export type MinecraftAccount = {
  username: string;
  uuid: string | null;
  /** The skin PNG, proxied so the client can read it off a canvas if it wants. */
  skin: string | null;
  /** "slim" is the three-pixel-wide Alex arm; the geometry differs. */
  model: "classic" | "slim";
};

type Texture = {
  url: string;
  metadata?: { model?: string };
};

/** Mojang hands the textures back as base64 JSON on a profile property. */
function readTextures(value: string): { url: string; model: "classic" | "slim" } | null {
  try {
    const decoded = JSON.parse(Buffer.from(value, "base64").toString("utf8"));
    const skin = decoded?.textures?.SKIN as Texture | undefined;
    if (!skin?.url) return null;
    return {
      // Mojang still serves these over plain http; https works and keeps the
      // page from loading mixed content.
      url: skin.url.replace(/^http:/, "https:"),
      model: skin.metadata?.model === "slim" ? "slim" : "classic",
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const empty: MinecraftAccount = { username: USERNAME, uuid: null, skin: null, model: "classic" };

  try {
    const lookup = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${USERNAME}`,
      { next: { revalidate } },
    );
    if (!lookup.ok) return NextResponse.json(empty);

    const { id } = (await lookup.json()) as { id?: string };
    if (!id) return NextResponse.json(empty);

    const profile = await fetch(
      `https://sessionserver.mojang.com/session/minecraft/profile/${id}`,
      { next: { revalidate } },
    );
    if (!profile.ok) return NextResponse.json({ ...empty, uuid: id });

    const data = (await profile.json()) as {
      properties?: { name: string; value: string }[];
    };
    const property = data.properties?.find((entry) => entry.name === "textures");
    const textures = property ? readTextures(property.value) : null;

    return NextResponse.json({
      username: USERNAME,
      uuid: id,
      skin: textures?.url ?? null,
      model: textures?.model ?? "classic",
    } satisfies MinecraftAccount);
  } catch {
    return NextResponse.json(empty);
  }
}
