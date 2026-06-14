import { apiRequest } from "./client";
import type { CreateReviewPayload, SongReview } from "@/types/api";

export function getReviews(
  token: string,
  offset = 0,
  limit = 10,
  orderBy = "created_at",
  spotifySongId?: string,
) {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
    order_by: orderBy,
  });
  if (spotifySongId) {
    params.set("spotify_song_id", spotifySongId);
  }
  return apiRequest<SongReview[]>(`/reviews?${params}`, { token });
}

export function createReview(token: string, payload: CreateReviewPayload) {
  return apiRequest<SongReview>("/reviews", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}
