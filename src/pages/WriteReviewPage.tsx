import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getApiErrorMessage } from "@/api/getApiErrorMessage";
import { createReview, getReviews } from "@/api/reviews";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { PageTransition } from "@/components/PageTransition";
import { ReviewCard } from "@/components/ReviewCard";
import { SpotifyConnectPrompt } from "@/components/SpotifyConnectPrompt";
import { StarRating } from "@/components/StarRating";
import { useAuth } from "@/context/AuthContext";
import { addMyReviewId } from "@/lib/myReviews";
import type { SongReview, SpotifySong } from "@/types/api";

const MAX_LENGTH = 1000;

type SubmitState = "idle" | "submitting" | "success";

export function WriteReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { token, spotifyConnected } = useAuth();
  const song = (location.state as { song?: SpotifySong } | null)?.song;

  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [comments, setComments] = useState<SongReview[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);

  const isSubmitting = submitState === "submitting";
  const canSubmit = stars >= 1 && text.trim().length > 0 && submitState === "idle";

  useEffect(() => {
    if (!token || !song) {
      setLoadingComments(false);
      return;
    }

    async function loadComments() {
      setLoadingComments(true);
      setCommentsError(null);
      try {
        const reviews = await getReviews(token!, 0, 20, "-created_at", song!.id);
        setComments(reviews);
      } catch (err) {
        setCommentsError(getApiErrorMessage(err, t, "writeReview.commentsError"));
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    }

    void loadComments();
  }, [token, song, t]);

  if (!song) {
    return (
      <PageTransition className="flex min-h-[calc(100dvh-100px)] flex-col items-center justify-center px-container-margin text-center">
        <Icon name="music_off" size="xl" className="mb-md text-surface-variant" />
        <h2 className="mb-sm text-headline-md text-on-surface">
          {t("writeReview.pickTrackFirst")}
        </h2>
        <p className="mb-lg text-body-md text-on-surface-variant">
          {t("writeReview.pickTrackHint")}
        </p>
        <Button onClick={() => navigate("/review")}>{t("writeReview.goToSearch")}</Button>
      </PageTransition>
    );
  }

  const handleSubmit = async () => {
    if (!token || !canSubmit) return;
    setSubmitState("submitting");
    setError(null);
    try {
      const review = await createReview(token, {
        text: text.trim(),
        stars_count: stars,
        spotify_song_id: song.id,
      });
      await addMyReviewId(review.id);
      setSubmitState("success");
      await new Promise((resolve) => setTimeout(resolve, 550));
      navigate("/home", { replace: true });
    } catch (err) {
      setSubmitState("idle");
      setError(getApiErrorMessage(err, t, "writeReview.postError"));
    }
  };

  const fabClassName = [
    "fab-publish safe-bottom",
    isSubmitting ? "is-submitting" : "",
    submitState === "success" ? "is-success" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="relative flex min-h-[calc(100dvh-100px)] flex-col bg-surface text-on-surface selection:bg-primary/30 selection:text-primary">
      <header className="pointer-events-none fixed top-0 z-50 flex w-full items-center justify-between px-container-margin py-md">
        <button
          type="button"
          aria-label={t("common.close")}
          onClick={() => navigate(-1)}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high/50 text-on-surface backdrop-blur-md transition-default hover:bg-surface-container-highest"
        >
          <Icon name="close" size="lg" />
        </button>
      </header>

      <PageTransition className="mx-auto flex w-full max-w-3xl flex-grow flex-col pb-28">
        <section className="relative flex w-full flex-col justify-end pt-16 md:pt-20">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-surface via-surface/85 to-surface/40" />
            <img
              src={song.cover_url}
              alt=""
              className="h-full w-full scale-110 object-cover opacity-40 blur-xl"
            />
          </div>

          <div className="relative z-20 flex w-full flex-col items-center gap-lg px-container-margin pb-lg pt-8">
            <div className="relative h-44 w-44 flex-shrink-0 overflow-hidden rounded-lg shadow-2xl md:h-52 md:w-52">
              <img
                src={song.cover_url}
                alt={song.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col text-center">
              <h1 className="mb-xs text-headline-lg-mobile tracking-tight text-on-surface md:text-headline-lg">
                {song.title}
              </h1>
              <h2 className="mb-sm text-headline-md text-primary">{song.artist}</h2>
              <div className="flex items-center justify-center gap-sm text-body-md text-on-surface-variant">
                <span>{song.album_title}</span>
                <span className="h-1 w-1 rounded-full bg-on-surface-variant/50" />
                <span>{song.year}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex flex-col gap-xl px-container-margin">
          {spotifyConnected ? (
            <>
              <div className="flex flex-col items-center gap-md">
                <label className="text-label-md tracking-widest text-on-surface-variant uppercase">
                  {t("writeReview.rateTrack")}
                </label>
                <StarRating value={stars} interactive size={36} onChange={setStars} />
              </div>

              <div className="flex flex-col gap-sm">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
                  placeholder={t("writeReview.placeholder")}
                  className="min-h-[180px] w-full resize-y rounded-lg border-none bg-surface-container-high p-md text-body-lg text-on-surface placeholder:text-on-surface-variant/50 transition-default focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <div className="flex items-center justify-end text-label-sm text-on-surface-variant">
                  <span className={text.length >= MAX_LENGTH ? "text-error" : ""}>
                    {text.length}
                  </span>
                  <span>/{MAX_LENGTH}</span>
                </div>
              </div>

              {error && <p className="text-body-md text-error">{error}</p>}
            </>
          ) : (
            <SpotifyConnectPrompt variant="inline" />
          )}
        </section>

        <section className="mt-xl flex flex-col gap-md px-container-margin">
          <h2 className="text-headline-md text-on-surface">{t("writeReview.comments")}</h2>

          {loadingComments ? (
            <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-md">
              <div className="mb-sm flex items-center gap-sm">
                <div className="h-8 w-8 rounded-full shimmer" />
                <div className="flex flex-col gap-unit">
                  <div className="h-3 w-24 rounded shimmer" />
                  <div className="h-2 w-16 rounded shimmer" />
                </div>
              </div>
              <div className="h-16 rounded shimmer" />
            </div>
          ) : commentsError ? (
            <p className="text-body-md text-error">{commentsError}</p>
          ) : comments.length > 0 ? (
            <div className="flex flex-col gap-md">
              {comments.map((review, index) => (
                <div
                  key={review.id}
                  className="animate-stagger"
                  style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body-md text-on-surface-variant">
              {t("writeReview.noComments")}
            </p>
          )}
        </section>
      </PageTransition>

      {spotifyConnected && (
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          className={fabClassName}
          aria-label={t("writeReview.postReview")}
        >
          {submitState === "success" ? (
            <span className="fab-publish-icon">
              <Icon name="check" size="lg" filled className="leading-none" />
            </span>
          ) : isSubmitting ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
          ) : (
            <span className="fab-publish-icon fab-publish-icon--send">
              <Icon name="send" size="lg" filled className="leading-none" />
            </span>
          )}
        </button>
      )}
    </div>
  );
}
