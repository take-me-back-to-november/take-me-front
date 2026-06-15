import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getApiErrorMessage } from "@/api/getApiErrorMessage";
import { getUserResume } from "@/api/me";
import { deleteReview } from "@/api/reviews";
import { Button } from "@/components/Button";
import { CachedAvatar } from "@/components/CachedAvatar";
import { Icon } from "@/components/Icon";
import { CurrentlyPlayingCard } from "@/components/CurrentlyPlayingCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PageTransition } from "@/components/PageTransition";
import { ReviewList } from "@/components/ReviewList";
import { StatsRow } from "@/components/StatsRow";
import { SpotifyIcon } from "@/components/SpotifyIcon";
import { typography } from "@/lib/designSystem";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/cn";
import type { UserResume } from "@/types/api";

export function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [resume, setResume] = useState<UserResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const displayName = resume?.name || user?.name || t("common.defaultUser");
  const pictureUrl = resume?.picture_url ?? user?.picture_url ?? null;

  useEffect(() => {
    if (!token) return;

    async function loadResume() {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserResume(token!);
        setResume(data);
      } catch (err) {
        setError(getApiErrorMessage(err, t, "profile.loadError"));
        setResume(null);
      } finally {
        setLoading(false);
      }
    }

    void loadResume();
  }, [token, t]);

  const averageStars =
    resume && resume.reviews_count > 0
      ? resume.reviews_average_stars.toFixed(1)
      : "—";

  const profileStats = [
    {
      id: "reviews",
      value: resume?.reviews_count ?? 0,
      label: t("profile.reviews"),
    },
    {
      id: "average-rating",
      value: averageStars,
      label: t("profile.averageRating"),
      accent: true,
    },
  ];

  const handleDeleteReview = async (reviewId: string) => {
    if (!token) return;
    setDeletingReviewId(reviewId);
    try {
      await deleteReview(token, reviewId);
      setResume((current) => {
        if (!current) return current;
        const reviews = current.reviews.filter((review) => review.id !== reviewId);
        const totalStars = reviews.reduce((sum, review) => sum + review.stars_count, 0);
        return {
          ...current,
          reviews,
          reviews_count: reviews.length,
          reviews_average_stars: reviews.length > 0 ? totalStars / reviews.length : 0,
        };
      });
    } catch (err) {
      setError(getApiErrorMessage(err, t, "writeReview.deleteError"));
    } finally {
      setDeletingReviewId(null);
    }
  };

  return (
    <>
      <PageTransition>
      <main className="mx-auto flex w-full max-w-content-md flex-grow flex-col gap-md px-container-margin pb-lg md:max-w-[640px]">
        <section className="flex flex-col items-center border-b border-surface-container-high/50 pb-md text-center">
          <div className="relative mb-sm">
            <CachedAvatar
              src={pictureUrl}
              alt={displayName}
              className="relative z-10 h-24 w-24 rounded-full border-4 border-surface object-cover shadow-lg sm:h-28 sm:w-28"
              fallback={
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-4 border-surface bg-surface-container-high shadow-lg sm:h-28 sm:w-28">
                  <Icon name="person" size="xl" className="text-on-surface-variant" />
                </div>
              }
            />
            <div className="absolute inset-0 z-0 scale-110 rounded-full bg-primary/20 blur-xl" />
          </div>

          <div className="flex w-full flex-col items-center gap-xs">
            <h1 className={typography.pageTitle}>{displayName}</h1>
          </div>

          <div className="mt-md flex w-full max-w-content-sm flex-col gap-xs">
            <div className="flex min-h-12 items-center gap-sm rounded-full border border-outline-variant/30 bg-surface-container-high p-xs text-left">
              <div className="flex min-w-0 items-center gap-sm">
                <SpotifyIcon className="h-10 w-10 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-xs">
                    <p className="text-label-md text-on-surface">Spotify</p>
                    <span
                      className="h-2.5 w-2.5 rounded-full bg-spotify"
                      aria-label={t("profile.spotifyStatusConnected")}
                      role="img"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {token && (
          <section>
            <CurrentlyPlayingCard token={token} />
          </section>
        )}

        <section className="flex items-center justify-between rounded-xl bg-surface-container-high px-md py-xs">
          <span className="text-label-md text-on-surface-variant">
            {t("profile.language")}
          </span>
          <LanguageSwitcher size="sm" />
        </section>

        {error && <p className="text-body-md text-error">{error}</p>}

        <StatsRow items={profileStats} loading={loading} />

        <section className="flex flex-grow flex-col">
          <h2 className={cn("mb-sm", typography.sectionTitle)}>{t("profile.myReviews")}</h2>
          {loading ? (
            <div className="rounded-xl border border-white/5 bg-surface-container-low p-md">
              <div className="h-20 rounded shimmer" />
            </div>
          ) : resume && resume.reviews.length > 0 ? (
            <ReviewList
              reviews={resume.reviews}
              getAuthorName={() => displayName}
              getAuthorAvatar={() => pictureUrl ?? undefined}
              getOnDelete={(review) =>
                deletingReviewId === review.id
                  ? undefined
                  : () => void handleDeleteReview(review.id)
              }
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-container-high bg-surface-container-high/50 px-md py-lg">
              <Icon name="rate_review" size="xl" className="mb-sm text-surface-container-highest" />
              <p className="max-w-[300px] text-center text-body-lg text-on-surface-variant">
                {t("profile.emptyReviews")}
              </p>
              <Button
                onClick={() => navigate("/review")}
                className="mt-md"
                icon={<Icon name="add" size="md" />}
              >
                {t("profile.writeReview")}
              </Button>
            </div>
          )}
        </section>
      </main>
      </PageTransition>
    </>
  );
}
