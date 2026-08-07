"use client";

import { useEffect } from "react";

const REFRESH_LEAD_MS = 90_000;
const RETRY_DELAY_MS = 30_000;
const MIN_SCHEDULE_DELAY_MS = 5_000;
const STORAGE_KEY = "vasirono:company-session-refresh";
const LOCK_NAME = "vasirono-company-session-refresh";

type SharedRefreshState = {
  sessionId: number;
  expiresAt: number;
  updatedAt: number;
};

type LockManagerLike = {
  request<T>(name: string, callback: () => Promise<T>): Promise<T>;
};

export function SessionRefreshManager({
  sessionId,
  expiresAt,
}: {
  sessionId: number | null;
  expiresAt: string | null;
}) {
  useEffect(() => {
    const initialExpiration = parseExpiration(expiresAt);

    if (!sessionId || !initialExpiration) return;

    const activeSessionId = sessionId;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let currentExpiration = initialExpiration;
    let lastSharedUpdate = 0;

    const stored = readSharedState(activeSessionId);
    if (stored?.expiresAt && stored.expiresAt > currentExpiration) {
      currentExpiration = stored.expiresAt;
      lastSharedUpdate = stored.updatedAt;
    }

    function clearTimer() {
      if (timer) clearTimeout(timer);
      timer = null;
    }

    function schedule(delayOverride?: number) {
      if (disposed) return;

      clearTimer();
      const delay =
        delayOverride ??
        Math.max(
          MIN_SCHEDULE_DELAY_MS,
          currentExpiration - Date.now() - REFRESH_LEAD_MS,
        );

      timer = setTimeout(() => void refresh(), delay);
    }

    async function rotateSession() {
      const latest = readSharedState(activeSessionId);

      if (
        latest &&
        latest.updatedAt > lastSharedUpdate &&
        latest.expiresAt > Date.now() + REFRESH_LEAD_MS
      ) {
        currentExpiration = latest.expiresAt;
        lastSharedUpdate = latest.updatedAt;
        schedule();
        return;
      }

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);

      if (response.status === 401 || response.status === 403) {
        window.localStorage.removeItem(STORAGE_KEY);
        window.location.replace("/login?session=expired");
        return;
      }

      if (!response.ok || !payload?.success) {
        throw new Error("SESSION_REFRESH_FAILED");
      }

      const nextExpiration = parseExpiration(payload.data?.expiresAt);
      if (!nextExpiration) throw new Error("SESSION_REFRESH_INVALID_RESPONSE");

      currentExpiration = nextExpiration;
      lastSharedUpdate = Date.now();
      writeSharedState({
        sessionId: activeSessionId,
        expiresAt: currentExpiration,
        updatedAt: lastSharedUpdate,
      });
      schedule();
    }

    async function refresh() {
      if (disposed) return;

      try {
        const lockManager = (
          navigator as Navigator & { locks?: LockManagerLike }
        ).locks;

        if (lockManager) {
          await lockManager.request(LOCK_NAME, rotateSession);
        } else {
          await rotateSession();
        }
      } catch {
        schedule(RETRY_DELAY_MS);
      }
    }

    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || !event.newValue) return;

      const shared = parseSharedState(event.newValue);
      if (!shared || shared.sessionId !== activeSessionId) return;
      if (shared.expiresAt <= currentExpiration) return;

      currentExpiration = shared.expiresAt;
      lastSharedUpdate = shared.updatedAt;
      schedule();
    }

    function onVisibilityChange() {
      if (
        document.visibilityState === "visible" &&
        currentExpiration <= Date.now() + REFRESH_LEAD_MS
      ) {
        void refresh();
      }
    }

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibilityChange);
    schedule();

    return () => {
      disposed = true;
      clearTimer();
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [expiresAt, sessionId]);

  return null;
}

function parseExpiration(value: unknown): number | null {
  if (typeof value !== "string" || !value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readSharedState(sessionId: number): SharedRefreshState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? parseSharedState(raw) : null;
    return parsed?.sessionId === sessionId ? parsed : null;
  } catch {
    return null;
  }
}

function parseSharedState(raw: string): SharedRefreshState | null {
  try {
    const value = JSON.parse(raw) as Partial<SharedRefreshState>;
    if (
      !Number.isInteger(value.sessionId) ||
      !Number.isFinite(value.expiresAt) ||
      !Number.isFinite(value.updatedAt)
    ) {
      return null;
    }

    return value as SharedRefreshState;
  } catch {
    return null;
  }
}

function writeSharedState(state: SharedRefreshState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // La renovación sigue funcionando aunque el almacenamiento esté bloqueado.
  }
}
