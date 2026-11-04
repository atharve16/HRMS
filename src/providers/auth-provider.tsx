"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { logout as requestLogout } from "@/features/auth/services/auth-service";
import { refreshSession } from "@/features/auth/services/refresh-session";
import { sessionStore } from "@/features/auth/services/session-store";
import type {
  AuthenticationResponse,
  AuthSession,
  AuthStatus,
} from "@/features/auth/types/auth";

type AuthContextValue = {
  status: AuthStatus;
  session: AuthSession | null;
  restorationError: unknown;
  establishSession: (response: AuthenticationResponse) => void;
  logout: () => Promise<void>;
  retryRestoration: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<AuthSession | null>(() =>
    sessionStore.getSnapshot(),
  );
  // If we already have a valid session in memory, we start with restoring = false
  const [restoring, setRestoring] = useState(() => !sessionStore.getAccessToken());
  const [restorationError, setRestorationError] = useState<unknown>(null);
  const [restorationAttempt, setRestorationAttempt] = useState(0);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[AuthProvider] Initialized. Initial session active:",
        Boolean(sessionStore.getAccessToken()),
      );
    }
  }, []);

  useEffect(
    () =>
      sessionStore.subscribe((nextSession) => {
        if (process.env.NODE_ENV !== "production") {
          console.log(
            "[AuthProvider] Session store updated. Role:",
            nextSession?.user.role ?? "none",
          );
        }
        setSession(nextSession);
        if (!nextSession) queryClient.clear();
      }),
    [queryClient],
  );

  useEffect(() => {
    let active = true;

    // If session is already present in memory on first mount, skip restoring
    if (sessionStore.getAccessToken() && restorationAttempt === 0) {
      setRestoring(false);
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[AuthProvider] Attempting session restoration (attempt ${restorationAttempt})`,
      );
    }

    refreshSession()
      .then((res) => {
        if (active) {
          if (process.env.NODE_ENV !== "production") {
            console.log(
              "[AuthProvider] Session successfully restored for role:",
              res.user.role,
            );
          }
          setRestorationError(null);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          if (process.env.NODE_ENV !== "production") {
            console.log("[AuthProvider] Session restoration failed");
          }
          setRestorationError(error);
        }
      })
      .finally(() => {
        if (active) {
          setRestoring(false);
        }
      });

    return () => {
      active = false;
    };
  }, [restorationAttempt]);

  const establishSession = useCallback(
    (response: AuthenticationResponse) => {
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "[AuthProvider] Session explicitly established for role:",
          response.user.role,
        );
      }
      queryClient.clear();
      sessionStore.establish(response);
      setRestorationError(null);
      setRestoring(false);
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[AuthProvider] Logout triggered");
    }
    try {
      if (sessionStore.getAccessToken()) await requestLogout();
    } finally {
      sessionStore.clear();
      queryClient.clear();
    }
  }, [queryClient]);

  const retryRestoration = useCallback(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[AuthProvider] Retrying session restoration");
    }
    setRestoring(true);
    setRestorationError(null);
    setRestorationAttempt((attempt) => attempt + 1);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const status: AuthStatus = restoring
      ? "loading"
      : session
        ? "authenticated"
        : "unauthenticated";

    return {
      status,
      session,
      restorationError,
      establishSession,
      logout,
      retryRestoration,
    };
  }, [establishSession, logout, restorationError, restoring, retryRestoration, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
