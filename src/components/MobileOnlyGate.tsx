import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/Logo";
import { SoundbarLoader } from "@/components/SoundbarLoader";
import { useIsMobileDevice } from "@/hooks/useIsMobileDevice";

interface MobileOnlyGateProps {
  children: ReactNode;
}

function DesktopBlockedScreen() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center overflow-y-auto bg-background px-container-margin py-xl">
      <div className="ambient-glow pointer-events-none absolute top-1/3 left-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-container opacity-10 blur-[48px]" />

      <div className="relative z-10 flex w-full max-w-content-md flex-col items-center">
        <Logo size="md" className="mb-lg" alt={t("common.logoAlt")} />

        <div className="w-full overflow-hidden rounded-xl border border-surface-container-high bg-surface-container-high/50 p-md">
          <img
            src="/gabriel_descobrindo_o_brasil.jpg"
            alt={t("mobileOnly.gabrielAlt")}
            className="mb-lg w-full max-h-[55vh] rounded-lg object-contain shadow-lg"
          />

          <h1 className="text-center text-headline-lg-mobile text-on-surface">
            {t("mobileOnly.title")}
          </h1>
          <p className="mt-sm text-center text-body-md leading-relaxed text-on-surface-variant">
            {t("mobileOnly.description")}
          </p>
          <p className="mt-md text-center text-label-sm normal-case tracking-wide text-primary">
            {t("mobileOnly.hint")}
          </p>
        </div>
      </div>
    </div>
  );
}

export function MobileOnlyGate({ children }: MobileOnlyGateProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobileDevice();

  if (isMobile === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <SoundbarLoader size="lg" label={t("common.loading")} />
      </div>
    );
  }

  if (!isMobile) {
    return <DesktopBlockedScreen />;
  }

  return children;
}
