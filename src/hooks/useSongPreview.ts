import { useCallback, useSyncExternalStore } from "react";
import { getSongPreview } from "@/api/spotify";

type PreviewState = {
  playingSongId: string | null;
  loadingSongId: string | null;
};

let playingSongId: string | null = null;
let loadingSongId: string | null = null;
let audio: HTMLAudioElement | null = null;
const previewCache = new Map<string, string>();
const listeners = new Set<() => void>();

let snapshot: PreviewState = {
  playingSongId: null,
  loadingSongId: null,
};

function syncSnapshot() {
  if (
    snapshot.playingSongId === playingSongId &&
    snapshot.loadingSongId === loadingSongId
  ) {
    return;
  }

  snapshot = { playingSongId, loadingSongId };
}

function emit() {
  syncSnapshot();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): PreviewState {
  return snapshot;
}

function stopPlayback() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio = null;
  }
  playingSongId = null;
  emit();
}

async function startPlayback(songId: string, previewUrl: string) {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio = null;
  }

  const player = new Audio(previewUrl);
  audio = player;
  playingSongId = songId;

  player.addEventListener("ended", () => {
    if (playingSongId === songId) {
      stopPlayback();
    }
  });

  player.addEventListener("error", () => {
    if (playingSongId === songId) {
      stopPlayback();
    }
  });

  emit();

  try {
    await player.play();
  } catch {
    stopPlayback();
  }
}

export function useSongPreview(token: string | null) {
  const { playingSongId: activeSongId, loadingSongId: activeLoadingId } =
    useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const togglePreview = useCallback(
    async (songId: string) => {
      if (!token) return;

      if (playingSongId === songId) {
        stopPlayback();
        return;
      }

      if (loadingSongId) return;

      let previewUrl = previewCache.get(songId);

      if (!previewUrl) {
        loadingSongId = songId;
        emit();

        try {
          const response = await getSongPreview(token, songId);
          previewUrl = response.preview_url;
          previewCache.set(songId, previewUrl);
        } catch {
          return;
        } finally {
          loadingSongId = null;
          emit();
        }
      }

      await startPlayback(songId, previewUrl);
    },
    [token],
  );

  return {
    playingSongId: activeSongId,
    loadingSongId: activeLoadingId,
    togglePreview,
  };
}
