import { SpotifyIcon } from "@/components/SpotifyIcon";

interface SpotifyLinkedBadgeProps {
  label: string;
  description: string;
}

export function SpotifyLinkedBadge({
  label,
  description,
}: SpotifyLinkedBadgeProps) {
  return (
    <div className="w-full rounded-xl border border-spotify/25 bg-spotify/5 px-md py-sm text-left">
      <div className="flex min-w-0 items-center gap-sm">
        <SpotifyIcon className="h-7 w-7 shrink-0" />

        <div className="min-w-0">
          <p className="truncate text-label-md text-spotify">
            {label}
          </p>
          <p className="mt-0.5 truncate text-label-sm text-on-surface-variant">
            {description}
          </p>
        </div>

        <svg
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          className="ml-auto h-5 w-5 shrink-0 text-spotify"
          aria-hidden="true"
        >
          <path
            d="m5.5 10.5 3 3 6-7"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
