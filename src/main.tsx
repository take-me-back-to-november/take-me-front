import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initI18n } from "./i18n";
import { migrateLegacyStorage } from "./lib/persistence";
import "./index.css";

async function bootstrap() {
  await migrateLegacyStorage();
  await initI18n();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
