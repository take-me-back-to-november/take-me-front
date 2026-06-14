import { useTranslation } from "react-i18next";
import { SearchResultCover } from "@/components/SearchResultCover";
import type { SpotifyAlbum } from "@/types/api";

interface AlbumPickListItemProps {
  album: SpotifyAlbum;
  index?: number;
}

export function AlbumPickListItem({ album, index = 0 }: AlbumPickListItemProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex w-full animate-stagger items-center gap-md rounded-lg p-sm text-left opacity-90"
      style={{ animationDelay: `${Math.min(index, 5) * 50}ms` }}
    >
      <SearchResultCover kind="album" src={album.cover_url} alt={album.title} />
      <div className="flex min-w-0 flex-grow flex-col justify-center">
        <h3 className="truncate text-body-lg text-on-surface">{album.title}</h3>
        <div className="mt-xs flex items-center gap-xs text-body-md text-on-surface-variant">
          <span className="truncate">{album.artist}</span>
          <span className="opacity-50">•</span>
          <span className="truncate">
            {t("search.trackCount", { count: album.total_tracks })}
          </span>
        </div>
      </div>
    </div>
  );
}
