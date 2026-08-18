import { NextResponse } from "next/server";

export const revalidate = 3600;

const USER_ID = 2662381053;

export type RobloxAccount = {
  userId: number;
  username: string | null;
  displayName: string | null;
  /** Flat render, always available. */
  image: string | null;
  /**
   * The real avatar mesh, when Roblox will part with it. The endpoint answers
   * 403 "Invalid authentication data provided" to unauthenticated callers from
   * some networks, so this is treated as a bonus rather than the plan.
   */
  mesh: { obj: string; mtl: string | null; textures: string[] } | null;
};

async function json<T>(url: string, headers?: HeadersInit): Promise<T | null> {
  try {
    const response = await fetch(url, { headers, next: { revalidate } });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function loadMesh(): Promise<RobloxAccount["mesh"]> {
  // `.ROBLOSECURITY` is a whole account session, so it lives in the environment
  // and is only ever sent to Roblox itself. Without it the endpoint answers 403
  // and the card falls back to the flat render.
  const cookie = process.env.ROBLOX_COOKIE;
  const headers = cookie ? { Cookie: `.ROBLOSECURITY=${cookie}` } : undefined;

  const pointer = await json<{ imageUrl?: string; state?: string }>(
    `https://thumbnails.roblox.com/v1/users/avatar-3d?userId=${USER_ID}`,
    headers,
  );
  if (!pointer?.imageUrl) return null;

  const mesh = await json<{ obj?: string; mtl?: string; textures?: string[] }>(pointer.imageUrl);
  if (!mesh?.obj) return null;

  return {
    obj: mesh.obj,
    mtl: mesh.mtl ?? null,
    textures: Array.isArray(mesh.textures) ? mesh.textures : [],
  };
}

export async function GET() {
  const [user, thumbnail, mesh] = await Promise.all([
    json<{ name?: string; displayName?: string }>(`https://users.roblox.com/v1/users/${USER_ID}`),
    json<{ data?: { imageUrl?: string }[] }>(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${USER_ID}&size=420x420&format=Png`,
    ),
    loadMesh(),
  ]);

  return NextResponse.json({
    userId: USER_ID,
    username: user?.name ?? null,
    displayName: user?.displayName ?? null,
    image: thumbnail?.data?.[0]?.imageUrl ?? null,
    mesh,
  } satisfies RobloxAccount);
}
