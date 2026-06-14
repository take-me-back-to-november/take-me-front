import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "./Icon";
import { StarRating } from "./StarRating";
import { useSpotifyGate } from "@/hooks/useSpotifyGate";
import type { SongReview, SpotifySong } from "@/types/api";

interface ReviewCardProps {
  review: SongReview;
  song?: SpotifySong;
  authorName?: string;
  authorAvatar?: string;
}

function useRelativeTime(dateString: string) {
  const { t } = useTranslation();
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return t("reviewCard.justNow");
  if (diffHours < 24) return t("reviewCard.hoursAgo", { count: diffHours });
  const diffDays = Math.floor(diffHours / 24);
  return t("reviewCard.daysAgo", { count: diffDays });
}

export function ReviewCard({
  review,
  song,
  authorName,
  authorAvatar,
}: ReviewCardProps) {
  const { t } = useTranslation();
  const { canInteract, openConnectFlow } = useSpotifyGate();
  const relativeTime = useRelativeTime(review.created_at);
  const name = authorName ?? t("common.reviewer");
  const coverUrl = song?.cover_url ?? review.image_url ?? undefined;
  const title = song?.title ?? review.song_name;
  const artist = song?.artist ?? review.song_artist;
  const album = song?.album_title ?? review.song_album;
  const showSongBlock = coverUrl || title || artist || album;
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element || expanded) return;

    const checkClamped = () => {
      setIsClamped(element.scrollHeight > element.clientHeight + 1);
    };

    checkClamped();
    window.addEventListener("resize", checkClamped);
    return () => window.removeEventListener("resize", checkClamped);
  }, [review.text, expanded]);

  const showReadMore = isClamped && !expanded;
  const showReadLess = expanded;

  const handleReaction = () => {
    if (!canInteract) {
      openConnectFlow();
    }
  };

  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-surface-container-high bg-surface-container-low p-md transition-default hover:bg-surface-container">
      <div className="mb-sm flex items-start justify-between">
        <div className="flex items-center gap-sm">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-surface-container-high">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
                <Icon name="person" size="sm" />
              </div>
            )}
          </div>
          <div>
            <p className="text-label-md text-on-surface">{name}</p>
            <p className="text-label-sm text-on-surface-variant">{relativeTime}</p>
          </div>
        </div>
        <StarRating value={review.stars_count} />
      </div>

      {showSongBlock && (
        <div className="mb-md flex items-center gap-md rounded-lg bg-surface p-sm">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title ?? t("reviewCard.albumCover")}
              className="h-12 w-12 rounded object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded bg-surface-container-high text-on-surface-variant">
              <Icon name="album" size="md" />
            </div>
          )}
          {(title || artist || album) && (
            <div className="min-w-0">
              {title && (
                <p className="truncate text-body-md text-on-surface">{title}</p>
              )}
              {artist && (
                <p className="truncate text-label-sm text-on-surface-variant">
                  {artist}
                </p>
              )}
              {album && (
                <p className="truncate text-label-sm text-on-surface-variant/80">
                  {album}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mb-md min-w-0">
        <p
          ref={textRef}
          className={`break-words whitespace-pre-wrap text-body-md leading-relaxed text-on-surface-variant ${
            expanded ? "" : "line-clamp-3"
          }`}
        >
          {review.text}
        </p>
        {(showReadMore || showReadLess) && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-xs text-label-md font-semibold text-primary transition-default hover:text-primary-fixed active:scale-95"
          >
            {expanded ? t("reviewCard.readLess") : t("reviewCard.readMore")}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-xs border-t border-surface-container-high pt-sm">
        {!canInteract && (
          <p className="text-center text-label-sm text-on-surface-variant">
            {t("spotifyGate.likeLocked")}
          </p>
        )}
        <div className="flex items-center gap-xs">
          <button
            type="button"
            aria-label={t("reviewCard.like")}
            onClick={handleReaction}
            className={`group inline-flex h-9 flex-1 items-center justify-center gap-xs rounded-full px-md transition-default active:scale-95 ${
              canInteract
                ? "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                : "cursor-not-allowed text-on-surface-variant/50 hover:bg-surface-container-high/60"
            }`}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              <Icon name="thumb_up" size="sm" className="leading-none" />
            </span>
            <span className="min-w-[1ch] text-label-md font-medium tabular-nums leading-none">
              {review.likes_count}
            </span>
          </button>
          <button
            type="button"
            aria-label={t("reviewCard.dislike")}
            onClick={handleReaction}
            className={`group inline-flex h-9 flex-1 items-center justify-center gap-xs rounded-full px-md transition-default active:scale-95 ${
              canInteract
                ? "text-on-surface-variant hover:bg-surface-container-high hover:text-error"
                : "cursor-not-allowed text-on-surface-variant/50 hover:bg-surface-container-high/60"
            }`}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              <Icon name="thumb_down" size="sm" className="leading-none" />
            </span>
            <span className="min-w-[1ch] text-label-md font-medium tabular-nums leading-none">
              {review.unlikes_count}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
