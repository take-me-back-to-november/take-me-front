import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppShell } from "@/components/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { useDocumentLang } from "@/hooks/useDocumentLang";
import { ConnectSpotifyPage } from "@/pages/ConnectSpotifyPage";
import { HomePage } from "@/pages/HomePage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SearchPage } from "@/pages/SearchPage";
import { SignInPage } from "@/pages/SignInPage";
import { SplashPage } from "@/pages/SplashPage";
import { WriteReviewPage } from "@/pages/WriteReviewPage";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function AppRoutes() {
  useDocumentLang();

  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/sign-in" element={<SignInPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/connect-spotify" element={<ConnectSpotifyPage />} />
        <Route element={<AppShell />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/review" element={<SearchPage />} />
          <Route path="/search" element={<Navigate to="/review" replace />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/write" element={<WriteReviewPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const content = (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );

  return (
    <BrowserRouter>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>
      ) : (
        content
      )}
    </BrowserRouter>
  );
}
