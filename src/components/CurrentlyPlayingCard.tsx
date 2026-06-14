import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getApiErrorMessage } from "@/api/getApiErrorMessage";
import { getCurrentlyPlayingSong } from "@/api/spotify";
import { Icon } from "./Icon";
import type { CurrentlyPlayingSong } from "@/types/api";

const POLL_INTERVAL_MS = 2_000;
const TICK_INTERVAL_MS = 1_000;
/** Ignore API progress slightly behind local tick (poll + network delay). */
const BEHIND_TOLERANCE_MS = 3_000;
/** Large backward gap means the user likely seeked on Spotify. */
const SEEK_BACK_THRESHOLD_MS = 6_000;

interface CurrentlyPlayingCardProps {
  token: string;
}

function clampProgress(ms: number, duration: number) {
  return Math.min(Math.max(0, ms), duration);
}

function mergePlaybackProgress(
  localProgress: number,
  apiProgress: number,
  isPlaying: boolean,
  duration: number,
  trackChanged: boolean,
) {
  const api = clampProgress(apiProgress, duration);
  const local = clampProgress(localProgress, duration);

  if (trackChanged || !isPlaying) {
    return api;
  }

  if (api >= local) {
    return api;
  }

  const behindBy = local - api;
  if (behindBy <= BEHIND_TOLERANCE_MS) {
    return local;
  }

  if (behindBy >= SEEK_BACK_THRESHOLD_MS) {
    return api;
  }

  return local;
}

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function CurrentlyPlayingCard({ token }: CurrentlyPlayingCardProps) {
  const { t } = useTranslation();
  const [song, setSong] = useState<CurrentlyPlayingSong | null>(null);
  const [localProgress, setLocalProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const songRef = useRef<CurrentlyPlayingSong | null>(null);

  useEffect(() => {
    songRef.current = song;
  }, [song]);

  useEffect(() => {
    let active = true;

    async function sync() {
      try {
        const current = await getCurrentlyPlayingSong(token);
        if (!active) return;

        const previous = songRef.current;
        const trackChanged = Boolean(current && previous?.id !== current.id);

        setSong(current);
        if (!current) {
          setLocalProgress(0);
        } else {
          setLocalProgress((local) =>
            mergePlaybackProgress(
              local,
              current.progress,
              current.is_playing,
              current.duration,
              trackChanged || !previous,
            ),
          );
        }
        setError(null);
      } catch (err) {
        if (!active) return;
        setSong(null);
        setLocalProgress(0);
        setError(getApiErrorMessage(err, t, "profile.nowPlayingError"));
      } finally {
        if (active) setLoading(false);
      }
    }

    void sync();
    const pollInterval = window.setInterval(() => void sync(), POLL_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(pollInterval);
    };
  }, [token, t]);

  useEffect(() => {
    const tickInterval = window.setInterval(() => {
      const current = songRef.current;
      if (!current?.is_playing) return;
      setLocalProgress((progress) => Math.min(progress + TICK_INTERVAL_MS, current.duration));
    }, TICK_INTERVAL_MS);

    return () => window.clearInterval(tickInterval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-md">
        <div className="flex items-center gap-md">
          <div className="h-14 w-14 shrink-0 rounded-lg shimmer" />
          <div className="flex flex-grow flex-col gap-xs">
            <div className="h-3 w-24 rounded shimmer" />
            <div className="h-4 w-40 rounded shimmer" />
            <div className="h-3 w-28 rounded shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-md">
        <p className="text-body-md text-error">{error}</p>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-high/50 p-md">
        <div className="flex items-center gap-md">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
            <Icon name="headphones" size="lg" />
          </div>
          <div>
            <p className="text-label-sm tracking-widest text-on-surface-variant uppercase">
              {t("profile.nowPlaying")}
            </p>
            <p className="mt-xs text-body-md text-on-surface-variant">
              {t("profile.nothingPlaying")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const progress = song.duration > 0 ? (localProgress / song.duration) * 100 : 0;

  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-md">
      <div className="mb-sm flex items-center justify-between gap-sm">
        <p className="text-label-sm tracking-widest text-on-surface-variant uppercase">
          {t("profile.nowPlaying")}
        </p>
        <span
          className={`inline-flex items-center gap-xs rounded-full px-sm py-xs text-label-sm ${
            song.is_playing
              ? "now-playing-badge--active bg-spotify/15 text-spotify"
              : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          {song.is_playing ? (
            <span className="now-playing-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          ) : (
            <Icon name="pause" size="sm" />
          )}
          {song.is_playing ? t("profile.playing") : t("profile.paused")}
        </span>
      </div>

      <div className="flex items-center gap-md">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-container-high">
          <img
            src={song.image_url}
            alt={song.album}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-grow">
          <p className="truncate text-body-lg text-on-surface">{song.name}</p>
          <p className="truncate text-body-md text-primary">{song.artist}</p>
          <p className="truncate text-label-sm text-on-surface-variant">{song.album}</p>
        </div>
      </div>

      <div className="mt-sm">
        <div className="h-1 overflow-hidden rounded-full bg-surface-container-high">
          <div
            className={`h-full rounded-full bg-spotify ${
              song.is_playing ? "transition-[width] duration-1000 linear" : ""
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="mt-xs flex justify-between text-label-sm text-on-surface-variant tabular-nums">
          <span>{formatTime(localProgress)}</span>
          <span>{formatTime(song.duration)}</span>
        </div>
      </div>
    </div>
  );
}
