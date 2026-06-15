import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/Logo";
import { SoundbarLoader } from "@/components/SoundbarLoader";
import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";

type CallbackStatus = "loading" | "error";

function parseAuthFragment(): { accessToken: string; refreshToken: string } | null {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { completeAuthFromCallback } = useAuth();
  const [status, setStatus] = useState<CallbackStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    async function complete() {
      const tokens = parseAuthFragment();
      if (!tokens) {
        if (!cancelled) setStatus("error");
        return;
      }

      try {
        await completeAuthFromCallback(tokens.accessToken, tokens.refreshToken);
        if (cancelled) return;
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/home", { replace: true });
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void complete();

    return () => {
      cancelled = true;
    };
  }, [completeAuthFromCallback, navigate]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-container-margin">
      <Logo size="sm" className="mb-xl" alt={t("common.logoAlt")} />

      {status === "loading" && (
        <SoundbarLoader size="lg" label={t("spotifyCallback.connecting")} />
      )}

      {status === "error" && (
        <div className="flex w-full max-w-content-sm flex-col items-center gap-md text-center">
          <p className="text-body-md text-error">{t("spotifyCallback.error")}</p>
          <Button onClick={() => navigate("/sign-in", { replace: true })}>
            {t("common.retry")}
          </Button>
        </div>
      )}
    </div>
  );
}
