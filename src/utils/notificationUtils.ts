import { HEAT_LEVELS } from "../utils/thermoCityUtils";

/* ───────── Tipos e constantes ───────── */
export type HeatCode = keyof typeof HEAT_LEVELS;
export type PermissionState = 'granted' | 'denied' | 'undetermined';

export interface NotificationPrefs {
  heatAlerts: boolean;
  minLevel: HeatCode;
  hydrationReminders: boolean;
}