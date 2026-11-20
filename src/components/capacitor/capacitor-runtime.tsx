"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor, SystemBars, SystemBarsStyle } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

function isExternalHttpUrl(href: string) {
  try {
    const url = new URL(href, window.location.href);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.origin !== window.location.origin
    );
  } catch {
    return false;
  }
}

/**
 * Small native-only bridge. The Android app receives an explicit platform
 * marker so its navigation layout does not depend on WebView viewport width.
 */
export function CapacitorRuntime() {
  useEffect(() => {
    const isAndroidApp =
      Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

    if (isAndroidApp) {
      document.documentElement.classList.add("capacitor-android");
    }

    if (!Capacitor.isNativePlatform()) return;

    let disposed = false;
    let removeBackButtonListener: (() => void) | undefined;

    const configureSystemBars = async () => {
      try {
        await SystemBars.setStyle({ style: SystemBarsStyle.Default });
        await StatusBar.setStyle({ style: Style.Default });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[Capacitor] Unable to configure system bars", error);
        }
      }
    };

    void configureSystemBars();

    const setupBackButton = async () => {
      const listener = await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack && window.history.length > 1) {
          window.history.back();
        } else {
          void App.exitApp();
        }
      });

      if (disposed) {
        void listener.remove();
      } else {
        removeBackButtonListener = () => void listener.remove();
      }
    };

    void setupBackButton();

    const handleExternalLink = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isExternalHttpUrl(anchor.href)) return;

      event.preventDefault();
      void Browser.open({ url: anchor.href });
    };

    document.addEventListener("click", handleExternalLink, true);

    return () => {
      disposed = true;
      removeBackButtonListener?.();
      document.removeEventListener("click", handleExternalLink, true);
      document.documentElement.classList.remove("capacitor-android");
    };
  }, []);

  return null;
}
