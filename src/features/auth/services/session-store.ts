import type {
  AuthenticationResponse,
  AuthSession,
} from "@/features/auth/types/auth";

type SessionListener = (session: AuthSession | null) => void;

let session: AuthSession | null = null;
let revision = 0;
const listeners = new Set<SessionListener>();

function publish() {
  listeners.forEach((listener) => listener(session));
}

export const sessionStore = {
  getSnapshot() {
    return session;
  },

  getAccessToken() {
    return session?.accessToken;
  },

  getRevision() {
    return revision;
  },

  establish(response: AuthenticationResponse) {
    revision += 1;
    session = {
      accessToken: response.accessToken,
      expiresAt: Date.now() + response.expiresInSeconds * 1_000,
      user: response.user,
    };
    publish();
    return session;
  },

  clear() {
    revision += 1;
    session = null;
    publish();
  },

  invalidatePendingRefreshes() {
    // Invalidate in-flight responses without clearing the current session or
    // touching the HTTP-only refresh cookie.
    revision += 1;
  },

  subscribe(listener: SessionListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
