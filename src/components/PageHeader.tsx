import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

interface PageHeaderProps {
  title?: string;
  showLogo?: boolean;
  leading?: ReactNode;
  action?: ReactNode;
  onBack?: () => void;
  logoAlt?: string;
}

const headerBaseClass =
  "page-header w-full px-container-margin py-md";

const headerIconSlotClass =
  "flex h-10 w-10 shrink-0 items-center justify-center";

const headerLeadingSlotClass =
  "flex shrink-0 items-center justify-start";

export function PageHeader({
  title,
  showLogo = false,
  leading,
  action,
  onBack,
  logoAlt = "Take Me Logo",
}: PageHeaderProps) {
  if (showLogo) {
    return (
      <header className={`${headerBaseClass} relative`}>
        <div className="flex items-center justify-between">
          <div className={onBack ? headerIconSlotClass : headerLeadingSlotClass}>
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="rounded-full p-1 transition-default hover:bg-surface-container-high active:scale-95"
                aria-label="Back"
              >
                <Icon name="arrow_back" size="lg" />
              </button>
            ) : (
              leading
            )}
          </div>
          <div className={headerIconSlotClass}>{action}</div>
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Logo
            size="sm"
            className="pointer-events-auto w-auto whitespace-nowrap"
            alt={logoAlt}
          />
        </div>
      </header>
    );
  }

  return (
    <header
      className={`${headerBaseClass} flex items-center justify-between`}
    >
      <div className="flex items-center gap-sm">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mr-xs rounded-full p-1 transition-default hover:bg-surface-container-high active:scale-95"
            aria-label="Back"
          >
            <Icon name="arrow_back" size="lg" />
          </button>
        )}
        {title && <span className="text-headline-md text-on-surface">{title}</span>}
      </div>
      {action}
    </header>
  );
}
