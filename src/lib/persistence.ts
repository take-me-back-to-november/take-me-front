const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const LEGACY_KEYS = [
  "take_me_token",
  "take_me_refresh_token",
  "take_me_user",
  "take_me_spotify_connected",
  "take_me_locale",
  "take_me_my_review_ids",
  "take_me_spotify_link_pending",
] as const;

type SetItemOptions = {
  session?: boolean;
  maxAgeSeconds?: number;
};

const isBrowser = () => typeof document !== "undefined";

function getCookie(name: string): string | null {
  if (!isBrowser()) return null;

  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf("=");
    if (separatorIndex === -1) continue;

    const cookieName = cookie.slice(0, separatorIndex);
    if (cookieName !== name) continue;

    return decodeURIComponent(cookie.slice(separatorIndex + 1));
  }

  return null;
}

function setCookie(
  name: string,
  value: string,
  options: SetItemOptions = {},
): void {
  if (!isBrowser()) return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const maxAge = options.session
    ? ""
    : `; Max-Age=${options.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS}`;

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/${maxAge}; SameSite=Lax${secure}`;
}

function removeCookie(name: string): void {
  if (!isBrowser()) return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export async function getItem(key: string): Promise<string | null> {
  return getCookie(key);
}

export async function setItem(
  key: string,
  value: string,
  options?: SetItemOptions,
): Promise<void> {
  setCookie(key, value, options);
}

export async function removeItem(key: string): Promise<void> {
  removeCookie(key);
}

async function migrateLegacyKey(key: string): Promise<void> {
  if (!isBrowser() || getCookie(key)) return;

  const fromLocalStorage = localStorage.getItem(key);
  if (fromLocalStorage) {
    setCookie(key, fromLocalStorage);
    localStorage.removeItem(key);
    return;
  }

  const fromSessionStorage = sessionStorage.getItem(key);
  if (!fromSessionStorage) return;

  setCookie(key, fromSessionStorage, { session: true });
  sessionStorage.removeItem(key);
}

export async function migrateLegacyStorage(): Promise<void> {
  await Promise.all(LEGACY_KEYS.map((key) => migrateLegacyKey(key)));
}
