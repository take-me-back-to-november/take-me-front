import { useTranslation } from "react-i18next";

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}

export function StarRating({
  value,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex items-center gap-xs"
      role={interactive ? "group" : undefined}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const filled = value >= starValue;
        const half = !filled && value >= starValue - 0.5;
        const isActive = filled || half;

        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            className={`inline-flex items-center justify-center ${
              interactive
                ? "transition-default active:scale-90"
                : "pointer-events-none"
            }`}
            aria-label={t("reviewCard.star", { count: starValue })}
          >
            <span
              className={`material-symbols-outlined leading-none ${
                isActive ? "text-primary" : "text-on-surface-variant/35"
              }`}
              style={{
                fontSize: size,
                fontVariationSettings: isActive
                  ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                  : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
              }}
            >
              {half ? "star_half" : "star"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
