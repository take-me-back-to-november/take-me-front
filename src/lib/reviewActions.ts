import type { ReviewActionType, SongReview, SongReviewAction } from "@/types/api";

export function getReviewUserAction(
  review: SongReview,
): ReviewActionType | null {
  return review.actions?.[0]?.action ?? null;
}

export function resolveReviewActionRequest(
  currentAction: ReviewActionType | null,
  clickedAction: ReviewActionType,
): ReviewActionType | "clear" {
  if (currentAction === clickedAction) {
    return "clear";
  }
  return clickedAction;
}

function adjustLikesCount(
  count: number,
  from: ReviewActionType | null,
  to: ReviewActionType | "clear",
): number {
  let next = count;
  if (from === "like" && to !== "like") {
    next -= 1;
  }
  if (from !== "like" && to === "like") {
    next += 1;
  }
  return Math.max(0, next);
}

export function applyReviewAction(
  review: SongReview,
  action: ReviewActionType | "clear",
): SongReview {
  const currentAction = getReviewUserAction(review);
  const likesCount = adjustLikesCount(
    review.likes_count ?? 0,
    currentAction,
    action,
  );

  if (action === "clear") {
    return { ...review, actions: [], likes_count: likesCount };
  }

  const nextAction: SongReviewAction = {
    id: review.actions?.[0]?.id ?? review.id,
    action,
  };

  return { ...review, actions: [nextAction], likes_count: likesCount };
}

export function formatLikeCount(count: number, locale: string): string {
  if (count < 1000) {
    return String(count);
  }

  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count);
}
