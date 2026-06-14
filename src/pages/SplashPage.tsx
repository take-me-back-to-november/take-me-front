import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/Logo";
import { PageTransition } from "@/components/PageTransition";
import { SoundbarLoader } from "@/components/SoundbarLoader";
import { useAuth } from "@/context/AuthContext";

export function SplashPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token, spotifyConnected, isLoading } = useAuth();
  const [visible, setVisible] = useState({ logo: false, tagline: false, loader: false });

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisible((v) => ({ ...v, logo: true })), 100),
      setTimeout(() => setVisible((v) => ({ ...v, tagline: true })), 600),
      setTimeout(() => setVisible((v) => ({ ...v, loader: true })), 1100),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (!token) {
        navigate("/sign-in", { replace: true });
      } else if (!spotifyConnected) {
        navigate("/connect-spotify", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [isLoading, token, spotifyConnected, navigate]);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background">
      <div className="ambient-glow pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-container opacity-15 blur-[40px]" />

      <PageTransition className="relative z-10 flex h-dvh w-full max-w-[1440px] flex-col items-center justify-center px-container-margin">
        <div className="mb-xl flex flex-col items-center">
          <Logo
            size="lg"
            className={`mb-md transition-opacity duration-1000 ease-out ${
              visible.logo ? "opacity-100" : "opacity-0"
            }`}
            alt={t("common.logoAlt")}
          />
          <p
            className={`text-body-lg tracking-wide text-on-surface-variant transition-opacity duration-1000 ease-out delay-500 ${
              visible.tagline ? "opacity-100" : "opacity-0"
            }`}
          >
            {t("splash.tagline")}
          </p>
        </div>

        <div
          className={`absolute bottom-xl transition-opacity duration-1000 ease-out ${
            visible.loader ? "opacity-100" : "opacity-0"
          }`}
        >
          <SoundbarLoader size="lg" label={t("common.loading")} />
        </div>
      </PageTransition>
    </div>
  );
}
