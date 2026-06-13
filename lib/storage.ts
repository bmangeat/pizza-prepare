import type { AdminConfig, Session } from "./types";

const SESSION_KEY = "pizza_session";
const ADMIN_KEY = "pizza_admin_config";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function read<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / mode privé : on ignore silencieusement */
  }
}

function remove(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function loadSession(): Session | null {
  return read<Session>(SESSION_KEY);
}

export function saveSession(session: Session): void {
  write(SESSION_KEY, session);
}

export function clearSession(): void {
  remove(SESSION_KEY);
}

export function loadAdminConfigRaw(): Partial<AdminConfig> | null {
  return read<Partial<AdminConfig>>(ADMIN_KEY);
}

export function saveAdminConfig(config: AdminConfig): void {
  write(ADMIN_KEY, config);
}

export function clearAdminConfig(): void {
  remove(ADMIN_KEY);
}
