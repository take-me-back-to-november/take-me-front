import { apiRequest } from "./client";
import type { RefreshTokenResponse, SpotifyAuthUrlResponse } from "@/types/api";

export function getSpotifyLoginUrl() {
  const params = new URLSearchParams({
    return_to: window.location.origin,
  });
  return apiRequest<SpotifyAuthUrlResponse>(`/auth/login-url?${params}`, {
    method: "GET",
  });
}

export function refreshAccessToken(refreshToken: string) {
  return apiRequest<RefreshTokenResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}
