"use client";

import { useState } from "react";
import type { AdminConfig } from "@/lib/types";
import {
  clampConfig,
  DEFAULT_ADMIN_CONFIG,
  FIELD_DEFS,
  isFieldValid,
  type FieldDef,
} from "@/lib/config";
import { saveAdminConfig, clearAdminConfig } from "@/lib/storage";
import { Banner, Button, Card } from "./ui";

export default function Admin({
  config,
  sessionActive,
  onRetour,
  onSauvegarde,
}: {
  config: AdminConfig;
  sessionActive: boolean;
  onRetour: () => void;
  onSauvegarde: (config: AdminConfig) => void;
}) {
  // Valeurs sous forme de chaînes pour gérer la saisie libre / vide.
  const [valeurs, setValeurs] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const def of FIELD_DEFS) v[def.key] = String(config[def.key]);
    return v;
  });
  const [confirmReset, setConfirmReset] = useState(false);
  const [sauvegarde, setSauvegarde] = useState(false);

  const readonly = sessionActive;

  function setChamp(key: string, value: string) {
    setValeurs((prev) => ({ ...prev, [key]: value }));
    setSauvegarde(false);
  }

  const champsInvalides = FIELD_DEFS.filter(
    (def) => !isFieldValid(def, Number(valeurs[def.key]))
  );

  function sauver() {
    if (champsInvalides.length > 0) return;
    const next = {} as AdminConfig;
    for (const def of FIELD_DEFS) next[def.key] = Number(valeurs[def.key]);
    const clean = clampConfig(next);
    saveAdminConfig(clean);
    onSauvegarde(clean);
    setSauvegarde(true);
  }

  function reset() {
    clearAdminConfig();
    onSauvegarde(DEFAULT_ADMIN_CONFIG);
    const v: Record<string, string> = {};
    for (const def of FIELD_DEFS) v[def.key] = String(DEFAULT_ADMIN_CONFIG[def.key]);
    setValeurs(v);
    setConfirmReset(false);
    setSauvegarde(true);
  }

  const durees = FIELD_DEFS.filter((d) => d.group === "duree");
  const temps = FIELD_DEFS.filter((d) => d.group === "temp");

  function renderField(def: FieldDef) {
    const raw = valeurs[def.key];
    const valid = isFieldValid(def, Number(raw));
    return (
      <div key={def.key} className="flex items-center justify-between gap-3 py-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{def.label}</div>
          {!valid && !readonly && (
            <div className="text-xs text-tomato">
              Valeur entre {def.min} et {def.max} {def.unit}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            disabled={readonly}
            value={raw}
            min={def.min}
            max={def.max}
            step={def.step}
            onChange={(e) => setChamp(def.key, e.target.value)}
            className={`w-20 rounded-xl border px-3 py-2 text-right text-base disabled:bg-black/5 disabled:text-charcoal/50 ${
              valid || readonly ? "border-black/15" : "border-tomato"
            }`}
          />
          <span className="w-8 text-sm text-charcoal/50">{def.unit}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 px-5 pb-8 pt-6 safe-bottom">
      <header className="flex items-center gap-3">
        <button onClick={onRetour} className="text-2xl text-charcoal/50" aria-label="Retour">
          ←
        </button>
        <h1 className="text-xl font-bold text-tomatoDark">Administration</h1>
      </header>

      {readonly && (
        <Banner tone="warn">Modifiable uniquement hors session active.</Banner>
      )}
      {!readonly && sauvegarde && <Banner tone="info">Paramètres enregistrés ✓</Banner>}

      <Card>
        <h2 className="mb-1 font-semibold">Durées de fermentation</h2>
        <div className="divide-y divide-black/5">{durees.map(renderField)}</div>
      </Card>

      <Card>
        <h2 className="mb-1 font-semibold">Températures (indicatives)</h2>
        <p className="mb-1 text-xs text-charcoal/50">
          Affichées dans le planning et les notifications — l&apos;app ne pilote pas de sonde.
        </p>
        <div className="divide-y divide-black/5">{temps.map(renderField)}</div>
      </Card>

      {!readonly && (
        <div className="flex flex-col gap-3">
          <Button
            onClick={sauver}
            disabled={champsInvalides.length > 0}
            className="w-full"
          >
            Sauvegarder
          </Button>
          <Button variant="danger" onClick={() => setConfirmReset(true)} className="w-full">
            Réinitialiser les valeurs par défaut
          </Button>
        </div>
      )}

      {confirmReset && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <p className="text-lg font-bold">Réinitialiser ?</p>
            <p className="mt-1 text-sm text-charcoal/60">
              Tous les paramètres reviendront à leurs valeurs d&apos;origine.
            </p>
            <div className="mt-4 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setConfirmReset(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button onClick={reset} className="flex-1">
                Réinitialiser
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
