import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";

import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";

import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "HRMS",
  title: {
    default: "PeopleFlow HRMS",
    template: "%s | PeopleFlow HRMS",
  },
  description: "A responsive frontend foundation for human resource management.",
  icons: {
    icon: "/icons/hrms-192.png",
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
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
