import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MobileOnlyGate } from "@/components/MobileOnlyGate";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { useDocumentLang } from "@/hooks/useDocumentLang";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SearchPage } from "@/pages/SearchPage";
import { SignInPage } from "@/pages/SignInPage";
import { SplashPage } from "@/pages/SplashPage";
import { WriteReviewPage } from "@/pages/WriteReviewPage";

function AppRoutes() {
  useDocumentLang();

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/review" element={<SearchPage />} />
            <Route path="/search" element={<Navigate to="/review" replace />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/write" element={<WriteReviewPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MobileOnlyGate>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MobileOnlyGate>
    </BrowserRouter>
  );
}
