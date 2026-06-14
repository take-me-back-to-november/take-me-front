import { Icon } from "./Icon";
import { SearchResultCover } from "./SearchResultCover";
import type { SpotifySong } from "@/types/api";

interface SongPickListItemProps {
  song: SpotifySong;
  index?: number;
  onSelect: (song: SpotifySong) => void;
}

export function SongPickListItem({ song, index = 0, onSelect }: SongPickListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(song)}
      className="group flex w-full animate-stagger items-center gap-md rounded-lg p-sm text-left transition-default hover:bg-surface-container-high"
      style={{ animationDelay: `${Math.min(index, 5) * 50}ms` }}
    >
      <SearchResultCover
        kind="track"
        src={song.cover_url}
        alt={song.title}
        dimOnHover
      />
      <div className="flex min-w-0 flex-grow flex-col justify-center">
        <h3 className="truncate text-body-lg text-on-surface transition-default group-hover:text-primary">
          {song.title}
        </h3>
        <div className="mt-xs flex items-center gap-xs text-body-md text-on-surface-variant">
          {song.explicit && <Icon name="explicit" size="sm" filled />}
          <span className="truncate">{song.artist}</span>
          <span className="opacity-50">•</span>
          <span className="truncate">{song.album_title}</span>
        </div>
      </div>
      <Icon
        name="chevron_right"
        size="md"
        className="shrink-0 text-on-surface-variant/60"
      />
    </button>
  );
}
