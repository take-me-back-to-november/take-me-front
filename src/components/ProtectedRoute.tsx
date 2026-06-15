import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SoundbarLoader } from "@/components/SoundbarLoader";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute() {
  const { t } = useTranslation();
  const location = useLocation();
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <SoundbarLoader size="lg" label={t("common.loading")} />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
