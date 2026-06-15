import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { SpotifyIcon } from "@/components/SpotifyIcon";
import { useAuth } from "@/context/AuthContext";

export function SignInPage() {
  const { t } = useTranslation();
  const { signIn, authError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signIn();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-dvh bg-background">
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-surface-container-high/30 to-background" />

      <main className="relative z-10 mx-auto grid min-h-dvh w-full max-w-content-md grid-rows-[1fr_auto] px-container-margin">
        <section className="flex flex-col items-center pt-[14vh]">
          <Logo size="lg" className="mb-xl" alt={t("common.logoAlt")} />

          <h1 className="flex min-h-[5.5rem] w-full max-w-[320px] items-center justify-center text-center text-headline-lg-mobile leading-snug text-balance text-on-background md:text-headline-lg">
            {t("signIn.title")}
          </h1>

          <div className="mt-xl flex w-full max-w-[320px] flex-col gap-md">
            <Button
              onClick={() => void handleSignIn()}
              disabled={isSubmitting}
              fullWidth
              className="h-11 bg-spotify text-black hover:bg-spotify/90"
              icon={<SpotifyIcon className="h-5 w-5" />}
            >
              {isSubmitting
                ? t("signIn.signingIn")
                : t("signIn.signInWithSpotify")}
            </Button>

            <div
              className="flex min-h-[1.125rem] items-center justify-center"
              aria-live="polite"
            >
              {authError && (
                <p className="text-center text-label-sm text-error">{authError}</p>
              )}
            </div>
          </div>
        </section>

        <footer className="pb-xl pt-lg">
          <p className="mx-auto flex min-h-[4rem] w-full max-w-[320px] items-center justify-center text-center text-label-sm leading-relaxed text-balance text-on-surface-variant opacity-80">
            {t("signIn.terms")}
          </p>
        </footer>
      </main>
    </div>
  );
}
