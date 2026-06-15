import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";

export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useAuth();

  const handleGoHome = () => {
    if (!token) {
      navigate("/sign-in", { replace: true });
      return;
    }
    navigate("/home", { replace: true });
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-container-margin">
      <Logo size="md" className="mb-lg" alt={t("common.logoAlt")} />
      <h1 className="text-headline-lg-mobile text-on-surface">{t("notFound.title")}</h1>
      <p className="mt-sm max-w-content-sm text-center text-body-md text-on-surface-variant">
        {t("notFound.description")}
      </p>
      <div className="mt-xl flex flex-col gap-sm">
        <Button onClick={handleGoHome}>{t("notFound.goHome")}</Button>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          {t("notFound.goBack")}
        </Button>
      </div>
    </div>
  );
}
