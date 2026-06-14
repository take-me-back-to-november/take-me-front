import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.takeme.app",
  appName: "Take Me",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#0e150e",
      showSpinner: false,
    },
  },
};

export default config;
