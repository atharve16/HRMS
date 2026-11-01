import type {
  AuthenticationResponse,
  AuthSession,
} from "@/features/auth/types/auth";

type SessionListener = (session: AuthSession | null) => void;

let session: AuthSession | null = null;
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

  establish(response: AuthenticationResponse) {
    session = {
      accessToken: response.accessToken,
      expiresAt: Date.now() + response.expiresInSeconds * 1_000,
      user: response.user,
    };
    publish();
    return session;
  },

  clear() {
    session = null;
    publish();
  },

  subscribe(listener: SessionListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
