"use client";

import { useState } from "react";
import type { Session } from "@/lib/types";
import type { PermissionState } from "@/lib/notifications";
import { formatCompteARebours, formatHeure, formatJour } from "@/lib/format";
import { Banner, Button, Card } from "./ui";

export default function Planning({
  session,
  now,
  permission,
  onRecette,
  onAnnuler,
  onAdmin,
}: {
  session: Session;
  now: Date;
  permission: PermissionState;
  onRecette: () => void;
  onAnnuler: () => void;
  onAdmin: () => void;
}) {
  const [confirmAnnuler, setConfirmAnnuler] = useState(false);

  const courante = session.etapes[session.etape_courante];
  const toutTermine = session.etapes.every((e) => e.statut === "done");
  const enCours = courante.statut === "current";
  // Avant le démarrage du planning, l'étape 1 est encore "à venir" : on décompte vers son début.
  const cible = enCours ? new Date(courante.fin).getTime() : new Date(courante.debut).getTime();
  const restant = cible - now.getTime();

  const labelProtocole = session.protocole === "48h" ? "48 heures" : "24 heures";

  return (
    <div className="flex flex-1 flex-col gap-4 px-5 pb-28 pt-6">
      <header>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-tomatoDark">Préparation {labelProtocole}</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-charcoal/50">
              {session.nb_pizzas} pizza{session.nb_pizzas > 1 ? "s" : ""}
            </span>
            <button
              onClick={onAdmin}
              aria-label="Paramètres"
              className="rounded-full p-1.5 text-xl text-charcoal/40 transition hover:bg-black/5"
            >
              ⚙️
            </button>
          </div>
        </div>
        <p className="text-sm text-charcoal/60">
          Service prévu : {formatJour(session.heure_service)} à {formatHeure(session.heure_service)}
        </p>
      </header>

      {permission === "denied" && (
        <Banner tone="warn">
          Notifications désactivées. Gardez l&apos;app ouverte : un rappel s&apos;affichera à chaque
          changement d&apos;étape.
        </Banner>
      )}

      {/* Étape en cours / fin */}
      {toutTermine ? (
        <Card className="border-2 border-basil/30 bg-basil/5 text-center">
          <div className="text-4xl">🎉</div>
          <p className="mt-2 text-lg font-bold text-basil">Préparation terminée !</p>
          <p className="text-sm text-charcoal/60">Votre pâte est prête à être travaillée.</p>
        </Card>
      ) : (
        <Card className="border-2 border-tomato/30 bg-tomato/5">
          <p className="text-xs font-semibold uppercase tracking-wide text-tomato">
            Étape {session.etape_courante + 1} / {session.etapes.length} ·{" "}
            {enCours ? "en cours" : "à venir"}
          </p>
          <p className="mt-1 text-2xl font-bold text-tomatoDark">{courante.nom}</p>
          <p className="mt-1 text-charcoal/70">{courante.action}</p>
          <div className="mt-3 flex items-center justify-between border-t border-tomato/10 pt-3">
            <span className="text-sm text-charcoal/60">🌡️ {courante.temperature}</span>
            <div className="text-right">
              <div className="text-xs text-charcoal/50">
                {enCours ? "se termine dans" : "commence dans"}
              </div>
              <div className="text-xl font-bold tabular-nums text-tomatoDark">
                {formatCompteARebours(restant)}
              </div>
            </div>
          </div>
          {courante.index === 0 && (
            <Button variant="secondary" onClick={onRecette} className="mt-3 w-full">
              Voir les instructions de pétrissage
            </Button>
          )}
        </Card>
      )}

      {/* Timeline */}
      <div className="flex flex-col">
        {session.etapes.map((e, i) => {
          const done = e.statut === "done";
          const current = e.statut === "current";
          const last = i === session.etapes.length - 1;
          return (
            <div key={e.index} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    done
                      ? "bg-basil text-white"
                      : current
                        ? "bg-tomato text-white ring-4 ring-tomato/20"
                        : "bg-black/10 text-charcoal/50"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </div>
                {!last && (
                  <div className={`w-0.5 flex-1 ${done ? "bg-basil/40" : "bg-black/10"}`} />
                )}
              </div>
              <div className={`pb-5 ${current ? "" : "opacity-80"}`}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{e.nom}</span>
                  {current && (
                    <span className="rounded-full bg-tomato px-2 py-0.5 text-xs font-bold text-white">
                      en cours
                    </span>
                  )}
                </div>
                <div className="text-sm text-charcoal/60">
                  {formatHeure(e.debut)} · {e.dureeLabel} · {e.temperature}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barre d'actions fixe */}
      <div className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md gap-3 border-t border-black/5 bg-crust/95 px-5 py-3 backdrop-blur safe-bottom">
        <Button variant="secondary" onClick={onRecette} className="flex-1">
          🍕 Recette
        </Button>
        <Button variant="danger" onClick={() => setConfirmAnnuler(true)} className="flex-1">
          Annuler
        </Button>
      </div>

      {confirmAnnuler && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <p className="text-lg font-bold">Annuler la session ?</p>
            <p className="mt-1 text-sm text-charcoal/60">
              Le planning et les notifications en cours seront supprimés. Cette action est
              irréversible.
            </p>
            <div className="mt-4 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setConfirmAnnuler(false)}
                className="flex-1"
              >
                Garder
              </Button>
              <Button onClick={onAnnuler} className="flex-1">
                Annuler la session
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
