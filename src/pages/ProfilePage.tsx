import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getApiErrorMessage } from "@/api/getApiErrorMessage";
import { getUserResume } from "@/api/me";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { CurrentlyPlayingCard } from "@/components/CurrentlyPlayingCard";
import { PageTransition } from "@/components/PageTransition";
import { ReviewCard } from "@/components/ReviewCard";
import { SpotifyConnectPrompt } from "@/components/SpotifyConnectPrompt";
import { SpotifyLinkedBadge } from "@/components/SpotifyLinkedBadge";
import { useAuth } from "@/context/AuthContext";
import type { UserResume } from "@/types/api";

export function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, spotifyConnected, token, unlinkSpotify } = useAuth();
  const [resume, setResume] = useState<UserResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);
  const [unlinkSuccess, setUnlinkSuccess] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);

  const displayName = resume?.name || user?.name || t("common.defaultUser");
  const pictureUrl = resume?.picture_url ?? user?.picture_url ?? null;
  const spotifyLosses = [
    {
      icon: "rate_review",
      text: t("profile.unlinkLosses.review"),
    },
    {
      icon: "thumb_up",
      text: t("profile.unlinkLosses.like"),
    },
    {
      icon: "graphic_eq",
      text: t("profile.unlinkLosses.nowPlaying"),
    },
  ];

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
    if (!showUnlinkConfirm) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showUnlinkConfirm]);

  const averageStars =
    resume && resume.reviews_count > 0
      ? resume.reviews_average_stars.toFixed(1)
      : "—";

  const handleSwitchSpotifyAccount = async () => {
    setUnlinkError(null);
    setUnlinkSuccess(false);
    setShowUnlinkConfirm(false);
    setIsUnlinking(true);
    try {
      await unlinkSpotify();
      navigate("/connect-spotify");
    } catch (err) {
      setUnlinkError(getApiErrorMessage(err, t, "profile.switchSpotifyError"));
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleUnlink = async () => {
    setUnlinkError(null);
    setUnlinkSuccess(false);
    setIsUnlinking(true);
    try {
      await unlinkSpotify();
      setUnlinkSuccess(true);
      setShowUnlinkConfirm(false);
    } catch (err) {
      setUnlinkError(getApiErrorMessage(err, t, "profile.unlinkError"));
    } finally {
      setIsUnlinking(false);
    }
  };

  return (
    <>
      <PageTransition>
      <main className="mx-auto flex w-full max-w-content-md flex-grow flex-col gap-lg px-container-margin pb-xl md:max-w-[640px]">
        <section className="flex flex-col items-center border-b border-surface-container-high/50 pb-lg pt-xs text-center">
          <div className="relative mb-md">
            {pictureUrl ? (
              <img
                src={pictureUrl}
                alt={displayName}
                className="relative z-10 h-28 w-28 rounded-full border-4 border-surface object-cover shadow-lg sm:h-32 sm:w-32"
              />
            ) : (
              <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full border-4 border-surface bg-surface-container-high shadow-lg sm:h-32 sm:w-32">
                <Icon name="person" size="xl" className="text-on-surface-variant" />
              </div>
            )}
            <div className="absolute inset-0 z-0 scale-110 rounded-full bg-primary/20 blur-xl" />
          </div>

          <div className="flex w-full flex-col items-center gap-xs">
            <h1 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">
              {displayName}
            </h1>
          </div>

          <div className="mt-lg flex w-full max-w-content-sm flex-col items-center gap-md">
            {spotifyConnected ? (
              <>
                <SpotifyLinkedBadge
                  label={t("profile.linkedToSpotify")}
                  description={t("profile.spotifyLinkedHint")}
                />

                <div className="grid w-full grid-cols-2 gap-sm">
                  <Button
                    variant="secondary"
                    onClick={() => void handleSwitchSpotifyAccount()}
                    disabled={isUnlinking}
                    className="min-w-0 px-sm"
                    icon={<Icon name="sync_alt" size="sm" />}
                  >
                    {isUnlinking
                      ? t("profile.switchingSpotify")
                      : t("profile.switchSpotify")}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setUnlinkError(null);
                      setUnlinkSuccess(false);
                      setShowUnlinkConfirm(true);
                    }}
                    disabled={isUnlinking}
                    className="min-w-0 px-sm text-error hover:text-error"
                  >
                    {t("profile.unlinkSpotify")}
                  </Button>
                </div>

                {unlinkError && (
                  <p className="text-body-md text-error">{unlinkError}</p>
                )}
                {unlinkSuccess && (
                  <p className="text-body-md text-spotify">{t("profile.unlinkSuccess")}</p>
                )}
              </>
            ) : (
              <SpotifyConnectPrompt variant="profile" />
            )}
          </div>
        </section>

        {spotifyConnected && token && (
          <section>
            <CurrentlyPlayingCard token={token} />
          </section>
        )}

        {error && <p className="text-body-md text-error">{error}</p>}

        <section className="grid grid-cols-2 gap-sm">
          <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container-high px-md py-lg transition-default hover:bg-surface-container-highest">
            <span className="text-headline-md text-on-surface">
              {loading ? "—" : (resume?.reviews_count ?? 0)}
            </span>
            <span className="mt-xs text-label-sm tracking-widest text-on-surface-variant uppercase">
              {t("profile.reviews")}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container-high px-md py-lg transition-default hover:bg-surface-container-highest">
            <span className="text-headline-md text-primary">
              {loading ? "—" : averageStars}
            </span>
            <span className="mt-xs text-label-sm tracking-widest text-on-surface-variant uppercase">
              {t("profile.averageRating")}
            </span>
          </div>
        </section>

        <section className="flex flex-grow flex-col">
          <h2 className="mb-md text-headline-md text-on-surface">{t("profile.myReviews")}</h2>
          {loading ? (
            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-md">
              <div className="h-20 rounded shimmer" />
            </div>
          ) : resume && resume.reviews.length > 0 ? (
            <div className="flex flex-col gap-md">
              {resume.reviews.map((review, index) => (
                <div
                  key={review.id}
                  className="animate-stagger"
                  style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
                >
                  <ReviewCard
                    review={review}
                    authorName={displayName}
                    authorAvatar={pictureUrl ?? undefined}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-container-high bg-surface-container-high/50 px-md py-xl">
              <Icon name="rate_review" size="xl" className="mb-md text-surface-container-highest" />
              <p className="max-w-[300px] text-center text-body-lg text-on-surface-variant">
                {t("profile.emptyReviews")}
              </p>
              <Button
                onClick={() => navigate(spotifyConnected ? "/review" : "/connect-spotify")}
                className="mt-lg"
                icon={<Icon name="add" size="md" />}
              >
                {t("profile.writeReview")}
              </Button>
            </div>
          )}
        </section>
      </main>
      </PageTransition>

      {showUnlinkConfirm && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 px-md backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unlink-spotify-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label={t("profile.keepSpotify")}
            onClick={() => setShowUnlinkConfirm(false)}
          />

          <section className="animate-slide-up relative z-10 w-full max-w-content-md rounded-t-[32px] border border-outline-variant/40 bg-surface-container px-lg pb-lg pt-sm shadow-[0_-18px_60px_rgba(0,0,0,0.45)] safe-bottom">
            <div className="mx-auto mb-md h-1.5 w-12 rounded-full bg-outline-variant" />

            <div className="mb-md flex items-start gap-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-spotify/10 text-spotify">
                <Icon name="music_off" size="lg" />
              </div>
              <div className="min-w-0 text-left">
                <h2
                  id="unlink-spotify-title"
                  className="text-headline-md text-on-surface"
                >
                  {t("profile.unlinkTitle")}
                </h2>
                <p className="mt-xs text-body-md text-on-surface-variant">
                  {t("profile.unlinkDescription")}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-sm">
              {spotifyLosses.map((feature) => (
                <div
                  key={feature.icon}
                  className="flex items-center gap-sm rounded-2xl bg-surface-container-high px-md py-sm text-left"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant">
                    <Icon name={feature.icon} size="sm" />
                  </span>
                  <span className="text-body-md text-on-surface-variant">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-lg flex flex-col gap-sm">
              <Button
                onClick={() => setShowUnlinkConfirm(false)}
                disabled={isUnlinking}
                fullWidth
              >
                {t("profile.keepSpotify")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => void handleUnlink()}
                disabled={isUnlinking}
                fullWidth
                className="text-error hover:text-error"
              >
                {isUnlinking ? t("profile.unlinking") : t("profile.confirmUnlinkSpotify")}
              </Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
