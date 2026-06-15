import { apiRequest } from "./client";
import type { ReviewActionType } from "@/types/api";
import {
  applyReviewAction,
  getReviewUserAction,
  resolveReviewActionRequest,
} from "@/lib/reviewActions";
import type { SongReview } from "@/types/api";

export function setSongReviewAction(
  token: string,
  reviewId: string,
  action: ReviewActionType | "clear",
) {
  return apiRequest<void>(`/reviews/${reviewId}/actions`, {
    method: "POST",
    token,
    body: JSON.stringify({ action }),
  });
}

export function resolveSongReviewAction(
  review: SongReview,
  clicked: ReviewActionType,
): ReviewActionType | "clear" {
  return resolveReviewActionRequest(getReviewUserAction(review), clicked);
}

export function applySongReviewAction(
  review: SongReview,
  action: ReviewActionType | "clear",
): SongReview {
  return applyReviewAction(review, action);
}
