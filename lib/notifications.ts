import type { Session } from "./types";

export type PermissionState = "default" | "granted" | "denied" | "unsupported";

/** setTimeout n'accepte pas un délai > ~24,8 jours ; on plafonne (les étapes proches seront replanifiées au reload). */
const MAX_DELAY = 2_147_483_647;

let timers: ReturnType<typeof setTimeout>[] = [];

export function notificationsSupportees(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

export function permissionActuelle(): PermissionState {
  if (!notificationsSupportees()) return "unsupported";
  return Notification.permission as PermissionState;
}

/** Détecte iOS hors mode installé (PWA), cas où les notifications ne fonctionnent pas. */
export function estIOSNonInstalle(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && (navigator as { maxTouchPoints?: number }).maxTouchPoints! > 1);
  const standalone =
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    (navigator as { standalone?: boolean }).standalone === true;
  return isIOS && !standalone;
}

export async function enregistrerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

export async function demanderPermission(): Promise<PermissionState> {
  if (!notificationsSupportees()) return "unsupported";
  try {
    const result = await Notification.requestPermission();
    return result as PermissionState;
  } catch {
    return "denied";
  }
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  return (await navigator.serviceWorker.getRegistration()) ?? (await enregistrerServiceWorker());
}

async function montrerNotification(titre: string, corps: string): Promise<void> {
  const reg = await getRegistration();
  const options: NotificationOptions = {
    body: corps,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "pizza-etape",
    data: { url: "/" },
  };
  if (reg) {
    await reg.showNotification(titre, options);
  } else if (permissionActuelle() === "granted") {
    new Notification(titre, options);
  }
}

export function annulerNotifications(): void {
  timers.forEach((t) => clearTimeout(t));
  timers = [];
}

/**
 * Planifie une notification au début de chaque étape future via setTimeout.
 * Replanifiable à volonté (annule d'abord les timers existants).
 */
export function planifierNotifications(session: Session): void {
  annulerNotifications();
  if (permissionActuelle() !== "granted") return;

  const now = Date.now();
  for (const etape of session.etapes) {
    const debut = new Date(etape.debut).getTime();
    const delai = debut - now;
    if (delai <= 0 || delai > MAX_DELAY) continue;
    const titre = etape.nom;
    const corps = `${etape.action} — ${etape.dureeLabel} • ${etape.temperature}`;
    const timer = setTimeout(() => {
      void montrerNotification(titre, corps);
    }, delai);
    timers.push(timer);
  }
}
