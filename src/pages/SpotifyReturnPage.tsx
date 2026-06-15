import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getUserResume } from "@/api/me";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { SoundbarLoader } from "@/components/SoundbarLoader";
import { useAuth } from "@/context/AuthContext";
import { consumeSpotifyLinkSuccess } from "@/lib/spotifyLink";

type ReturnStatus = "loading" | "success" | "error";

export function SpotifyReturnPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token, markSpotifyConnected } = useAuth();
  const [status, setStatus] = useState<ReturnStatus>("loading");

  useEffect(() => {
    if (!token) {
      navigate("/sign-in", { replace: true });
      return;
    }

    let cancelled = false;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    async function complete() {
      if (!token) return;

      const hadPendingLink = await consumeSpotifyLinkSuccess();

      try {
        const resume = await getUserResume(token);
        if (!resume.spotify_connected && !hadPendingLink) {
          if (!cancelled) setStatus("error");
          return;
        }

        await markSpotifyConnected();
        if (cancelled) return;

        setStatus("success");
        redirectTimer = setTimeout(() => {
          navigate("/home", { replace: true });
        }, 700);
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void complete();

    return () => {
      cancelled = true;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [token, markSpotifyConnected, navigate]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-container-margin">
      <Logo size="sm" className="mb-xl" alt={t("common.logoAlt")} />

      {status === "loading" && (
        <SoundbarLoader size="lg" label={t("spotifyCallback.connecting")} />
      )}

      {status === "success" && (
        <p className="text-center text-body-md text-on-surface-variant">
          {t("spotifyCallback.connected")}
        </p>
      )}

      {status === "error" && (
        <div className="flex w-full max-w-content-sm flex-col items-center gap-md text-center">
          <p className="text-body-md text-error">{t("spotifyCallback.error")}</p>
          <Button onClick={() => navigate("/connect-spotify", { replace: true })}>
            {t("common.retry")}
          </Button>
        </div>
      )}
    </div>
  );
}
