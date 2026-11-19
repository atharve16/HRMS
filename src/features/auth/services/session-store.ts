import type {
  AuthenticatedUser,
  AuthenticationResponse,
  AuthSession,
} from "@/features/auth/types/auth";

type SessionListener = (session: AuthSession | null) => void;

const SESSION_META_KEY = "hrms_session_meta";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1_000; // 2,592,000,000 ms

export type SessionMetadata = {
  user: AuthenticatedUser;
  establishedAt: number;
  sessionExpiresAt: number;
};

let session: AuthSession | null = null;
const listeners = new Set<SessionListener>();

function publish() {
  listeners.forEach((listener) => listener(session));
}

function readStoredMetadata(): SessionMetadata | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_META_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionMetadata;
    if (parsed && typeof parsed.sessionExpiresAt === "number") {
      if (Date.now() < parsed.sessionExpiresAt) {
        return parsed;
      }
      window.localStorage.removeItem(SESSION_META_KEY);
    }
    return null;
  } catch {
    return null;
  }
}

function writeStoredMetadata(user: AuthenticatedUser, existingSessionExpiresAt?: number) {
  if (typeof window === "undefined") return;
  try {
    const now = Date.now();
    const meta: SessionMetadata = {
      user,
      establishedAt: now,
      sessionExpiresAt: existingSessionExpiresAt && existingSessionExpiresAt > now
        ? existingSessionExpiresAt
        : now + THIRTY_DAYS_MS,
    };
    window.localStorage.setItem(SESSION_META_KEY, JSON.stringify(meta));
  } catch {
    // Ignore storage quota or permission errors
  }
}

function clearStoredMetadata() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_META_KEY);
  } catch {
    // Ignore
  }
}

export const sessionStore = {
  getSnapshot() {
    return session;
  },

  getAccessToken() {
    return session?.accessToken;
  },

  getSessionMetadata(): SessionMetadata | null {
    return readStoredMetadata();
  },

  isSessionExpected(): boolean {
    const meta = readStoredMetadata();
    return Boolean(meta && Date.now() < meta.sessionExpiresAt);
  },

  establish(response: AuthenticationResponse) {
    const existingMeta = readStoredMetadata();
    session = {
      accessToken: response.accessToken,
      expiresAt: Date.now() + response.expiresInSeconds * 1_000,
      user: response.user,
    };
    writeStoredMetadata(response.user, existingMeta?.sessionExpiresAt);
    publish();
    return session;
  },

  clear() {
    session = null;
    clearStoredMetadata();
    publish();
  },

  subscribe(listener: SessionListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
