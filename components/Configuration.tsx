"use client";

import { useMemo, useState } from "react";
import type { AdminConfig, Protocole, Session } from "@/lib/types";
import { creerSession } from "@/lib/schedule";
import {
  demanderPermission,
  estIOSNonInstalle,
  notificationsSupportees,
  permissionActuelle,
  type PermissionState,
} from "@/lib/notifications";
import { formatJourHeure, toDatetimeLocal } from "@/lib/format";
import { Banner, Button, Card } from "./ui";

function defautService(protocole: Protocole): string {
  // Heure de service par défaut : aujourd'hui/demain à 19h selon le temps nécessaire.
  const d = new Date();
  const lead = protocole === "48h" ? 2 : 1;
  d.setDate(d.getDate() + lead);
  d.setHours(19, 0, 0, 0);
  return toDatetimeLocal(d);
}

export default function Configuration({
  config,
  onAnnuler,
  onLancer,
}: {
  config: AdminConfig;
  onAnnuler: () => void;
  onLancer: (session: Session, permission: PermissionState) => void;
}) {
  const [protocole, setProtocole] = useState<Protocole>("48h");
  const [nbPizzas, setNbPizzas] = useState(6);
  const [heureService, setHeureService] = useState<string>(() => defautService("48h"));
  const [busy, setBusy] = useState(false);

  const apercu = useMemo(() => {
    const t = new Date(heureService);
    if (Number.isNaN(t.getTime())) return null;
    const s = creerSession(protocole, nbPizzas, t, config);
    const debut = s.etapes[0].debut;
    const dejaPasse = new Date(debut).getTime() < Date.now();
    return { debut, dejaPasse };
  }, [protocole, nbPizzas, heureService, config]);

  function changerProtocole(p: Protocole) {
    setProtocole(p);
    setHeureService(defautService(p));
  }

  async function lancer() {
    const t = new Date(heureService);
    if (Number.isNaN(t.getTime())) return;
    setBusy(true);
    let perm = permissionActuelle();
    if (perm === "default") perm = await demanderPermission();
    const session = creerSession(protocole, nbPizzas, t, config);
    onLancer(session, perm);
  }

  const iosWarn = estIOSNonInstalle();
  const supportees = notificationsSupportees();

  return (
    <div className="flex flex-1 flex-col gap-5 px-5 pb-8 pt-6 safe-bottom">
      <header className="flex items-center gap-3">
        <button onClick={onAnnuler} className="text-2xl text-charcoal/50" aria-label="Retour">
          ←
        </button>
        <h1 className="text-xl font-bold text-tomatoDark">Nouvelle préparation</h1>
      </header>

      <Card>
        <label className="mb-2 block text-sm font-semibold text-charcoal/70">Protocole</label>
        <div className="grid grid-cols-2 gap-3">
          {(["48h", "24h"] as Protocole[]).map((p) => (
            <button
              key={p}
              onClick={() => changerProtocole(p)}
              className={`rounded-2xl border-2 px-4 py-3 text-center font-semibold transition ${
                protocole === p
                  ? "border-tomato bg-tomato/10 text-tomatoDark"
                  : "border-black/10 text-charcoal/60"
              }`}
            >
              {p === "48h" ? "48 heures" : "24 heures"}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <label htmlFor="service" className="mb-2 block text-sm font-semibold text-charcoal/70">
          Heure de service (dégustation)
        </label>
        <input
          id="service"
          type="datetime-local"
          value={heureService}
          onChange={(e) => setHeureService(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base"
        />
      </Card>

      <Card>
        <label className="mb-3 block text-sm font-semibold text-charcoal/70">
          Nombre de pizzas
        </label>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setNbPizzas((n) => Math.max(1, n - 1))}
            className="h-12 w-12 rounded-full bg-tomato/10 text-2xl font-bold text-tomato"
            aria-label="Moins"
          >
            −
          </button>
          <span className="text-4xl font-bold tabular-nums">{nbPizzas}</span>
          <button
            onClick={() => setNbPizzas((n) => Math.min(30, n + 1))}
            className="h-12 w-12 rounded-full bg-tomato/10 text-2xl font-bold text-tomato"
            aria-label="Plus"
          >
            +
          </button>
        </div>
      </Card>

      {apercu && (
        <Banner tone={apercu.dejaPasse ? "warn" : "info"}>
          {apercu.dejaPasse ? (
            <>
              ⚠️ La 1re étape devrait commencer le <strong>{formatJourHeure(apercu.debut)}</strong>,
              déjà passé. Choisissez une heure de service plus tardive.
            </>
          ) : (
            <>
              Démarrage de la préparation : <strong>{formatJourHeure(apercu.debut)}</strong>
            </>
          )}
        </Banner>
      )}

      {!supportees && (
        <Banner tone="warn">
          Ce navigateur ne supporte pas les notifications. Vous suivrez les étapes via les rappels
          dans l&apos;application.
        </Banner>
      )}
      {supportees && iosWarn && (
        <Banner tone="warn">
          Sur iPhone, installez l&apos;app sur l&apos;écran d&apos;accueil (Partager → « Sur
          l&apos;écran d&apos;accueil ») pour activer les notifications.
        </Banner>
      )}
      {supportees && (
        <p className="px-1 text-xs text-charcoal/50">
          Au lancement, l&apos;application demandera l&apos;autorisation d&apos;envoyer des
          notifications pour vous prévenir au début de chaque étape.
        </p>
      )}

      <div className="mt-auto">
        <Button
          onClick={lancer}
          disabled={busy || !apercu || apercu.dejaPasse}
          className="w-full text-lg"
        >
          {busy ? "Lancement…" : "Lancer la préparation"}
        </Button>
      </div>
    </div>
  );
}
