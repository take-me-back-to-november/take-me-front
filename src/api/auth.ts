import { apiRequest } from "./client";
import type { RefreshTokenResponse, SpotifyAuthUrlResponse } from "@/types/api";

export function getSpotifyLoginUrl() {
  return apiRequest<SpotifyAuthUrlResponse>("/auth/login-url", {
    method: "GET",
  });
}

export function refreshAccessToken(refreshToken: string) {
  return apiRequest<RefreshTokenResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}
