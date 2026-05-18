import { SEED_CATALOG } from './monster/catalog';
import type { RarityTier } from './monster/types';
import type { GachaPullResult } from './gacha';

export type CalendarRewardKind = 'energy' | 'egg';

export interface CalendarReward {
  kind: CalendarRewardKind;
  amount?: number;
  guaranteedRarity?: RarityTier;
  label: string;
  icon: string;
  /** Days that award the permanent 30-Day Survivor badge */
  awardsBadge?: boolean;
}

export const CALENDAR_REWARDS: Record<number, CalendarReward> = {
  1:  { kind: 'energy', amount: 500,  label: '500 Energy',   icon: '⚡' },
  2:  { kind: 'energy', amount: 500,  label: '500 Energy',   icon: '⚡' },
  3:  { kind: 'energy', amount: 500,  label: '500 Energy',   icon: '⚡' },
  4:  { kind: 'energy', amount: 500,  label: '500 Energy',   icon: '⚡' },
  5:  { kind: 'energy', amount: 500,  label: '500 Energy',   icon: '⚡' },
  6:  { kind: 'energy', amount: 500,  label: '500 Energy',   icon: '⚡' },
  7:  { kind: 'egg',    guaranteedRarity: 'Rare',      label: 'Rare Egg',      icon: '🥚' },
  8:  { kind: 'energy', amount: 1000, label: '1,000 Energy', icon: '⚡' },
  9:  { kind: 'energy', amount: 1000, label: '1,000 Energy', icon: '⚡' },
  10: { kind: 'energy', amount: 1000, label: '1,000 Energy', icon: '⚡' },
  11: { kind: 'energy', amount: 1000, label: '1,000 Energy', icon: '⚡' },
  12: { kind: 'energy', amount: 1500, label: '1,500 Energy', icon: '⚡' },
  13: { kind: 'energy', amount: 1500, label: '1,500 Energy', icon: '⚡' },
  14: { kind: 'egg',    guaranteedRarity: 'Uncommon',   label: 'Uncommon Egg',  icon: '🥚' },
  15: { kind: 'energy', amount: 2000, label: '2,000 Energy', icon: '⚡' },
  16: { kind: 'energy', amount: 2000, label: '2,000 Energy', icon: '⚡' },
  17: { kind: 'energy', amount: 2000, label: '2,000 Energy', icon: '⚡' },
  18: { kind: 'energy', amount: 2000, label: '2,000 Energy', icon: '⚡' },
  19: { kind: 'energy', amount: 2000, label: '2,000 Energy', icon: '⚡' },
  20: { kind: 'energy', amount: 2000, label: '2,000 Energy', icon: '⚡' },
  21: { kind: 'egg',    guaranteedRarity: 'Rare',       label: 'Epic Egg',      icon: '🥚' },
  22: { kind: 'energy', amount: 2000, label: '2,000 Energy', icon: '⚡' },
  23: { kind: 'energy', amount: 2200, label: '2,200 Energy', icon: '⚡' },
  24: { kind: 'energy', amount: 2400, label: '2,400 Energy', icon: '⚡' },
  25: { kind: 'energy', amount: 2600, label: '2,600 Energy', icon: '⚡' },
  26: { kind: 'energy', amount: 2800, label: '2,800 Energy', icon: '⚡' },
  27: { kind: 'energy', amount: 3000, label: '3,000 Energy', icon: '⚡' },
  28: { kind: 'egg',    guaranteedRarity: 'Legendary',  label: 'Legendary Egg', icon: '🌟' },
  29: { kind: 'energy', amount: 5000, label: '5,000 Energy + Badge', icon: '🏆', awardsBadge: true },
  30: { kind: 'energy', amount: 5000, label: '5,000 Energy + Badge', icon: '🏆', awardsBadge: true },
};

export function pullGuaranteedEgg(
  rarity: RarityTier,
  ownedSpecies: string[],
): GachaPullResult {
  let pool = SEED_CATALOG.filter((s) => s.rarityTier === rarity);
  if (pool.length === 0) pool = SEED_CATALOG;
  const species = pool[Math.floor(Math.random() * pool.length)];
  const isDuplicate = ownedSpecies.includes(species.id);
  return { species, isDuplicate, energyRefund: 0, pitySaved: false };
}
