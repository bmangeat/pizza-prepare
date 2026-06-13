import type { AdminConfig, Protocole } from "./types";

/** Modèle d'une étape avant calcul des horaires. */
export interface EtapeModele {
  nom: string;
  action: string;
  /** Durée en minutes, dérivée de la config. */
  dureeMin: (c: AdminConfig) => number;
  /** Libellé de température affiché. */
  temperature: (c: AdminConfig) => string;
  /** Vrai pour le repos final (durée = minimum). */
  estMinimum?: boolean;
}

function h(value: number): number {
  return Math.round(value * 60);
}

const AMBIANTE = "Ambiante";

export function getProtocole(protocole: Protocole): EtapeModele[] {
  return protocole === "48h" ? PROTOCOLE_48H : PROTOCOLE_24H;
}

const PROTOCOLE_48H: EtapeModele[] = [
  {
    nom: "Préparation",
    action: "Préparer la pâte selon les instructions",
    dureeMin: (c) => c.duree_preparation_min,
    temperature: () => AMBIANTE,
  },
  {
    nom: "Pointage T° ambiante",
    action: "Couvrir et laisser lever",
    dureeMin: (c) => h(c.duree_pointage_tamb_h),
    temperature: (c) => `${c.temp_pointage_amb_c} °C`,
  },
  {
    nom: "Pointage basse T°",
    action: "Placer au réfrigérateur",
    dureeMin: (c) => h(c.duree_pointage_bt_48h_h),
    temperature: (c) => `${c.temp_pointage_basse_c} °C`,
  },
  {
    nom: "Repos ambiante",
    action: "Sortir du réfrigérateur",
    dureeMin: (c) => h(c.duree_repos_amb_h),
    temperature: () => AMBIANTE,
  },
  {
    nom: "Boulage / Pâtons",
    action: "Former les pâtons",
    dureeMin: (c) => c.duree_boulage_48h_min,
    temperature: () => AMBIANTE,
  },
  {
    nom: "Apprêt T° ambiante",
    action: "Couvrir les pâtons",
    dureeMin: (c) => h(c.duree_appret_tamb_h),
    temperature: (c) => `${c.temp_appret_amb_c} °C`,
  },
  {
    nom: "Apprêt basse T°",
    action: "Placer au réfrigérateur",
    dureeMin: (c) => h(c.duree_appret_bt_h),
    temperature: (c) => `${c.temp_pointage_basse_c} °C`,
  },
  {
    nom: "Repos final",
    action: "Sortir et laisser revenir à température",
    dureeMin: (c) => h(c.duree_repos_final_min_h),
    temperature: (c) => `${c.temp_repos_final_c} °C`,
    estMinimum: true,
  },
];

const PROTOCOLE_24H: EtapeModele[] = [
  {
    nom: "Préparation",
    action: "Préparer la pâte selon les instructions",
    dureeMin: (c) => c.duree_preparation_min,
    temperature: () => AMBIANTE,
  },
  {
    nom: "Pointage T° ambiante",
    action: "Couvrir et laisser lever",
    dureeMin: (c) => h(c.duree_pointage_tamb_h),
    temperature: (c) => `${c.temp_pointage_amb_c} °C`,
  },
  {
    nom: "Pointage basse T°",
    action: "Placer au réfrigérateur",
    dureeMin: (c) => h(c.duree_pointage_bt_24h_h),
    temperature: (c) => `${c.temp_pointage_basse_c} °C`,
  },
  {
    nom: "Repos ambiante",
    action: "Sortir du réfrigérateur",
    dureeMin: (c) => h(c.duree_repos_amb_h),
    temperature: () => AMBIANTE,
  },
  {
    nom: "Boulage / Pâtons",
    action: "Former les pâtons",
    dureeMin: (c) => c.duree_boulage_24h_min,
    temperature: () => AMBIANTE,
  },
  {
    nom: "Repos final",
    action: "Couvrir, laisser revenir à température",
    dureeMin: (c) => h(c.duree_repos_final_min_h),
    temperature: (c) => `${c.temp_repos_final_c} °C`,
    estMinimum: true,
  },
];
