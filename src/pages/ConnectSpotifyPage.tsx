import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { useTranslation } from "react-i18next";
import { getSpotifyAuthUrl } from "@/api/auth";
import { getApiErrorMessage } from "@/api/getApiErrorMessage";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { SoundbarLoader } from "@/components/SoundbarLoader";
import { SpotifyIcon } from "@/components/SpotifyIcon";
import { useAuth } from "@/context/AuthContext";
import { useScreenReady } from "@/hooks/useScreenReady";
import { beginSpotifyLink } from "@/lib/spotifyLink";

function MusicNoteIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
      />
    </svg>
  );
}

export function ConnectSpotifyPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token, markSpotifyConnected } = useAuth();
  const ready = useScreenReady();
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [awaitingReturn, setAwaitingReturn] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !awaitingReturn) return;

    const listener = App.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) return;
      void Browser.close();
    });

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [awaitingReturn]);

  const openSpotifyAuth = async () => {
    if (!token) return;
    setError(null);
    setIsConnecting(true);
    try {
      const { url } = await getSpotifyAuthUrl(token);
      beginSpotifyLink();
      setAwaitingReturn(true);
      if (Capacitor.isNativePlatform()) {
        await Browser.open({ url });
      } else {
        window.location.href = url;
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t, "apiErrors.spotifyConnectionFailed"));
      setIsConnecting(false);
    }
  };

  const handleSkip = () => {
    void markSpotifyConnected();
    navigate("/home", { replace: true });
  };

  return (
    <div className="relative min-h-dvh bg-surface text-on-surface antialiased">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(29,185,84,0.06)_0%,rgba(14,21,14,0)_65%)]" />

      {!ready && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-surface"
          aria-hidden="true"
        >
          <SoundbarLoader size="md" />
        </div>
      )}

      <div
        className={`relative z-10 flex min-h-dvh flex-col transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
        aria-hidden={!ready}
      >
        <header className="px-container-margin py-md">
          <Logo size="sm" className="w-auto" alt={t("common.logoAlt")} />
        </header>

        <main className="mx-auto flex w-full max-w-content-md flex-1 flex-col px-container-margin pb-xl">
          <section className="flex flex-1 flex-col items-center pt-[6vh] text-center">
            <h1 className="min-h-[3.5rem] w-full max-w-content-sm text-headline-lg-mobile text-on-surface md:text-headline-lg">
              {t("connectSpotify.title")}
            </h1>
            <p className="mt-sm min-h-[4.5rem] max-w-content-sm text-body-lg text-on-surface-variant">
              {t("connectSpotify.subtitle")}
            </p>

            <div className="mt-xl w-full overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-high p-lg">
              <div className="flex flex-col items-center gap-lg">
                <div className="flex items-center justify-center gap-md">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-highest shadow-lg">
                    <MusicNoteIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex gap-xs">
                    <div className="h-1 w-1 rounded-full bg-outline-variant" />
                    <div className="h-1 w-1 rounded-full bg-outline-variant" />
                    <div className="h-1 w-1 rounded-full bg-outline-variant" />
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-spotify/25 bg-spotify/10 shadow-[0_0_24px_rgba(29,185,84,0.15)]">
                    <SpotifyIcon className="h-9 w-9" />
                  </div>
                </div>

                <Button
                  onClick={() => void openSpotifyAuth()}
                  disabled={isConnecting}
                  fullWidth
                  className="h-11 bg-primary-container text-on-primary-container hover:bg-primary-container/90"
                  icon={<Icon name="arrow_forward" size="sm" />}
                >
                  {isConnecting
                    ? t("connectSpotify.connecting")
                    : t("connectSpotify.connect")}
                </Button>

                <p className="min-h-[2.5rem] text-center text-label-sm leading-relaxed text-on-surface-variant/70">
                  {t("connectSpotify.privacy")}
                </p>
              </div>
            </div>

            <div className="mt-md min-h-[1.125rem]">
              {error && <p className="text-label-sm text-error">{error}</p>}
            </div>

            {awaitingReturn && (
              <Button
                variant="secondary"
                className="mt-md"
                onClick={async () => {
                  await markSpotifyConnected();
                  navigate("/home", { replace: true });
                }}
              >
                {t("connectSpotify.connected")}
              </Button>
            )}
          </section>

          <footer className="flex justify-center pt-lg">
            <Button variant="ghost" onClick={handleSkip}>
              {t("connectSpotify.notNow")}
            </Button>
          </footer>
        </main>
      </div>
    </div>
  );
}
