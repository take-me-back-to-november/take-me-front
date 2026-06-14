import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "./Icon";
import type { SpotifySong } from "@/types/api";

interface TrackCarouselItemProps {
  song: SpotifySong;
}

export function TrackCarouselItem({ song }: TrackCarouselItemProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleReview = () => {
    navigate("/write", { state: { song } });
  };

  return (
    <div className="group flex w-[140px] flex-none flex-col gap-sm">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface-container-high">
        <img
          src={song.cover_url}
          alt={song.title}
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={handleReview}
          aria-label={t("trackCarousel.review")}
          className="absolute top-sm right-sm flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-default active:scale-90"
        >
          <Icon name="edit" size="sm" />
        </button>
        <button
          type="button"
          onClick={handleReview}
          className="absolute inset-x-0 bottom-0 flex items-end justify-center bg-gradient-to-t from-black/70 to-transparent p-sm opacity-100 transition-default md:opacity-0 md:group-hover:opacity-100"
        >
          <span className="rounded-full bg-primary px-md py-xs text-label-md text-on-primary">
            {t("trackCarousel.review")}
          </span>
        </button>
      </div>
      <button type="button" onClick={handleReview} className="text-left">
        <p className="truncate text-body-md text-on-surface">{song.title}</p>
        <p className="truncate text-label-sm text-on-surface-variant">{song.artist}</p>
      </button>
    </div>
  );
}
