import { layout } from "@/lib/designSystem";
import { cn } from "@/lib/cn";
import type { SongReview, SpotifySong } from "@/types/api";
import { ReviewCard } from "./ReviewCard";

interface ReviewListProps {
  reviews: SongReview[];
  getAuthorName: (review: SongReview) => string;
  getAuthorAvatar?: (review: SongReview) => string | undefined;
  getOnDelete?: (review: SongReview) => (() => void) | undefined;
  getSong?: (review: SongReview) => SpotifySong | undefined;
  className?: string;
}

export function ReviewList({
  reviews,
  getAuthorName,
  getAuthorAvatar,
  getOnDelete,
  getSong,
  className,
}: ReviewListProps) {
  return (
    <div className={cn(layout.feedList, className)}>
      {reviews.map((review, index) => (
        <div
          key={review.id}
          className={cn(layout.cardStackItem, "animate-stagger")}
          style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
        >
          <ReviewCard
            review={review}
            song={getSong?.(review)}
            authorName={getAuthorName(review)}
            authorAvatar={getAuthorAvatar?.(review)}
            onDelete={getOnDelete?.(review)}
          />
        </div>
      ))}
    </div>
  );
}
