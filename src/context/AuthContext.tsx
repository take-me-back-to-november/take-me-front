import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getSpotifyLoginUrl } from "@/api/auth";
import { refreshSessionIfNeeded, setAuthHandlers } from "@/api/client";
import { getCurrentUser } from "@/api/me";
import { getApiErrorMessage } from "@/api/getApiErrorMessage";
import i18n from "@/i18n";
import { prefetchProfilePicture } from "@/lib/profilePictureCache";
import {
  clearSession,
  getStoredUser,
  persistSession,
  persistUser,
} from "@/lib/storage";
import type { User } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  completeAuthFromCallback: (
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const resetSession = useCallback(async () => {
    await clearSession();
    setToken(null);
    setUser(null);
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
      const storedUser = await getStoredUser();
      const activeToken = await refreshSessionIfNeeded();

      setToken(activeToken);
      setUser(activeToken ? storedUser : null);
      prefetchProfilePicture(storedUser?.picture_url);

      if (!activeToken) {
        setIsLoading(false);
        return;
      }

      try {
        const freshUser = await getCurrentUser(activeToken);
        await persistUser(freshUser);
        setUser(freshUser);
        prefetchProfilePicture(freshUser.picture_url);
      } catch {
        // keep stored user if refresh fails
      } finally {
        setIsLoading(false);
      }
    }
    void hydrate();
  }, []);

  const signIn = useCallback(async () => {
    setAuthError(null);
    try {
      const { url } = await getSpotifyLoginUrl();
      window.location.href = url;
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        i18n.t.bind(i18n),
        "apiErrors.signInFailed",
      );
      setAuthError(message);
      throw error;
    }
  }, []);

  const completeAuthFromCallback = useCallback(
    async (accessToken: string, refreshToken: string) => {
      const currentUser = await getCurrentUser(accessToken);
      await persistSession(accessToken, refreshToken, currentUser);
      setToken(accessToken);
      setUser(currentUser);
      prefetchProfilePicture(currentUser.picture_url);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await resetSession();
  }, [resetSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      signIn,
      signOut,
      completeAuthFromCallback,
      authError,
      clearAuthError: () => setAuthError(null),
    }),
    [
      user,
      token,
      isLoading,
      signIn,
      signOut,
      completeAuthFromCallback,
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
