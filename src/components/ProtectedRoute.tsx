import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SoundbarLoader } from "@/components/SoundbarLoader";
import { useAuth } from "@/context/AuthContext";
import { isSpotifyLinkPending } from "@/lib/spotifyLink";

interface ProtectedRouteProps {
  requireSpotify?: boolean;
}

export function ProtectedRoute({ requireSpotify = false }: ProtectedRouteProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { token, isLoading, spotifyConnected } = useAuth();
  const [spotifyLinkPending, setSpotifyLinkPending] = useState(false);
  const [spotifyPendingResolved, setSpotifyPendingResolved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolveSpotifyPending() {
      const pending = await isSpotifyLinkPending();
      if (cancelled) return;
      setSpotifyLinkPending(pending);
      setSpotifyPendingResolved(true);
    }

    setSpotifyPendingResolved(false);
    void resolveSpotifyPending();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (isLoading || !spotifyPendingResolved) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <SoundbarLoader size="lg" label={t("common.loading")} />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  const spotifyLinkPendingOnHome =
    location.pathname === "/home" && spotifyLinkPending;
  const isSpotifyReady = spotifyConnected || spotifyLinkPendingOnHome;

  if (requireSpotify && !isSpotifyReady) {
    return <Navigate to="/connect-spotify" replace />;
  }

  return <Outlet />;
}
