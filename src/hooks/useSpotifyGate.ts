import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function useSpotifyGate() {
  const navigate = useNavigate();
  const { spotifyConnected } = useAuth();

  const openConnectFlow = useCallback(() => {
    navigate("/connect-spotify");
  }, [navigate]);

  return {
    canInteract: spotifyConnected,
    openConnectFlow,
  };
}
