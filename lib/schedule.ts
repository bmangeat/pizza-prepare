import type { AdminConfig, EtapeCalculee, Protocole, Session, StepStatut } from "./types";
import { getProtocole } from "./protocols";

/** Formate une durée en minutes en libellé lisible ("3 h", "1 h 30", "55 min"). */
export function formatDuree(min: number, estMinimum = false): string {
  const prefix = estMinimum ? "≥ " : "";
  if (min < 60) return `${prefix}${min} min`;
  const heures = Math.floor(min / 60);
  const reste = min % 60;
  if (reste === 0) return `${prefix}${heures} h`;
  return `${prefix}${heures} h ${String(reste).padStart(2, "0")}`;
}

/**
 * Calcule le planning en remontant depuis l'heure de service (T).
 * Le début de la 1re étape = T − somme de toutes les durées ; on cascade ensuite vers l'avant.
 */
export function computeSchedule(
  protocole: Protocole,
  heureService: Date,
  config: AdminConfig
): Omit<EtapeCalculee, "statut">[] {
  const modeles = getProtocole(protocole);
  const durees = modeles.map((m) => m.dureeMin(config));
  const total = durees.reduce((a, b) => a + b, 0);

  const etapes: Omit<EtapeCalculee, "statut">[] = [];
  let curseur = new Date(heureService.getTime() - total * 60_000);

  modeles.forEach((modele, index) => {
    const debut = new Date(curseur);
    const fin = new Date(curseur.getTime() + durees[index] * 60_000);
    etapes.push({
      index,
      nom: modele.nom,
      action: modele.action,
      dureeMin: durees[index],
      dureeLabel: formatDuree(durees[index], modele.estMinimum),
      temperature: modele.temperature(config),
      debut: debut.toISOString(),
      fin: fin.toISOString(),
    });
    curseur = fin;
  });

  return etapes;
}

/** Détermine le statut d'une étape à l'instant `now`. */
export function statutEtape(etape: { debut: string; fin: string }, now: Date): StepStatut {
  const t = now.getTime();
  if (t >= new Date(etape.fin).getTime()) return "done";
  if (t >= new Date(etape.debut).getTime()) return "current";
  return "pending";
}

/** Index de l'étape courante : la première non terminée (ou la dernière si tout est fini). */
export function indexEtapeCourante(
  etapes: { debut: string; fin: string }[],
  now: Date
): number {
  for (let i = 0; i < etapes.length; i++) {
    if (statutEtape(etapes[i], now) !== "done") return i;
  }
  return etapes.length - 1;
}

/** Recalcule statuts + étape courante d'une session (sans muter l'original). */
export function withStatuts(session: Session, now: Date): Session {
  const etapes = session.etapes.map((e) => ({ ...e, statut: statutEtape(e, now) }));
  return {
    ...session,
    etapes,
    etape_courante: indexEtapeCourante(etapes, now),
  };
}

/** Construit une session complète à partir des paramètres de configuration. */
export function creerSession(
  protocole: Protocole,
  nbPizzas: number,
  heureService: Date,
  config: AdminConfig
): Session {
  const now = new Date();
  const etapesBrutes = computeSchedule(protocole, heureService, config);
  const etapes: EtapeCalculee[] = etapesBrutes.map((e) => ({
    ...e,
    statut: statutEtape(e, now),
  }));
  return {
    protocole,
    nb_pizzas: nbPizzas,
    heure_service: heureService.toISOString(),
    etapes,
    etape_courante: indexEtapeCourante(etapes, now),
    created_at: now.toISOString(),
  };
}
