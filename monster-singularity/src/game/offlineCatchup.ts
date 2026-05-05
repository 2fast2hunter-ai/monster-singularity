import type { GameState } from './types';
import { getEffectiveProductionPerSecond } from './production';

export interface CatchupResult {
  energyGained: number;
  offlineSeconds: number;
  cappedSeconds: number;
  wasCapped: boolean;
}

// Minimum offline gap before we show the catch-up modal (10 seconds)
export const MIN_OFFLINE_SECONDS_FOR_MODAL = 10;

export function calculateOfflineCatchup(
  state: GameState,
  now: number
): CatchupResult {
  const offlineSeconds = (now - state.lastSaveTimestamp) / 1000;
  const capSeconds = state.offlineCatchupCapHours * 3600;
  const cappedSeconds = Math.min(offlineSeconds, capSeconds);
  const wasCapped = offlineSeconds > capSeconds;

  const perSecond = getEffectiveProductionPerSecond(state);
  const energyGained = perSecond * cappedSeconds;

  return { energyGained, offlineSeconds, cappedSeconds, wasCapped };
}
