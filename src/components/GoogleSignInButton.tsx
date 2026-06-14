import { useRef } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { GoogleIcon } from "./GoogleIcon";

interface GoogleSignInButtonProps {
  onSuccess: (response: CredentialResponse) => void;
  onError?: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
  isSubmitting = false,
}: GoogleSignInButtonProps) {
  const { t } = useTranslation();
  const hiddenContainerRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    const googleBtn = hiddenContainerRef.current?.querySelector(
      'div[role="button"]',
    ) as HTMLElement | null;
    googleBtn?.click();
  };

  return (
    <div className="relative w-full">
      <div
        ref={hiddenContainerRef}
        className="pointer-events-none absolute -left-[9999px] h-10 w-[320px] overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError ?? (() => undefined)}
          theme="filled_black"
          shape="pill"
          size="large"
          text="signin_with"
          width="320"
        />
      </div>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isSubmitting}
        className="flex h-11 w-full items-center justify-center gap-sm rounded-full border border-outline-variant/40 bg-surface-container-high/40 px-md text-body-md text-on-surface transition-default hover:border-outline-variant hover:bg-surface-container-high active:scale-[0.99] focus:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
      >
        <GoogleIcon className="h-[18px] w-[18px] shrink-0" />
        <span className="truncate whitespace-nowrap">
          {isSubmitting ? t("signIn.signingIn") : t("signIn.signInWithGoogle")}
        </span>
      </button>
    </div>
  );
}
