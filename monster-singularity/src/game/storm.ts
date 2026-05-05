import type { DimensionStorm, StabilityClass } from './types';
import { STABILITY_CLASS_ORDER } from './monster/types';

export const STORM_MULTIPLIER = 3;
const STORM_SERVER_URL = 'http://localhost:3200/api/storm/current';

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getMondayMidnightUTC(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayOfWeek = d.getUTCDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setUTCDate(d.getUTCDate() + daysToMonday);
  return d;
}

// Deterministic: same algorithm as retention-server/storm.js
export function computeCurrentStorm(now = new Date()): DimensionStorm {
  const startedAt = getMondayMidnightUTC(now);
  const endsAt = new Date(startedAt.getTime() + 7 * 24 * 3600 * 1000);
  const isoWeek = getISOWeek(startedAt);
  const classIndex = isoWeek % STABILITY_CLASS_ORDER.length;
  return {
    activeStabilityClass: STABILITY_CLASS_ORDER[classIndex],
    startedAt: startedAt.getTime(),
    endsAt: endsAt.getTime(),
  };
}

// Try server first, fall back to local computation so the game works offline.
export async function fetchOrComputeStorm(): Promise<DimensionStorm> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(STORM_SERVER_URL, { signal: controller.signal });
    clearTimeout(t);
    if (res.ok) {
      const data = await res.json() as { activeStabilityClass: StabilityClass; startedAt: string; endsAt: string };
      return {
        activeStabilityClass: data.activeStabilityClass,
        startedAt: new Date(data.startedAt).getTime(),
        endsAt: new Date(data.endsAt).getTime(),
      };
    }
  } catch {
    // server unreachable — use local computation
  }
  return computeCurrentStorm();
}
