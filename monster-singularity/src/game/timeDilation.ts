import type { Upgrade, Monster, ResearchQueueItem } from './types';

// Dimension level = number of purchased upgrades (0–6)
export function getDimensionLevel(upgrades: Upgrade[]): number {
  return upgrades.filter((u) => u.purchased).length;
}

// Returns research duration in ms. 0 = instant (no time dilation)
// Level 5 → 24h, Level 6 → 48h, etc.
const HOURS_PER_LEVEL_ABOVE_5 = 24;

export function getResearchDurationMs(dimensionLevel: number): number {
  if (dimensionLevel < 5) return 0;
  const hoursAbove5 = (dimensionLevel - 4) * HOURS_PER_LEVEL_ABOVE_5;
  return hoursAbove5 * 3600 * 1000;
}

export function getRemainingMs(item: ResearchQueueItem, now: number): number {
  const elapsed = now - item.startedAt;
  return Math.max(0, item.durationMs - elapsed);
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Ready!';
  const totalSec = Math.ceil(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${totalSec % 60}s`;
}

// Instability particles per second from non-Stable monsters
const IP_RATES: Record<string, number> = {
  Stable: 0,
  Volatile: 0.05,
  Chaotic: 0.15,
  Aberrant: 0.4,
  'Reality-Warping': 1.0,
};

export function getInstabilityParticlesPerSecond(monsters: Monster[]): number {
  return monsters.reduce((sum, m) => sum + (IP_RATES[m.stabilityClass] ?? 0) * m.count, 0);
}

// Rush cost: 100 IP per level above 5 (minimum 100)
export function getRushCost(dimensionLevel: number): number {
  return Math.max(100, (dimensionLevel - 4) * 100);
}
