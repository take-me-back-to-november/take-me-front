import { CachedAvatar } from "@/components/CachedAvatar";
import { Icon } from "@/components/Icon";
import { layout, typography } from "@/lib/designSystem";
import { cn } from "@/lib/cn";

interface CardAuthorHeaderProps {
  name: string;
  avatarUrl?: string;
  timestamp: string;
  timestampDateTime: string;
  avatarSize?: "sm" | "md";
  className?: string;
}

const avatarSizes = {
  sm: "h-7 w-7",
  md: "h-8 w-8",
} as const;

export function CardAuthorHeader({
  name,
  avatarUrl,
  timestamp,
  timestampDateTime,
  avatarSize = "md",
  className,
}: CardAuthorHeaderProps) {
  return (
    <div className={cn(layout.cardAuthorRow, className)}>
      <div
        className={cn(
          "shrink-0 overflow-hidden rounded-full bg-surface-container-high",
          avatarSizes[avatarSize],
        )}
      >
        <CachedAvatar
          src={avatarUrl}
          alt={name}
          className="h-full w-full object-cover"
          fallback={
            <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
              <Icon name="person" size="sm" />
            </div>
          }
        />
      </div>
      <div className={layout.cardAuthorMeta}>
        <span className={typography.cardAuthor}>{name}</span>
        <time className={typography.cardTimestamp} dateTime={timestampDateTime}>
          {timestamp}
        </time>
      </div>
    </div>
  );
}
