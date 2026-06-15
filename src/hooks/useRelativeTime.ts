import { useTranslation } from "react-i18next";

export function useRelativeTime(dateString: string) {
  const { t } = useTranslation();
  const date = new Date(dateString);
  const diffMs = Math.max(0, Date.now() - date.getTime());
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMinutes < 1) return t("reviewCard.publishedJust");
  if (diffMinutes < 60) return t("reviewCard.publishedMinutes", { count: diffMinutes });
  if (diffHours < 24) return t("reviewCard.publishedHours", { count: diffHours });
  if (diffDays < 30) return t("reviewCard.publishedDays", { count: diffDays });
  if (diffDays < 365) return t("reviewCard.publishedMonths", { count: diffMonths });
  return t("reviewCard.publishedYears", { count: diffYears });
}
