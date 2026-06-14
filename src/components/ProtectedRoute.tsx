import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SoundbarLoader } from "@/components/SoundbarLoader";
import { useAuth } from "@/context/AuthContext";
import { consumeSpotifyLinkSuccess, isSpotifyLinkPending } from "@/lib/spotifyLink";

interface ProtectedRouteProps {
  requireSpotify?: boolean;
}

export function ProtectedRoute({ requireSpotify = false }: ProtectedRouteProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { token, isLoading, spotifyConnected, markSpotifyConnected } = useAuth();

  const spotifyLinkPendingOnHome =
    location.pathname === "/home" && isSpotifyLinkPending();

  useEffect(() => {
    if (location.pathname !== "/home") return;
    if (!consumeSpotifyLinkSuccess()) return;
    void markSpotifyConnected();
  }, [location.pathname, markSpotifyConnected]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <SoundbarLoader size="lg" label={t("common.loading")} />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/sign-in" replace />;
  }

  const isSpotifyReady = spotifyConnected || spotifyLinkPendingOnHome;

  if (requireSpotify && !isSpotifyReady) {
    return <Navigate to="/connect-spotify" replace />;
  }

  return <Outlet />;
}
