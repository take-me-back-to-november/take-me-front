import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useDocumentLang() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language.startsWith("pt")
      ? "pt-BR"
      : "en-US";
  }, [i18n.language]);
}
