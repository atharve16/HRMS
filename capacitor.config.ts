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
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 500,
      backgroundColor: "#f7f8fa",
      showSpinner: false,
    },
  },
};

export default config;
