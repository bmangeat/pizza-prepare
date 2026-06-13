import type { AdminConfig } from "./types";
import { loadAdminConfigRaw } from "./storage";

export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  duree_preparation_min: 55,
  duree_pointage_tamb_h: 3,
  duree_pointage_bt_48h_h: 20,
  duree_pointage_bt_24h_h: 21,
  duree_repos_amb_h: 1,
  duree_boulage_48h_min: 15,
  duree_boulage_24h_min: 30,
  duree_appret_tamb_h: 2,
  duree_appret_bt_h: 18,
  duree_repos_final_min_h: 4,
  temp_pointage_amb_c: 20,
  temp_pointage_basse_c: 4,
  temp_appret_amb_c: 20,
  temp_repos_final_c: 20,
};

/** Définition des bornes de validation (section 9.3 des specs). */
export interface FieldDef {
  key: keyof AdminConfig;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  group: "duree" | "temp";
}

export const FIELD_DEFS: FieldDef[] = [
  { key: "duree_preparation_min", label: "Durée de préparation", unit: "min", min: 30, max: 120, step: 5, group: "duree" },
  { key: "duree_pointage_tamb_h", label: "Pointage T° ambiante", unit: "h", min: 1, max: 6, step: 0.5, group: "duree" },
  { key: "duree_pointage_bt_48h_h", label: "Pointage basse T° (48h)", unit: "h", min: 12, max: 36, step: 1, group: "duree" },
  { key: "duree_pointage_bt_24h_h", label: "Pointage basse T° (24h)", unit: "h", min: 12, max: 36, step: 1, group: "duree" },
  { key: "duree_repos_amb_h", label: "Repos ambiante", unit: "h", min: 0.5, max: 3, step: 0.5, group: "duree" },
  { key: "duree_boulage_48h_min", label: "Boulage / façonnage (48h)", unit: "min", min: 5, max: 60, step: 5, group: "duree" },
  { key: "duree_boulage_24h_min", label: "Boulage / façonnage (24h)", unit: "min", min: 5, max: 60, step: 5, group: "duree" },
  { key: "duree_appret_tamb_h", label: "Apprêt T° ambiante (48h)", unit: "h", min: 1, max: 4, step: 0.5, group: "duree" },
  { key: "duree_appret_bt_h", label: "Apprêt basse T° (48h)", unit: "h", min: 8, max: 24, step: 1, group: "duree" },
  { key: "duree_repos_final_min_h", label: "Repos final (minimum)", unit: "h", min: 2, max: 8, step: 0.5, group: "duree" },
  { key: "temp_pointage_amb_c", label: "T° pointage ambiante", unit: "°C", min: 18, max: 25, step: 1, group: "temp" },
  { key: "temp_pointage_basse_c", label: "T° pointage basse", unit: "°C", min: 2, max: 8, step: 1, group: "temp" },
  { key: "temp_appret_amb_c", label: "T° apprêt ambiante", unit: "°C", min: 18, max: 25, step: 1, group: "temp" },
  { key: "temp_repos_final_c", label: "T° repos final", unit: "°C", min: 18, max: 25, step: 1, group: "temp" },
];

/** Charge la config en fusionnant avec les valeurs par défaut et en clampant aux bornes. */
export function loadAdminConfig(): AdminConfig {
  const stored = loadAdminConfigRaw();
  const merged: AdminConfig = { ...DEFAULT_ADMIN_CONFIG, ...(stored ?? {}) };
  return clampConfig(merged);
}

export function clampConfig(config: AdminConfig): AdminConfig {
  const result = { ...config };
  for (const def of FIELD_DEFS) {
    const raw = Number(result[def.key]);
    const value = Number.isFinite(raw) ? raw : DEFAULT_ADMIN_CONFIG[def.key];
    result[def.key] = Math.min(def.max, Math.max(def.min, value));
  }
  return result;
}

export function isFieldValid(def: FieldDef, value: number): boolean {
  return Number.isFinite(value) && value >= def.min && value <= def.max;
}
