import { useTranslation } from "react-i18next";
import { Icon } from "./Icon";
import { useSongPreview } from "@/hooks/useSongPreview";
import { useAuth } from "@/context/AuthContext";

type SongPreviewPlayButtonSize = "sm" | "lg";

interface SongPreviewPlayButtonProps {
  songId: string;
  size?: SongPreviewPlayButtonSize;
  className?: string;
}

const sizeConfig = {
  sm: {
    button: "h-8 w-8",
    icon: "sm" as const,
    loader: "h-3 w-3",
  },
  lg: {
    button: "h-14 w-14",
    icon: "lg" as const,
    loader: "h-5 w-5",
  },
} as const;

export function SongPreviewPlayButton({
  songId,
  size = "sm",
  className = "",
}: SongPreviewPlayButtonProps) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { playingSongId, loadingSongId, togglePreview } = useSongPreview(token);
  const config = sizeConfig[size];
  const isPlaying = playingSongId === songId;
  const isLoading = loadingSongId === songId;
  const isAlwaysVisible = size === "lg";

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void togglePreview(songId);
      }}
      aria-label={
        isPlaying ? t("songPreview.pause") : t("songPreview.play")
      }
      className={`absolute inset-0 z-10 flex items-center justify-center transition-default ${
        isPlaying || isLoading || isAlwaysVisible
          ? "bg-black/35 opacity-100"
          : "bg-black/0 opacity-0 group-hover:bg-black/35 group-hover:opacity-100"
      } ${className}`}
    >
      <span
        className={`flex items-center justify-center rounded-full bg-surface/95 text-on-surface shadow-md transition-default ${config.button}`}
      >
        {isLoading ? (
          <span
            className={`inline-block animate-spin rounded-full border-2 border-on-surface/20 border-t-primary ${config.loader}`}
            aria-hidden="true"
          />
        ) : (
          <Icon
            name={isPlaying ? "pause" : "play_arrow"}
            size={config.icon}
            filled
            className={isPlaying ? "" : "ml-0.5"}
          />
        )}
      </span>
    </button>
  );
}
