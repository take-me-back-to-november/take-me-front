import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "@/api/getApiErrorMessage";
import { deleteReview, getReviews, REVIEWS_PAGE_SIZE } from "@/api/reviews";
import { Button } from "@/components/Button";
import { FeedSwitcher, type FeedTab } from "@/components/FeedSwitcher";
import { Icon } from "@/components/Icon";
import { PageTransition } from "@/components/PageTransition";
import { ReviewList } from "@/components/ReviewList";
import { useAuth } from "@/context/AuthContext";
import type { SongReview } from "@/types/api";

const FEED_POLL_INTERVAL_MS = 5000;

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [feedTab, setFeedTab] = useState<FeedTab>("general");
  const [reviews, setReviews] = useState<SongReview[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedBeyondFirstPage = useRef(false);

  const loadFeed = useCallback(
    async ({ showLoading = false }: { showLoading?: boolean } = {}) => {
      if (!token) return;

      if (showLoading) {
        setLoadingReviews(true);
        setError(null);
      }

      try {
        const page = await getReviews(token, { orderBy: "-created_at" });
        setReviews(page.items);
        setHasNextPage(page.has_next_page);
        hasLoadedBeyondFirstPage.current = false;
        if (showLoading) {
          setError(null);
        }
      } catch (err) {
        if (showLoading) {
          setError(getApiErrorMessage(err, t, "home.loadError"));
        }
      } finally {
        if (showLoading) {
          setLoadingReviews(false);
        }
      }
    },
    [token, t],
  );

  const loadMore = useCallback(async () => {
    if (!token || loadingMore || !hasNextPage) return;

    setLoadingMore(true);
    try {
      const page = await getReviews(token, {
        offset: reviews.length,
        limit: REVIEWS_PAGE_SIZE,
        orderBy: "-created_at",
      });
      setReviews((current) => [...current, ...page.items]);
      setHasNextPage(page.has_next_page);
      hasLoadedBeyondFirstPage.current = true;
    } catch (err) {
      setError(getApiErrorMessage(err, t, "home.loadError"));
    } finally {
      setLoadingMore(false);
    }
  }, [token, loadingMore, hasNextPage, reviews.length, t]);

  useEffect(() => {
    if (!token || feedTab !== "general") {
      return;
    }

    void loadFeed({ showLoading: true });

    const intervalId = window.setInterval(() => {
      if (!hasLoadedBeyondFirstPage.current) {
        void loadFeed();
      }
    }, FEED_POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [token, feedTab, loadFeed]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || feedTab !== "general" || loadingReviews) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [feedTab, loadingReviews, loadMore, hasNextPage]);

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
          ) : (
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
                <>
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
                  <div ref={loadMoreRef} className="flex justify-center py-md">
                    {loadingMore && (
                      <p className="text-body-md text-on-surface-variant">
                        {t("common.loading")}
                      </p>
                    )}
                  </div>
                </>
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
          )}
        </section>
      </main>
    </PageTransition>
  );
}
