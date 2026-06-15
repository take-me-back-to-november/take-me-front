import { apiRequest } from "./client";
import type { CreateReviewMessagePayload, SongReviewMessage } from "@/types/api";

export function getReviewMessages(token: string, reviewId: string) {
  return apiRequest<SongReviewMessage[]>(`/reviews/${reviewId}/messages`, { token });
}

export function createReviewRootReply(
  token: string,
  reviewId: string,
  payload: CreateReviewMessagePayload,
) {
  return apiRequest<SongReviewMessage>(`/reviews/${reviewId}/reply`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function createReviewNestedReply(
  token: string,
  reviewId: string,
  messageId: string,
  payload: CreateReviewMessagePayload,
) {
  return apiRequest<SongReviewMessage>(
    `/reviews/${reviewId}/messages/${messageId}/reply`,
    {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    },
  );
}
