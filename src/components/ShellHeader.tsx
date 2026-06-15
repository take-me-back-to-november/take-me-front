import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { PageHeader } from "./PageHeader";
import { useAuth } from "@/context/AuthContext";

export function ShellHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!showLogoutConfirm) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showLogoutConfirm]);

  const handleSignOut = async () => {
    setShowLogoutConfirm(false);
    await signOut();
    navigate("/sign-in", { replace: true });
  };

  const isProfile = pathname === "/profile";

  return (
    <>
      <PageHeader
        showLogo
        logoAlt={t("common.logoAlt")}
        action={
          isProfile ? (
            <button
              type="button"
              aria-label={t("common.signOut")}
              onClick={() => setShowLogoutConfirm(true)}
              className="rounded-full p-2 transition-default hover:bg-secondary-container/50 active:scale-95"
            >
              <Icon name="logout" size="lg" />
            </button>
          ) : undefined
        }
      />

      {showLogoutConfirm && (
        <div
          className="animate-modal-backdrop fixed inset-0 z-[80] flex items-center justify-center bg-black/55 px-md backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label={t("common.close")}
            onClick={() => setShowLogoutConfirm(false)}
          />

          <section className="animate-modal-card relative z-10 w-full max-w-content-sm rounded-[28px] border border-outline-variant/40 bg-surface-container px-lg py-lg text-center shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <div className="mx-auto mb-md flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
              <Icon name="logout" size="md" />
            </div>
            <h2 id="logout-confirm-title" className="text-headline-md text-on-surface">
              {t("common.signOutTitle")}
            </h2>
            <p className="mt-xs text-body-md text-on-surface-variant">
              {t("common.signOutDescription")}
            </p>

            <div className="mt-lg flex flex-col gap-sm">
              <Button onClick={() => setShowLogoutConfirm(false)} fullWidth>
                {t("common.stay")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => void handleSignOut()}
                fullWidth
                className="text-error hover:text-error"
              >
                {t("common.confirmSignOut")}
              </Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
