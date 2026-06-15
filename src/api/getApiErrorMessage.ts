import type { TFunction } from "i18next";
import { ApiError } from "./client";

const ERROR_MAP: Record<string, string> = {
  "User not found": "apiErrors.userNotFound",
  "Invalid token": "apiErrors.invalidToken",
  "Token expired": "apiErrors.tokenExpired",
  "Spotify client credentials are not configured": "apiErrors.spotifyNotConfigured",
  "User does not have a Spotify refresh token": "apiErrors.spotifyNoRefreshToken",
  "Spotify is not connected": "apiErrors.spotifyNoRefreshToken",
  "Failed to fetch Spotify songs": "apiErrors.spotifyFetchFailed",
  "Failed to fetch most listened songs": "apiErrors.spotifyFetchFailed",
  "Failed to get song from Spotify": "apiErrors.songNotFound",
  "Failed to post review.": "apiErrors.reviewCreateFailed",
  "Search failed. Try again.": "apiErrors.spotifyFetchFailed",
  "Failed to load feed.": "apiErrors.spotifyFetchFailed",
};

export function getApiErrorMessage(
  error: unknown,
  t: TFunction,
  fallbackKey: string,
): string {
  if (error instanceof TypeError) {
    return t("apiErrors.networkError");
  }

  if (error instanceof ApiError) {
    if (error.status >= 502 && error.status <= 503) {
      return t("apiErrors.serviceUnavailable");
    }
    const mappedKey = ERROR_MAP[error.message];
    if (mappedKey) return t(mappedKey);
    return t("apiErrors.requestFailed", { status: error.status });
  }
  return t(fallbackKey);
}
