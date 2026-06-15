import { getReviewMessages } from "@/api/reviewMessages";
import type { SongReviewMessage } from "@/types/api";

const cache = new Map<string, SongReviewMessage[]>();
const inflight = new Map<string, Promise<SongReviewMessage[]>>();

export function getCachedReviewMessages(
  reviewId: string,
): SongReviewMessage[] | undefined {
  return cache.get(reviewId);
}

export function appendCachedReviewMessage(
  reviewId: string,
  message: SongReviewMessage,
): void {
  const cached = cache.get(reviewId);
  if (cached) {
    cache.set(reviewId, [...cached, message]);
  }
}

export async function prefetchReviewMessages(
  token: string,
  reviewId: string,
): Promise<SongReviewMessage[]> {
  const cached = cache.get(reviewId);
  if (cached) return cached;

  const pending = inflight.get(reviewId);
  if (pending) return pending;

  const promise = getReviewMessages(token, reviewId)
    .then((messages) => {
      cache.set(reviewId, messages);
      inflight.delete(reviewId);
      return messages;
    })
    .catch((error) => {
      inflight.delete(reviewId);
      throw error;
    });

  inflight.set(reviewId, promise);
  return promise;
}
