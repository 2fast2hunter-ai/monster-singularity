import type { DecayState } from './types';
import { SEED_CATALOG } from './monster/catalog';

export const DECAY_THRESHOLD_HOURS = 48;
export const DECAY_RATE_PER_HOUR = 0.02;
export const MAX_DECAY_FRACTION = 0.85;

export interface DecayResult {
  triggered: boolean;
  hoursOffline: number;
  consumedSpecies: string[];
  survivingCount: number;
}

export function checkDecayOnLogin(
  lastLoginTimestamp: number,
  ownedSpecies: string[],
): DecayResult {
  const nowMs = Date.now();
  const hoursOffline = (nowMs - lastLoginTimestamp) / 3_600_000;

  if (hoursOffline <= DECAY_THRESHOLD_HOURS || ownedSpecies.length === 0) {
    return { triggered: false, hoursOffline, consumedSpecies: [], survivingCount: ownedSpecies.length };
  }

  const hoursOver = hoursOffline - DECAY_THRESHOLD_HOURS;
  const decayFraction = Math.min(hoursOver * DECAY_RATE_PER_HOUR, MAX_DECAY_FRACTION);

  // Sort by production rate ascending (weakest eaten first)
  const sorted = [...ownedSpecies].sort((a, b) => {
    const specA = SEED_CATALOG.find((s) => s.id === a);
    const specB = SEED_CATALOG.find((s) => s.id === b);
    return (specA?.baseProductionRate ?? 0) - (specB?.baseProductionRate ?? 0);
  });

  const consumeCount = Math.max(1, Math.floor(sorted.length * decayFraction));
  const consumed = sorted.slice(0, consumeCount);

  return {
    triggered: true,
    hoursOffline,
    consumedSpecies: consumed,
    survivingCount: sorted.length - consumeCount,
  };
}

export function hoursUntilDecay(lastLoginTimestamp: number): number {
  const hoursElapsed = (Date.now() - lastLoginTimestamp) / 3_600_000;
  return Math.max(0, DECAY_THRESHOLD_HOURS - hoursElapsed);
}

export function formatDecayCountdown(lastLoginTimestamp: number): string {
  const h = hoursUntilDecay(lastLoginTimestamp);
  if (h <= 0) return 'DECAY ACTIVE';
  const hours = Math.floor(h);
  const minutes = Math.floor((h - hours) * 60);
  return `${hours}h ${minutes}m`;
}

export function makeInitialDecayState(): DecayState {
  return {
    lastLoginTimestamp: Date.now(),
    decayEventPending: false,
    decayConsumedSpecies: [],
    decaySurvivingCount: 0,
  };
}
