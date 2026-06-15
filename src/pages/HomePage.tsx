import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "@/api/getApiErrorMessage";
import { getReviews, deleteReview } from "@/api/reviews";
import { Button } from "@/components/Button";
import { FeedSwitcher, type FeedTab } from "@/components/FeedSwitcher";
import { Icon } from "@/components/Icon";
import { PageTransition } from "@/components/PageTransition";
import { ReviewList } from "@/components/ReviewList";
import { SpotifyConnectPrompt } from "@/components/SpotifyConnectPrompt";
import { useAuth } from "@/context/AuthContext";
import type { SongReview } from "@/types/api";

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, user, spotifyConnected } = useAuth();
  const [feedTab, setFeedTab] = useState<FeedTab>("general");
  const [reviews, setReviews] = useState<SongReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!token || feedTab !== "general" || !spotifyConnected) {
      if (!spotifyConnected) {
        setReviews([]);
        setLoadingReviews(false);
        setError(null);
      }
      return;
    }

    async function load() {
      setLoadingReviews(true);
      setError(null);
      try {
        const feed = await getReviews(token!);
        setReviews(feed);
      } catch (err) {
        setError(getApiErrorMessage(err, t, "home.loadError"));
      } finally {
        setLoadingReviews(false);
      }
    }

    void load();
  }, [token, t, feedTab, spotifyConnected]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!token) return;
    setDeletingReviewId(reviewId);
    try {
      await deleteReview(token, reviewId);
      setReviews((current) => current.filter((review) => review.id !== reviewId));
    } catch (err) {
      setError(getApiErrorMessage(err, t, "writeReview.deleteError"));
    } finally {
      setDeletingReviewId(null);
    }
  };

  return (
    <PageTransition>
      <main className="mx-auto w-full max-w-[1440px] pb-xl">
        {error && feedTab === "general" && (
          <p className="px-container-margin py-md text-body-md text-error">{error}</p>
        )}

        <section className="mt-md px-container-margin md:px-[64px]">
          <div className="mb-lg flex justify-center md:justify-start">
            <FeedSwitcher value={feedTab} onChange={setFeedTab} />
          </div>

          {!spotifyConnected && feedTab === "general" && (
            <div className="mb-lg">
              <SpotifyConnectPrompt variant="banner" />
            </div>
          )}

          {feedTab === "following" ? (
            <div className="mx-auto flex w-full max-w-content-md flex-col items-center rounded-xl border border-surface-container-high bg-surface-container-high/50 p-md">
              <img
                src="/gabriel_fim_da_escravidao.jpg"
                alt={t("home.followingGabrielAlt")}
                className="mb-lg w-full max-h-[70vh] rounded-lg object-contain shadow-lg"
              />
              <p className="w-full text-headline-md text-center text-on-surface">
                {t("home.followingComingSoon")}
              </p>
              <p className="mt-sm w-full text-center text-body-md text-on-surface-variant">
                {t("home.followingComingSoonHint")}
              </p>
            </div>
          ) : spotifyConnected ? (
            <div className="flex flex-col">
              {loadingReviews ? (
                <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-md opacity-50">
                  <div className="mb-sm flex items-center gap-sm">
                    <div className="h-8 w-8 rounded-full shimmer" />
                    <div className="flex flex-col gap-unit">
                      <div className="h-3 w-24 rounded shimmer" />
                      <div className="h-2 w-16 rounded shimmer" />
                    </div>
                  </div>
                  <div className="h-20 rounded shimmer" />
                </div>
              ) : reviews.length > 0 ? (
                <ReviewList
                  reviews={reviews}
                  getAuthorName={(review) => review.user?.name ?? t("common.reviewer")}
                  getAuthorAvatar={(review) => review.user?.picture_url ?? undefined}
                  getOnDelete={(review) =>
                    review.user?.id === user?.id && deletingReviewId !== review.id
                      ? () => void handleDeleteReview(review.id)
                      : undefined
                  }
                />
              ) : (
                <div className="animate-fade-in flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-container-high bg-surface-container-high/50 py-xl">
                  <div className="pulse-loader mb-md flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Icon name="rate_review" size="xl" className="text-primary" />
                  </div>
                  <p className="text-headline-md text-on-surface">
                    {t("home.noReviewsTitle")}
                  </p>
                  <p className="mt-sm max-w-[300px] text-center text-body-md text-on-surface-variant">
                    {t("home.noReviewsHint")}
                  </p>
                  <Button
                    onClick={() => navigate("/review")}
                    className="mt-lg"
                    icon={<Icon name="search" size="md" />}
                  >
                    {t("home.noReviewsCta")}
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </section>
      </main>
    </PageTransition>
  );
}
