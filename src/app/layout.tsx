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
  title: {
    default: "PeopleFlow HRMS",
    template: "%s | PeopleFlow HRMS",
  },
  description: "A responsive frontend foundation for human resource management.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f7f8fa",
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
