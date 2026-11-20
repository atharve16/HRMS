import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";

import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { CapacitorRuntime } from "@/components/capacitor/capacitor-runtime";

import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "HRMS",
  title: {
    default: "HRMS",
    template: "%s | HRMS",
  },
  description: "HRMS human resource management system.",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/icons/hrms-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/icons/hrms-apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "HRMS",
    statusBarStyle: "default",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#315fc5",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <CapacitorRuntime />
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
