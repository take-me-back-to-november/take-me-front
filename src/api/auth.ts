import { apiRequest } from "./client";
import type { AuthResponse, RefreshTokenResponse, SpotifyAuthUrlResponse } from "@/types/api";

export function signInWithGoogle(googleIdToken: string) {
  return apiRequest<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ google_id: googleIdToken }),
  });
}

export function refreshAccessToken(refreshToken: string) {
  return apiRequest<RefreshTokenResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export function getSpotifyAuthUrl(token: string) {
  return apiRequest<SpotifyAuthUrlResponse>("/auth/spotify", {
    method: "POST",
    token,
  });
}
