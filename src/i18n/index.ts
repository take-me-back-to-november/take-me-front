import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getStoredLocale } from "@/lib/locale";
import enUS from "./locales/en-US.json";
import ptBR from "./locales/pt-BR.json";

export async function initI18n() {
  const storedLocale = await getStoredLocale();

  await i18n.use(initReactI18next).init({
    resources: {
      "pt-BR": { translation: ptBR },
      "en-US": { translation: enUS },
    },
    lng: storedLocale,
    fallbackLng: "en-US",
    interpolation: { escapeValue: false },
  });

  document.documentElement.lang = storedLocale.startsWith("pt") ? "pt-BR" : "en-US";
}

export default i18n;
