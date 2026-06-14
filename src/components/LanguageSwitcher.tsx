import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { setStoredLocale, type AppLocale } from "@/lib/locale";

const LOCALES: { code: AppLocale; label: string }[] = [
  { code: "pt-BR", label: "PT" },
  { code: "en-US", label: "EN" },
];

interface LanguageSwitcherProps {
  size?: "sm" | "md";
  className?: string;
}

export function LanguageSwitcher({ size = "md", className = "" }: LanguageSwitcherProps) {
  const { t, i18n: i18nInstance } = useTranslation();
  const current = i18nInstance.language as AppLocale;
  const activeIndex = Math.max(
    0,
    LOCALES.findIndex(({ code }) => code === current),
  );

  const handleChange = async (locale: AppLocale) => {
    if (locale === current) return;
    await setStoredLocale(locale);
    await i18n.changeLanguage(locale);
  };

  const sizeClasses =
    size === "sm"
      ? "h-9 min-w-[88px] text-label-md"
      : "h-11 min-w-[120px] text-body-md";

  return (
    <div
      className={`grid grid-cols-2 rounded-full border border-outline-variant/30 bg-surface-container-high p-xs ${sizeClasses} ${className}`.trim()}
      role="group"
      aria-label={t("profile.language")}
    >
      <span
        aria-hidden="true"
        className="lang-switch-pill pointer-events-none col-start-1 row-start-1 h-full w-full rounded-full bg-primary shadow-[0_0_12px_rgba(83,224,118,0.25)]"
        style={{ gridColumnStart: activeIndex + 1 }}
      />
      {LOCALES.map(({ code, label }, index) => {
        const isActive = current === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => void handleChange(code)}
            aria-pressed={isActive}
            style={{ gridColumnStart: index + 1, gridRowStart: 1 }}
            className={`lang-switch-label relative z-10 flex h-full min-h-0 items-center justify-center rounded-full font-semibold leading-none active:scale-95 ${
              isActive
                ? "text-on-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="inline-flex w-[2ch] justify-center">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
