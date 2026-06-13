"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminConfig, EtapeCalculee, Session } from "@/lib/types";
import { DEFAULT_ADMIN_CONFIG, loadAdminConfig } from "@/lib/config";
import { clearSession, loadSession, saveSession } from "@/lib/storage";
import { validerEtape, withStatuts } from "@/lib/schedule";
import {
  annulerNotifications,
  enregistrerServiceWorker,
  permissionActuelle,
  planifierNotifications,
  type PermissionState,
} from "@/lib/notifications";
import Home from "./Home";
import Configuration from "./Configuration";
import Planning from "./Planning";
import Recipe from "./Recipe";
import Admin from "./Admin";
import NotificationOverlay from "./NotificationOverlay";

type Screen = "home" | "config" | "planning" | "recipe" | "admin";

export default function App() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [session, setSession] = useState<Session | null>(null);
  const [config, setConfig] = useState<AdminConfig>(DEFAULT_ADMIN_CONFIG);
  const [permission, setPermission] = useState<PermissionState>("default");
  const [now, setNow] = useState<Date>(() => new Date());
  const [overlay, setOverlay] = useState<EtapeCalculee | null>(null);

  const prevEtapeRef = useRef<number | null>(null);

  // Initialisation : config, session, service worker, permission.
  useEffect(() => {
    setConfig(loadAdminConfig());
    setPermission(permissionActuelle());
    void enregistrerServiceWorker();

    const stored = loadSession();
    if (stored) {
      const refreshed = withStatuts(stored, new Date());
      setSession(refreshed);
      prevEtapeRef.current = refreshed.etape_courante;
      setScreen("planning");
      if (permissionActuelle() === "granted") planifierNotifications(refreshed);
    }
    setReady(true);
  }, []);

  // Horloge globale (1 s).
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Recalcul des statuts à chaque tick + détection de changement d'étape (overlay in-app).
  useEffect(() => {
    if (!session) return;
    const refreshed = withStatuts(session, now);
    const changed = refreshed.etape_courante !== session.etape_courante;

    if (
      changed &&
      prevEtapeRef.current !== null &&
      refreshed.etape_courante > prevEtapeRef.current
    ) {
      const etape = refreshed.etapes[refreshed.etape_courante];
      if (etape && etape.statut === "current") setOverlay(etape);
    }

    if (changed) {
      prevEtapeRef.current = refreshed.etape_courante;
      setSession(refreshed);
      saveSession(refreshed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const lancerSession = useCallback((nouvelle: Session, perm: PermissionState) => {
    setSession(nouvelle);
    setPermission(perm);
    prevEtapeRef.current = nouvelle.etape_courante;
    saveSession(nouvelle);
    if (perm === "granted") planifierNotifications(nouvelle);
    setScreen("planning");
  }, []);

  const annulerSession = useCallback(() => {
    annulerNotifications();
    clearSession();
    setSession(null);
    prevEtapeRef.current = null;
    setOverlay(null);
    setScreen("home");
  }, []);

  const validerEtapeCourante = useCallback(() => {
    if (!session) return;
    const updated = validerEtape(session, session.etape_courante, new Date());
    prevEtapeRef.current = updated.etape_courante; // évite l'overlay (avance déclenchée par l'utilisateur)
    setSession(updated);
    saveSession(updated);
    if (permissionActuelle() === "granted") planifierNotifications(updated);
  }, [session]);

  const sauvegarderConfig = useCallback((c: AdminConfig) => {
    setConfig(c);
  }, []);

  if (!ready) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-charcoal/40">
        <span>Chargement…</span>
      </main>
    );
  }

  const sessionActive = session !== null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      {screen === "home" && (
        <Home
          onNouvelle={() => setScreen("config")}
          onAdmin={() => setScreen("admin")}
        />
      )}

      {screen === "config" && (
        <Configuration
          config={config}
          onAnnuler={() => setScreen("home")}
          onLancer={lancerSession}
        />
      )}

      {screen === "planning" && session && (
        <Planning
          session={withStatuts(session, now)}
          now={now}
          permission={permission}
          onRecette={() => setScreen("recipe")}
          onAnnuler={annulerSession}
          onAdmin={() => setScreen("admin")}
          onValider={validerEtapeCourante}
        />
      )}

      {screen === "recipe" && session && (
        <Recipe nbPizzas={session.nb_pizzas} onRetour={() => setScreen("planning")} />
      )}

      {screen === "admin" && (
        <Admin
          config={config}
          sessionActive={sessionActive}
          onRetour={() => setScreen(sessionActive ? "planning" : "home")}
          onSauvegarde={sauvegarderConfig}
        />
      )}

      {overlay && (
        <NotificationOverlay etape={overlay} onClose={() => setOverlay(null)} />
      )}
    </main>
  );
}
