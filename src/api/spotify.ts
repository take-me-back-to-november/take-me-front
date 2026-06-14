import { apiRequest } from "./client";
import type {
  CurrentlyPlayingSong,
  SpotifyAlbum,
  SpotifySong,
} from "@/types/api";

export function getMyTopTracks(token: string, limit = 5) {
  return apiRequest<SpotifySong[]>(
    `/spotify/songs/me?limit=${limit}`,
    { token },
  );
}

export function searchTracks(token: string, searchQuery: string) {
  const params = new URLSearchParams({ search_query: searchQuery });
  return apiRequest<SpotifySong[]>(`/spotify/tracks/search?${params}`, {
    token,
  });
}

export function searchAlbums(token: string, searchQuery: string) {
  const params = new URLSearchParams({ search_query: searchQuery });
  return apiRequest<SpotifyAlbum[]>(`/spotify/albums/search?${params}`, {
    token,
  });
}

export function getCurrentlyPlayingSong(token: string) {
  return apiRequest<CurrentlyPlayingSong | null>(
    "/spotify/songs/currently-playing",
    { token },
  );
}

export function removeSpotifyLink(token: string) {
  return apiRequest<void>("/spotify/me", {
    method: "DELETE",
    token,
  });
}
