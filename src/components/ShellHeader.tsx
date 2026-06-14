import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "./Icon";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { PageHeader } from "./PageHeader";
import { useAuth } from "@/context/AuthContext";

export function ShellHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in", { replace: true });
  };

  const isProfile = pathname === "/profile";

  return (
    <PageHeader
      showLogo
      logoAlt={t("common.logoAlt")}
      leading={<LanguageSwitcher size="sm" />}
      action={
        isProfile ? (
          <button
            type="button"
            aria-label={t("common.signOut")}
            onClick={() => void handleSignOut()}
            className="rounded-full p-2 transition-default hover:bg-secondary-container/50 active:scale-95"
          >
            <Icon name="logout" size="lg" />
          </button>
        ) : undefined
      }
    />
  );
}
