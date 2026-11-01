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
  const [session, setSession] = useState<AuthSession | null>(
    sessionStore.getSnapshot(),
  );
  const [restoring, setRestoring] = useState(true);
  const [restorationError, setRestorationError] = useState<unknown>(null);
  const [restorationAttempt, setRestorationAttempt] = useState(0);

  useEffect(
    () =>
      sessionStore.subscribe((nextSession) => {
        setSession(nextSession);
        if (!nextSession) queryClient.clear();
      }),
    [queryClient],
  );

  useEffect(() => {
    let active = true;

    refreshSession()
      .catch((error: unknown) => {
        if (active) setRestorationError(error);
      })
      .finally(() => {
        if (active) setRestoring(false);
      });

    return () => {
      active = false;
    };
  }, [restorationAttempt]);

  const establishSession = useCallback((response: AuthenticationResponse) => {
    queryClient.clear();
    sessionStore.establish(response);
    setRestorationError(null);
    setRestoring(false);
  }, [queryClient]);

  const logout = useCallback(async () => {
    try {
      if (sessionStore.getAccessToken()) await requestLogout();
    } finally {
      sessionStore.clear();
      queryClient.clear();
    }
  }, [queryClient]);

  const retryRestoration = useCallback(() => {
    setRestoring(true);
    setRestorationError(null);
    setRestorationAttempt((attempt) => attempt + 1);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status: restoring
        ? "loading"
        : session
          ? "authenticated"
          : "unauthenticated",
      session,
      restorationError,
      establishSession,
      logout,
      retryRestoration,
    }),
    [establishSession, logout, restorationError, restoring, retryRestoration, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
