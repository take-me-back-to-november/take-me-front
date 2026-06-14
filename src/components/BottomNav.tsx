import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "./Icon";

const tabs = [
  { to: "/home", icon: "home", labelKey: "nav.home" },
  {
    to: "/review",
    icon: "rate_review",
    labelKey: "nav.review",
    activePaths: ["/review", "/write"],
  },
  { to: "/profile", icon: "person", labelKey: "nav.profile" },
] as const;

export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-surface-container-high/50 bg-surface-container/95 px-md pt-sm safe-bottom backdrop-blur-lg">
      {tabs.map((tab) => {
        const isActive =
          "activePaths" in tab
            ? (tab.activePaths as readonly string[]).includes(location.pathname)
            : location.pathname === tab.to;

        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={`flex flex-col items-center justify-center transition-default active:scale-90 ${
              isActive
                ? "font-bold text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className={isActive ? "nav-icon-active" : ""}>
              <Icon
                name={tab.icon}
                size="md"
                filled={isActive}
                className={`mb-xs ${isActive ? "text-primary" : ""}`}
              />
            </span>
            <span className="text-label-sm">{t(tab.labelKey)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
