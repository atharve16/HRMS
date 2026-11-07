"use client";

import { Download, MoreHorizontal, PlusSquare, Share } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const INSTALL_DISMISSED_KEY = "hrms:pwa-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    iosStandalone ||
    document.referrer.startsWith("android-app://")
  );
}

function wasDismissed() {
  try {
    return window.localStorage.getItem(INSTALL_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
  } catch {
    // Private browsing can disable storage; the in-memory state still applies.
  }
}

export function InstallAppButton() {
  const [environment, setEnvironment] = useState<{
    ios: boolean;
    installed: boolean;
    dismissed: boolean;
  } | null>(null);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [iosInstructionsOpen, setIosInstructionsOpen] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

    const initialization = window.setTimeout(() => {
      setEnvironment({
        ios: isIosDevice,
        installed: isStandalone(),
        dismissed: wasDismissed(),
      });
    }, 0);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setEnvironment((current) => (current ? { ...current, installed: true } : current));
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.clearTimeout(initialization);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (
    !environment ||
    environment.installed ||
    environment.dismissed ||
    (!environment.ios && !deferredPrompt)
  ) {
    return null;
  }

  const isIos = environment.ios;

  async function handleInstall() {
    if (isIos) {
      setIosInstructionsOpen(true);
      return;
    }

    if (!deferredPrompt) return;

    const prompt = deferredPrompt;
    setDeferredPrompt(null);
    await prompt.prompt();

    const { outcome } = await prompt.userChoice;
    if (outcome === "dismissed") {
      rememberDismissal();
      setEnvironment((current) => (current ? { ...current, dismissed: true } : current));
    }
  }

  return (
    <>
      <Button
        aria-label="Install HRMS app"
        className="gap-2 px-2 sm:px-3"
        onClick={handleInstall}
        size="sm"
        variant="outline"
      >
        <Download aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">Install app</span>
      </Button>

      <AlertDialog open={iosInstructionsOpen} onOpenChange={setIosInstructionsOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogTitle>Install HRMS on your iPhone</AlertDialogTitle>
          <AlertDialogDescription>
            Add HRMS to your Home Screen for a full-screen app experience.
          </AlertDialogDescription>
          <ol className="mt-5 space-y-4 text-sm text-foreground">
            <li className="flex items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary">
                1
              </span>
              <span className="pt-1">
                Open this page in <strong>Safari</strong>, then tap the Share button.
              </span>
              <Share aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" />
            </li>
            <li className="flex items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary">
                2
              </span>
              <span className="pt-1">Choose <strong>Add to Home Screen</strong>.</span>
              <PlusSquare aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" />
            </li>
            <li className="flex items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary">
                3
              </span>
              <span className="pt-1">Tap <strong>Add</strong> to finish.</span>
              <MoreHorizontal aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" />
            </li>
          </ol>
          <AlertDialogClose asChild>
            <Button className="mt-6 w-full" variant="default">Got it</Button>
          </AlertDialogClose>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
