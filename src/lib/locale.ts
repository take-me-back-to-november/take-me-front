import { getItem, setItem } from "@/lib/persistence";

export const LOCALE_KEY = "take_me_locale";
export const DEFAULT_LOCALE = "pt-BR";
export const SUPPORTED_LOCALES = ["pt-BR", "en-US"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export async function getStoredLocale(): Promise<AppLocale> {
  const raw = await getItem(LOCALE_KEY);

  if (raw && SUPPORTED_LOCALES.includes(raw as AppLocale)) {
    return raw as AppLocale;
  }
  return DEFAULT_LOCALE;
}

export async function setStoredLocale(locale: AppLocale): Promise<void> {
  await setItem(LOCALE_KEY, locale);
}
