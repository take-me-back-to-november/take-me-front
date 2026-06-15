import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  applySongReviewAction,
  resolveSongReviewAction,
  setSongReviewAction,
} from "@/api/actions";
import { useAuth } from "@/context/AuthContext";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { normalizeMusicText } from "@/lib/formatMusicText";
import { formatLikeCount, getReviewUserAction } from "@/lib/reviewActions";
import { interactive, layout, typography } from "@/lib/designSystem";
import { cn } from "@/lib/cn";
import type { ReviewActionType, SongReview, SpotifySong } from "@/types/api";
import { Card, CardFooter } from "./Card";
import { CardAuthorHeader } from "./CardAuthorHeader";
import { Icon } from "./Icon";
import { ReviewComments } from "./ReviewComments";
import { SongPreviewPlayButton } from "./SongPreviewPlayButton";
import { TextActionButton } from "./TextActionButton";

interface ReviewCardProps {
  review: SongReview;
  song?: SpotifySong;
  authorName?: string;
  authorAvatar?: string;
  onDelete?: () => void;
}

export function ReviewCard({
  review,
  song,
  authorName,
  authorAvatar,
  onDelete,
}: ReviewCardProps) {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const [reviewData, setReviewData] = useState(review);
  const [actionLoading, setActionLoading] = useState<ReviewActionType | null>(null);

  useEffect(() => {
    setReviewData(review);
  }, [review]);

  const relativeTime = useRelativeTime(reviewData.created_at);
  const userAction = getReviewUserAction(reviewData);
  const isLiked = userAction === "like";
  const isDisliked = userAction === "unlike";
  const likesCount = reviewData.likes_count ?? 0;
  const formattedLikes = formatLikeCount(likesCount, i18n.language);
  const name = authorName ?? t("common.reviewer");
  const coverUrl = song?.cover_url ?? reviewData.image_url ?? undefined;
  const title = song?.title ?? reviewData.song_name;
  const artist = song?.artist ?? reviewData.song_artist;
  const album = song?.album_title ?? reviewData.song_album;
  const showSongBlock = coverUrl || title || artist || album;
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleAction = async (clicked: ReviewActionType) => {
    if (!token || actionLoading) return;

    const request = resolveSongReviewAction(reviewData, clicked);
    const previous = reviewData;
    const next = applySongReviewAction(reviewData, request);

    setReviewData(next);
    setActionLoading(clicked);

    try {
      await setSongReviewAction(token, reviewData.id, request);
    } catch {
      setReviewData(previous);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    const element = textRef.current;
    if (!element || expanded) return;

    const checkClamped = () => {
      setIsClamped(element.scrollHeight > element.clientHeight + 1);
    };

    checkClamped();
    window.addEventListener("resize", checkClamped);
    return () => window.removeEventListener("resize", checkClamped);
  }, [reviewData.text, expanded]);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const showReadMore = isClamped && !expanded;
  const showReadLess = expanded;

  return (
    <Card variant="feed">
      <header className={layout.cardHeader}>
        <CardAuthorHeader
          name={name}
          avatarUrl={authorAvatar}
          timestamp={relativeTime}
          timestampDateTime={reviewData.created_at}
        />
        <div className="flex shrink-0 items-center gap-xs">
          <div
            className="flex items-center gap-[2px]"
            aria-label={t("reviewCard.star", { count: reviewData.stars_count })}
          >
            <span className="text-label-md font-medium text-primary tabular-nums">
              {reviewData.stars_count}
            </span>
            <Icon name="star" size="sm" filled className="text-primary" />
          </div>
          {onDelete && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                aria-label={t("reviewCard.moreActions")}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((open) => !open)}
                className={cn(
                  interactive.iconButton,
                  menuOpen && "bg-surface-container-high text-on-surface",
                )}
              >
                <Icon name="more_vert" size="sm" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+4px)] z-20 min-w-[168px] overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-high py-xs shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="flex w-full items-center gap-sm px-md py-sm text-left text-body-md text-error transition-default hover:bg-surface-container-highest active:scale-[0.99]"
                  >
                    <Icon name="delete" size="sm" />
                    {t("common.delete")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {showSongBlock && (
        <div className={layout.musicPreview}>
          <div className="group relative shrink-0">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={title ? normalizeMusicText(title) : t("reviewCard.albumCover")}
                className="h-12 w-12 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-surface-container-high text-on-surface-variant">
                <Icon name="album" size="md" />
              </div>
            )}
            {reviewData.spotify_song_id && (
              <SongPreviewPlayButton songId={reviewData.spotify_song_id} />
            )}
          </div>
          {(title || artist || album) && (
            <div className={layout.truncate}>
              {title && (
                <h4 className={typography.cardMusicTitle}>{normalizeMusicText(title)}</h4>
              )}
              {artist && (
                <p className={typography.cardMusicMeta}>{normalizeMusicText(artist)}</p>
              )}
              {album && (
                <p className={cn(typography.cardMusicMeta, "text-on-surface-variant/80")}>
                  {normalizeMusicText(album)}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <section className="min-w-0">
        {reviewData.title && (
          <p className={typography.cardReviewTitle}>{reviewData.title}</p>
        )}

        <p
          ref={textRef}
          className={cn(typography.cardBody, !expanded && "line-clamp-3")}
        >
          {reviewData.text}
        </p>
        {(showReadMore || showReadLess) && (
          <TextActionButton onClick={() => setExpanded((value) => !value)}>
            {expanded ? t("reviewCard.readLess") : t("reviewCard.readMore")}
          </TextActionButton>
        )}
      </section>

      {token && (
        <CardFooter>
          <div
            className="inline-flex h-8 items-stretch overflow-hidden rounded-full bg-surface-container-high"
            role="group"
            aria-label={t("reviewCard.reactions")}
          >
            <button
              type="button"
              aria-label={t("reviewCard.likeWithCount", { count: likesCount })}
              aria-pressed={isLiked}
              disabled={actionLoading !== null}
              onClick={() => void handleAction("like")}
              className={cn(
                "flex items-center gap-1.5 px-3",
                interactive.reactionIdle,
                isLiked && interactive.reactionActive,
              )}
            >
              <Icon
                name="thumb_up"
                size="sm"
                filled={isLiked}
                className={actionLoading === "like" ? "animate-pulse" : ""}
              />
              <span className="min-w-[1ch] text-label-sm font-medium tabular-nums">
                {formattedLikes}
              </span>
            </button>

            <div
              className="w-px self-center bg-outline-variant/30"
              aria-hidden="true"
              style={{ height: "1rem" }}
            />

            <button
              type="button"
              aria-label={t("reviewCard.dislike")}
              aria-pressed={isDisliked}
              disabled={actionLoading !== null}
              onClick={() => void handleAction("unlike")}
              className={cn(
                "flex items-center px-3",
                interactive.reactionIdle,
                isDisliked && interactive.reactionActive,
              )}
            >
              <Icon
                name="thumb_down"
                size="sm"
                filled={isDisliked}
                className={actionLoading === "unlike" ? "animate-pulse" : ""}
              />
            </button>
          </div>
        </CardFooter>
      )}

      <ReviewComments reviewId={reviewData.id} />
    </Card>
  );
}
