import type { GameState, Monster } from './types';
import type { StabilityClass } from './monster/types';
import { STABILITY_CLASS_ORDER } from './monster/types';

export const STABILITY_MULTIPLIERS: Record<StabilityClass, number> = {
  'Stable': 1.0,
  'Volatile': 2.5,
  'Chaotic': 7.0,
  'Aberrant': 18.0,
  'Reality-Warping': 50.0,
};

export function getMonsterBioReactorOutput(m: Monster): number {
  const mult = STABILITY_MULTIPLIERS[m.stabilityClass] ?? 1.0;
  return m.productionRate * m.count * mult;
}

export function getBaseProductionPerSecond(state: Pick<GameState, 'monsters'>): number {
  return state.monsters.reduce((sum, m) => sum + getMonsterBioReactorOutput(m), 0);
}

export function getEffectiveProductionPerSecond(
  state: Pick<GameState, 'monsters' | 'productionMultiplier'>
): number {
  return getBaseProductionPerSecond(state) * state.productionMultiplier;
}

export function recalculateMultiplier(upgrades: GameState['upgrades']): number {
  return upgrades
    .filter((u) => u.purchased)
    .reduce((acc, u) => acc * u.multiplier, 1.0);
}

export function formatNumber(n: number): string {
  if (!isFinite(n)) return '∞';
  if (n < 1_000) return n.toFixed(1);
  if (n < 1_000_000) return `${(n / 1_000).toFixed(2)}K`;
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n < 1_000_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  return `${(n / 1_000_000_000_000).toFixed(2)}T`;
}

/** Total IP cost per second across all monsters (sum of instabilityParticleCost × count). */
export function getTotalIPCostPerSecond(monsters: Monster[]): number {
  return monsters.reduce((sum, m) => sum + m.instabilityParticleCost * m.count, 0);
}

export interface IPTickResult {
  instabilityParticles: number;
  instabilityDepletedSince: number | null;
  /** Monster IDs that must be downgraded to Stable due to IP starvation. */
  monsterDowngrades: string[];
}

/**
 * Applies one tick of IP consumption.
 * Call only when monsters are not in runaway recovery (pause during recovery).
 * Returns new IP balance and any monster IDs that should be downgraded to Stable.
 */
export function tickIPConsumption(
  state: Pick<GameState, 'monsters' | 'instabilityParticles' | 'instabilityDepletedSince'>,
  elapsedSec: number,
  now: number,
): IPTickResult {
  const costPerSec = getTotalIPCostPerSecond(state.monsters);
  const deducted = costPerSec * elapsedSec;
  const newIP = Math.max(0, state.instabilityParticles - deducted);

  const monsterDowngrades: string[] = [];
  if (newIP <= 0 && state.instabilityParticles > 0) {
    // IP just depleted — downgrade all non-Stable monsters to Stable
    for (const m of state.monsters) {
      if (m.stabilityClass !== 'Stable') {
        monsterDowngrades.push(m.id);
      }
    }
  }

  const instabilityDepletedSince =
    newIP <= 0 ? (state.instabilityDepletedSince ?? now) : null;

  return { instabilityParticles: newIP, instabilityDepletedSince, monsterDowngrades };
}

/** Returns a copy of the monster downgraded one step toward Stable, or Stable if already lowest. */
export function downgradeMonsterToStable(monster: Monster): Monster {
  return { ...monster, stabilityClass: 'Stable', instabilityParticleCost: 0 };
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3_600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
  const h = Math.floor(seconds / 3_600);
  const m = Math.floor((seconds % 3_600) / 60);
  return `${h}h ${m}m`;
}
