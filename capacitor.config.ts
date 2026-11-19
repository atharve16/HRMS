/// <reference types="@capacitor/app" />
/// <reference types="@capacitor/status-bar" />

import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl = "https://hrms-three-delta.vercel.app";

const config: CapacitorConfig = {
  appId: "com.peopleflow.hrms",
  appName: "HRMS",
  webDir: "www",
  server: {
    // Stage 1 intentionally loads the deployed Next.js application instead of
    // exporting it. This preserves server rewrites and the backend cookie flow.
    url: productionUrl,
    hostname: "hrms-three-delta.vercel.app",
    androidScheme: "https",
    cleartext: false,
    allowNavigation: ["hrms-three-delta.vercel.app"],
  },
  plugins: {
    App: {
      // Stage 1 owns back navigation in CapacitorRuntime so the history/root
      // behavior is consistent instead of competing with the default handler.
      disableBackButtonHandler: true,
    },
    StatusBar: {
      // Android 15/16 enforce edge-to-edge and ignore these two legacy layout
      // options. They remain useful for Android 14 and older devices; CSS
      // safe-area insets handle the enforced edge-to-edge path.
      overlaysWebView: false,
      style: "DEFAULT",
      backgroundColor: "#f7f8fa",
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 500,
      backgroundColor: "#f7f8fa",
      showSpinner: false,
    },
  },
};

export default config;
