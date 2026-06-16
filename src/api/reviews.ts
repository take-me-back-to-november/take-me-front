import { apiRequest } from "./client";
import type { CreateReviewPayload, PaginatedSongReviews, SongReview } from "@/types/api";

type GetReviewsParams = {
  offset?: number;
  limit?: number;
  orderBy?: string;
  spotifySongId?: string;
  spotifyAlbumId?: string;
  userId?: string;
};

export const REVIEWS_PAGE_SIZE = 10;

export function getReviews(token: string, params: GetReviewsParams = {}) {
  const {
    offset = 0,
    limit = REVIEWS_PAGE_SIZE,
    orderBy = "created_at",
    spotifySongId,
    spotifyAlbumId,
    userId,
  } = params;

  const searchParams = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
    order_by: orderBy,
  });

  if (spotifySongId) {
    searchParams.set("spotify_song_id", spotifySongId);
  }
  if (spotifyAlbumId) {
    searchParams.set("spotify_album_id", spotifyAlbumId);
  }
  if (userId) {
    searchParams.set("user_id", userId);
  }

  return apiRequest<PaginatedSongReviews>(`/reviews?${searchParams}`, { token });
}

export async function getAllReviewsForSong(token: string, spotifySongId: string) {
  const pageSize = 50;
  let offset = 0;
  const reviews: SongReview[] = [];

  while (true) {
    const page = await getReviews(token, {
      offset,
      limit: pageSize,
      orderBy: "-created_at",
      spotifySongId,
    });

    reviews.push(...page.items);

    if (!page.has_next_page) {
      break;
    }

    offset += pageSize;
  }

  return reviews;
}

export async function getMyReviewForSong(
  token: string,
  spotifySongId: string,
  userId: string,
) {
  const page = await getReviews(token, {
    offset: 0,
    limit: 1,
    orderBy: "-created_at",
    spotifySongId,
    userId,
  });

  return page.items[0] ?? null;
}

export function createReview(token: string, payload: CreateReviewPayload) {
  return apiRequest<SongReview>("/reviews", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteReview(token: string, reviewId: string) {
  return apiRequest<void>(`/reviews/${reviewId}`, {
    method: "DELETE",
    token,
  });
}
