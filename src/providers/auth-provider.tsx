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
import { isApiClientError } from "@/services/api-error";
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
    let autoRetryTimer: NodeJS.Timeout | undefined;

    // If session is already present in memory on first mount, skip restoring
    if (sessionStore.getAccessToken() && restorationAttempt === 0) {
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
          setRestoring(false);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        const isAuth401 = isApiClientError(error) && error.status === 401;
        // If it's a transient network/server failure during initial boot and first attempt,
        // wait 2.5s and retry once automatically to handle Render cold starts smoothly.
        if (!isAuth401 && restorationAttempt === 0) {
          if (process.env.NODE_ENV !== "production") {
            console.log("[AuthProvider] Transient failure on initial restore; auto-retrying in 2.5s...");
          }
          autoRetryTimer = setTimeout(() => {
            if (active) {
              setRestorationAttempt((prev) => prev + 1);
            }
          }, 2500);
          return;
        }

        if (process.env.NODE_ENV !== "production") {
          console.log("[AuthProvider] Session restoration failed", error);
        }
        setRestorationError(error);
        setRestoring(false);
      });

    return () => {
      active = false;
      if (autoRetryTimer) clearTimeout(autoRetryTimer);
    };
  }, [restorationAttempt]);

  // Proactive background refresh before access token expiration (15-min token policy)
  useEffect(() => {
    if (!session?.expiresAt) return;

    let retryTimer: NodeJS.Timeout | undefined;
    const timeUntilExpiry = session.expiresAt - Date.now();
    const refreshDelay =
      timeUntilExpiry > 60_000
        ? timeUntilExpiry - 60_000
        : Math.max(0, timeUntilExpiry - 5_000);

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[AuthProvider] Scheduled proactive session refresh in ${Math.round(refreshDelay / 1000)}s`,
      );
    }

    const timer = setTimeout(() => {
      if (process.env.NODE_ENV !== "production") {
        console.log("[AuthProvider] Executing proactive session refresh");
      }
      refreshSession().catch((error: unknown) => {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[AuthProvider] Proactive session refresh failed, relying on reactive interceptor:",
            error,
          );
        }
        // If not a confirmed 401, retry proactive refresh in 30 seconds
        if (!(isApiClientError(error) && error.status === 401)) {
          retryTimer = setTimeout(() => {
            refreshSession().catch(() => {});
          }, 30_000);
        }
      });
    }, refreshDelay);

    return () => {
      clearTimeout(timer);
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [session?.expiresAt]);

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
