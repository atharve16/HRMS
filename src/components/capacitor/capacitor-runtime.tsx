"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

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
 * Small native-only bridge for Stage 1. The web app remains the source of
 * truth for navigation, while Android handles system back and external URLs.
 */
export function CapacitorRuntime() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let disposed = false;
    let removeBackButtonListener: (() => void) | undefined;

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
    };
  }, []);

  return null;
}
