import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";

export type SearchType = "tracks" | "albums";

interface SearchTypeSwitcherProps {
  value: SearchType;
  onChange: (type: SearchType) => void;
}

const TAB_ICONS: Record<SearchType, string> = {
  tracks: "music_note",
  albums: "album",
};

const TABS: SearchType[] = ["tracks", "albums"];

export function SearchTypeSwitcher({ value, onChange }: SearchTypeSwitcherProps) {
  const { t } = useTranslation();
  const activeIndex = TABS.indexOf(value);

  const labels: Record<SearchType, string> = {
    tracks: t("search.tabTracks"),
    albums: t("search.tabAlbums"),
  };

  return (
    <div
      className="relative grid h-11 min-w-[200px] grid-cols-2 rounded-full border border-outline-variant/30 bg-surface-container-high p-xs"
      role="tablist"
      aria-label={t("search.searchTypeLabel")}
    >
      <span
        aria-hidden="true"
        className="lang-switch-pill absolute top-xs bottom-xs left-xs w-[calc(50%-8px)] rounded-full bg-primary shadow-[0_0_12px_rgba(83,224,118,0.25)]"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {TABS.map((tab) => {
        const isActive = value === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            className={`lang-switch-label relative z-10 flex h-full items-center justify-center gap-xs rounded-full px-md text-body-md font-semibold active:scale-95 ${
              isActive
                ? "text-on-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Icon name={TAB_ICONS[tab]} size="sm" filled={isActive} />
            {labels[tab]}
          </button>
        );
      })}
    </div>
  );
}
