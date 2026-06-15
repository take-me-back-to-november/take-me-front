import { clearProfilePictureCache } from "@/lib/profilePictureCache";
import { getItem, removeItem, setItem } from "@/lib/persistence";
import type { User } from "@/types/api";

const TOKEN_KEY = "take_me_token";
const REFRESH_TOKEN_KEY = "take_me_refresh_token";
const USER_KEY = "take_me_user";

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

export async function persistAccessToken(accessToken: string): Promise<void> {
  await setItem(TOKEN_KEY, accessToken);
}

export async function persistSession(
  accessToken: string,
  refreshToken: string,
  user: User,
): Promise<void> {
  await Promise.all([
    setItem(TOKEN_KEY, accessToken),
    setItem(REFRESH_TOKEN_KEY, refreshToken),
    setItem(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function persistUser(user: User): Promise<void> {
  await setItem(USER_KEY, JSON.stringify(user));
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    removeItem(TOKEN_KEY),
    removeItem(REFRESH_TOKEN_KEY),
    removeItem(USER_KEY),
    clearProfilePictureCache(),
  ]);
}
