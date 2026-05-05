import type { GameState } from './types';

export function getBaseProductionPerSecond(state: Pick<GameState, 'monsters'>): number {
  return state.monsters.reduce((sum, m) => sum + m.productionRate * m.count, 0);
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

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3_600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
  const h = Math.floor(seconds / 3_600);
  const m = Math.floor((seconds % 3_600) / 60);
  return `${h}h ${m}m`;
}
