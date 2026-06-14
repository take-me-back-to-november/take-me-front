import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button";
import { SpotifyIcon } from "@/components/SpotifyIcon";

type SpotifyConnectPromptVariant = "banner" | "inline" | "profile";

interface SpotifyConnectPromptProps {
  variant?: SpotifyConnectPromptVariant;
}

export function SpotifyConnectPrompt({
  variant = "banner",
}: SpotifyConnectPromptProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleConnect = () => {
    navigate("/connect-spotify");
  };

  if (variant === "profile") {
    return (
      <section className="flex w-full flex-col gap-md rounded-xl border border-spotify/20 bg-surface-container-high/70 p-md">
        <div className="flex items-center gap-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-spotify/25 bg-spotify/10">
            <SpotifyIcon className="h-5 w-5" />
          </div>
          <p className="text-left text-body-md text-on-surface-variant">
            {t("spotifyGate.profileHint")}
          </p>
        </div>
        <Button onClick={handleConnect} fullWidth>
          {t("spotifyGate.cta")}
        </Button>
      </section>
    );
  }

  if (variant === "inline") {
    return (
      <section className="flex flex-col items-center gap-md rounded-xl border border-spotify/20 bg-surface-container-high/80 p-lg text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-spotify/25 bg-spotify/10">
          <SpotifyIcon className="h-8 w-8" />
        </div>
        <h2 className="text-headline-md text-on-surface">{t("spotifyGate.title")}</h2>
        <Button onClick={handleConnect} fullWidth>
          {t("spotifyGate.cta")}
        </Button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-md rounded-xl border border-spotify/20 bg-surface-container-high/70 p-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-md">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-spotify/25 bg-spotify/10">
          <SpotifyIcon className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-headline-md text-on-surface">{t("spotifyGate.title")}</h2>
          <p className="mt-xs text-body-md text-on-surface-variant">
            {t("spotifyGate.subtitle")}
          </p>
        </div>
      </div>
      <Button onClick={handleConnect} className="shrink-0 sm:min-w-[180px]">
        {t("spotifyGate.cta")}
      </Button>
    </section>
  );
}
