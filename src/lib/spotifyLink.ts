import { getItem, removeItem, setItem } from "@/lib/persistence";

const SPOTIFY_LINK_PENDING_KEY = "take_me_spotify_link_pending";

export async function beginSpotifyLink(): Promise<void> {
  await setItem(SPOTIFY_LINK_PENDING_KEY, "true", { session: true });
}

export async function isSpotifyLinkPending(): Promise<boolean> {
  return (await getItem(SPOTIFY_LINK_PENDING_KEY)) === "true";
}

export async function consumeSpotifyLinkSuccess(): Promise<boolean> {
  const pending = await isSpotifyLinkPending();
  if (!pending) return false;

  await removeItem(SPOTIFY_LINK_PENDING_KEY);
  return true;
}

export async function clearSpotifyLinkPending(): Promise<void> {
  await removeItem(SPOTIFY_LINK_PENDING_KEY);
}
