export type Protocole = "24h" | "48h";

export type StepStatut = "pending" | "current" | "done";

/** Paramètres de fermentation configurables (panneau admin). */
export interface AdminConfig {
  duree_preparation_min: number;
  duree_pointage_tamb_h: number;
  duree_pointage_bt_48h_h: number;
  duree_pointage_bt_24h_h: number;
  duree_repos_amb_h: number;
  duree_boulage_48h_min: number;
  duree_boulage_24h_min: number;
  duree_appret_tamb_h: number;
  duree_appret_bt_h: number;
  duree_repos_final_min_h: number;
  temp_pointage_amb_c: number;
  temp_pointage_basse_c: number;
  temp_appret_amb_c: number;
  temp_repos_final_c: number;
}

/** Une étape calculée du planning. */
export interface EtapeCalculee {
  index: number;
  nom: string;
  action: string;
  /** Durée en minutes (le repos final est un minimum). */
  dureeMin: number;
  dureeLabel: string;
  temperature: string;
  /** ISO string. */
  debut: string;
  /** ISO string. */
  fin: string;
  statut: StepStatut;
}

export interface Session {
  protocole: Protocole;
  nb_pizzas: number;
  /** ISO string de l'heure de service (T). */
  heure_service: string;
  etapes: EtapeCalculee[];
  etape_courante: number;
  created_at: string;
}
