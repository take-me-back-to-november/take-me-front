import { clearProfilePictureCache } from "@/lib/profilePictureCache";
import { getItem, removeItem, setItem } from "@/lib/persistence";
import type { User } from "@/types/api";

const TOKEN_KEY = "take_me_token";
const REFRESH_TOKEN_KEY = "take_me_refresh_token";
const USER_KEY = "take_me_user";
const SPOTIFY_CONNECTED_KEY = "take_me_spotify_connected";

export async function getStoredRefreshToken(): Promise<string | null> {
  return getItem(REFRESH_TOKEN_KEY);
}

export async function getStoredToken(): Promise<string | null> {
  return getItem(TOKEN_KEY);
}

export async function getStoredUser(): Promise<User | null> {
  const raw = await getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function getSpotifyConnected(): Promise<boolean> {
  const raw = await getItem(SPOTIFY_CONNECTED_KEY);
  return raw === "true";
}

export async function persistAccessToken(accessToken: string): Promise<void> {
  await setItem(TOKEN_KEY, accessToken);
}

export async function persistSession(
  accessToken: string,
  refreshToken: string,
  user: User,
  spotifyConnected = false,
): Promise<void> {
  await Promise.all([
    setItem(TOKEN_KEY, accessToken),
    setItem(REFRESH_TOKEN_KEY, refreshToken),
    setItem(USER_KEY, JSON.stringify(user)),
    setItem(SPOTIFY_CONNECTED_KEY, String(spotifyConnected)),
  ]);
}

export async function setSpotifyConnected(connected: boolean): Promise<void> {
  await setItem(SPOTIFY_CONNECTED_KEY, String(connected));
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    removeItem(TOKEN_KEY),
    removeItem(REFRESH_TOKEN_KEY),
    removeItem(USER_KEY),
    removeItem(SPOTIFY_CONNECTED_KEY),
    clearProfilePictureCache(),
  ]);
}
