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
  const { user, spotifyConnected, token, unlinkSpotify } = useAuth();
  const [resume, setResume] = useState<UserResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [showSpotifySettings, setShowSpotifySettings] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const displayName = resume?.name || user?.name || t("common.defaultUser");
  const pictureUrl = resume?.picture_url ?? user?.picture_url ?? null;
  const isSpotifyConnected = resume?.spotify_connected ?? spotifyConnected;

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

  useEffect(() => {
    if (!showSpotifySettings) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showSpotifySettings]);

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

  const handleSwitchSpotifyAccount = async () => {
    setUnlinkError(null);
    setShowSpotifySettings(false);
    setIsUnlinking(true);
    try {
      await unlinkSpotify();
      setResume((current) =>
        current ? { ...current, spotify_connected: false } : current,
      );
      navigate("/connect-spotify");
    } catch (err) {
      setUnlinkError(getApiErrorMessage(err, t, "profile.switchSpotifyError"));
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleLogoutSpotify = async () => {
    setUnlinkError(null);
    setIsUnlinking(true);
    try {
      await unlinkSpotify();
      setResume((current) =>
        current ? { ...current, spotify_connected: false } : current,
      );
      setShowSpotifySettings(false);
    } catch (err) {
      setUnlinkError(getApiErrorMessage(err, t, "profile.unlinkError"));
    } finally {
      setIsUnlinking(false);
    }
  };

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
            <div className="flex min-h-12 items-center justify-between gap-sm rounded-full border border-outline-variant/30 bg-surface-container-high p-xs text-left">
              <div className="flex min-w-0 items-center gap-sm">
                <SpotifyIcon className="h-10 w-10 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-xs">
                    <p className="text-label-md text-on-surface">Spotify</p>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${isSpotifyConnected ? "bg-spotify" : "bg-error"}`}
                      aria-label={
                        isSpotifyConnected
                          ? t("profile.spotifyStatusConnected")
                          : t("profile.spotifyStatusDisconnected")
                      }
                      role="img"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label={t("profile.spotifySettings")}
                onClick={() => {
                  if (isSpotifyConnected) {
                    setShowSpotifySettings(true);
                    return;
                  }
                  navigate("/connect-spotify");
                }}
                disabled={isUnlinking}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-default active:scale-95 disabled:opacity-50 ${
                  isSpotifyConnected
                    ? "border-outline text-on-surface hover:bg-surface-container-highest"
                    : "border-spotify/30 bg-spotify/10 text-spotify hover:bg-spotify/15"
                }`}
              >
                <Icon name={isSpotifyConnected ? "settings" : "arrow_forward"} size="md" />
              </button>
            </div>

            {unlinkError && (
              <p className="text-body-md text-error">{unlinkError}</p>
            )}
          </div>
        </section>

        {isSpotifyConnected && token && (
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
                onClick={() => navigate(isSpotifyConnected ? "/review" : "/connect-spotify")}
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

      {showSpotifySettings && (
        <div
          className="animate-modal-backdrop fixed inset-0 z-[80] flex items-center justify-center bg-black/55 px-md backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="spotify-settings-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label={t("common.close")}
            onClick={() => setShowSpotifySettings(false)}
          />

          <section className="animate-modal-card relative z-10 w-full max-w-content-sm rounded-[28px] border border-outline-variant/40 bg-surface-container px-lg py-lg text-center shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <div className="mx-auto mb-md flex h-12 w-12 items-center justify-center rounded-full bg-spotify/10">
              <SpotifyIcon className="h-7 w-7" />
            </div>
            <h2 id="spotify-settings-title" className="text-headline-md text-on-surface">
              {t("profile.spotifySettingsTitle")}
            </h2>
            <p className="mt-xs text-body-md text-on-surface-variant">
              {t("profile.spotifySettingsDescription")}
            </p>

            <div className="mt-lg flex flex-col gap-sm">
              <Button
                onClick={() => void handleSwitchSpotifyAccount()}
                disabled={isUnlinking}
                fullWidth
                icon={<Icon name="sync_alt" size="sm" />}
              >
                {isUnlinking ? t("profile.switchingSpotify") : t("profile.switchSpotify")}
              </Button>
              <Button
                variant="secondary"
                onClick={() => void handleLogoutSpotify()}
                disabled={isUnlinking}
                fullWidth
              >
                {isUnlinking ? t("profile.unlinking") : t("profile.logoutSpotify")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSpotifySettings(false)}
                disabled={isUnlinking}
                fullWidth
              >
                {t("common.close")}
              </Button>
            </div>
          </section>
        </div>
      )}

    </>
  );
}
