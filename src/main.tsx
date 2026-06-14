import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import App from "./App";
import { initI18n } from "./i18n";
import { migrateLegacyStorage } from "./lib/persistence";
import "./index.css";

async function initNative() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#0e150e" });
  } catch {
    // Status bar plugin may be unavailable in some environments
  }
}

async function bootstrap() {
  await migrateLegacyStorage();
  await Promise.all([initNative(), initI18n()]);

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
