import { Icon } from "./Icon";

type SearchResultKind = "track" | "album";

interface SearchResultCoverProps {
  kind: SearchResultKind;
  src: string;
  alt: string;
  dimOnHover?: boolean;
}

const kindConfig = {
  track: {
    shape: "rounded-md",
    icon: "music_note",
  },
  album: {
    shape: "rounded-sm",
    icon: "album",
  },
} as const;

export function SearchResultCover({
  kind,
  src,
  alt,
  dimOnHover = false,
}: SearchResultCoverProps) {
  const config = kindConfig[kind];

  return (
    <div
      className={`relative h-[56px] w-[56px] flex-shrink-0 overflow-hidden ${config.shape} bg-surface-variant`}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      {dimOnHover && (
        <div className="absolute inset-0 bg-black/20 transition-default group-hover:bg-black/0" />
      )}
      <div
        className={`pointer-events-none absolute right-0.5 bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full shadow-sm ${
          kind === "album"
            ? "bg-surface-container-highest/95 text-on-surface-variant"
            : "bg-primary/90 text-on-primary"
        }`}
        aria-hidden="true"
      >
        <Icon name={config.icon} size="sm" filled={kind === "track"} />
      </div>
    </div>
  );
}
