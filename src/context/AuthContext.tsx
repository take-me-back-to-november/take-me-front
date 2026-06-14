import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { signInWithGoogle } from "@/api/auth";
import { refreshSessionIfNeeded, setAuthHandlers } from "@/api/client";
import { getUserStatus } from "@/api/me";
import { removeSpotifyLink } from "@/api/spotify";
import { getApiErrorMessage } from "@/api/getApiErrorMessage";
import i18n from "@/i18n";
import {
  clearSession,
  getSpotifyConnected,
  getStoredUser,
  persistSession,
  setSpotifyConnected,
} from "@/lib/storage";
import type { User } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  spotifyConnected: boolean;
  signIn: (googleIdToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  markSpotifyConnected: () => Promise<void>;
  refreshSpotifyStatus: () => Promise<void>;
  unlinkSpotify: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [spotifyConnected, setSpotifyConnectedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const resetSession = useCallback(async () => {
    await clearSession();
    setToken(null);
    setUser(null);
    setSpotifyConnectedState(false);
    setAuthError(null);
  }, []);

  useEffect(() => {
    setAuthHandlers({
      onTokenRefreshed: setToken,
      onSessionExpired: () => {
        void resetSession();
      },
    });

    return () => setAuthHandlers({});
  }, [resetSession]);

  useEffect(() => {
    async function hydrate() {
      const [storedUser, connected] = await Promise.all([
        getStoredUser(),
        getSpotifyConnected(),
      ]);

      const activeToken = await refreshSessionIfNeeded();

      setToken(activeToken);
      setUser(activeToken ? storedUser : null);

      if (!activeToken) {
        setSpotifyConnectedState(false);
        setIsLoading(false);
        return;
      }

      try {
        const status = await getUserStatus(activeToken);
        await setSpotifyConnected(status.spotify_connected);
        setSpotifyConnectedState(status.spotify_connected);
      } catch {
        setSpotifyConnectedState(connected);
      } finally {
        setIsLoading(false);
      }
    }
    void hydrate();
  }, []);

  const refreshSpotifyStatus = useCallback(async () => {
    if (!token) {
      setSpotifyConnectedState(false);
      return;
    }

    const status = await getUserStatus(token);
    await setSpotifyConnected(status.spotify_connected);
    setSpotifyConnectedState(status.spotify_connected);
  }, [token]);

  const unlinkSpotify = useCallback(async () => {
    if (!token) return;

    await removeSpotifyLink(token);
    await setSpotifyConnected(false);
    setSpotifyConnectedState(false);
  }, [token]);

  const signIn = useCallback(async (googleIdToken: string) => {
    setAuthError(null);
    try {
      const response = await signInWithGoogle(googleIdToken);
      await persistSession(
        response.access_token,
        response.refresh_token,
        response.user,
        false,
      );
      setToken(response.access_token);
      setUser(response.user);
      setSpotifyConnectedState(false);
    } catch (error) {
      const message = getApiErrorMessage(error, i18n.t.bind(i18n), "apiErrors.signInFailed");
      setAuthError(message);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    await resetSession();
  }, [resetSession]);

  const markSpotifyConnected = useCallback(async () => {
    await setSpotifyConnected(true);
    setSpotifyConnectedState(true);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      spotifyConnected,
      signIn,
      signOut,
      markSpotifyConnected,
      refreshSpotifyStatus,
      unlinkSpotify,
      authError,
      clearAuthError: () => setAuthError(null),
    }),
    [
      user,
      token,
      isLoading,
      spotifyConnected,
      signIn,
      signOut,
      markSpotifyConnected,
      refreshSpotifyStatus,
      unlinkSpotify,
      authError,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
