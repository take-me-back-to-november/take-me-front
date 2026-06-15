import { useTranslation } from "react-i18next";

export type FeedTab = "general" | "following";

interface FeedSwitcherProps {
  value: FeedTab;
  onChange: (tab: FeedTab) => void;
}

const TABS: FeedTab[] = ["general", "following"];

export function FeedSwitcher({ value, onChange }: FeedSwitcherProps) {
  const { t } = useTranslation();
  const activeIndex = TABS.indexOf(value);

  const labels: Record<FeedTab, string> = {
    general: t("home.feedGeneral"),
    following: t("home.feedFollowing"),
  };

  return (
    <div
      className="grid h-11 min-w-[200px] grid-cols-2 rounded-full border border-outline-variant/30 bg-surface-container-high p-xs"
      role="tablist"
      aria-label={t("home.recentReviews")}
    >
      <span
        aria-hidden="true"
        className="lang-switch-pill pointer-events-none col-start-1 row-start-1 h-full w-full rounded-full bg-primary shadow-[0_0_12px_rgba(83,224,118,0.25)]"
        style={{ gridColumnStart: activeIndex + 1 }}
      />
      {TABS.map((tab, index) => {
        const isActive = value === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            style={{ gridColumnStart: index + 1, gridRowStart: 1 }}
            className={`lang-switch-label relative z-10 flex h-full min-h-0 items-center justify-center rounded-full px-md text-body-md font-semibold leading-none active:scale-95 ${
              isActive
                ? "text-on-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {labels[tab]}
          </button>
        );
      })}
    </div>
  );
}
