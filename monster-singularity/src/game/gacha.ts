import { SEED_CATALOG } from './monster/catalog';
import type { MonsterSpecies, RarityTier } from './monster/types';

export interface GachaBox {
  id: string;
  name: string;
  cost: number;
  description: string;
  weights: Record<RarityTier, number>;
}

export const GACHA_BOXES: GachaBox[] = [
  {
    id: 'standard',
    name: 'Standard Capsule',
    cost: 50_000,
    description: 'A basic loot capsule. Mostly Common species.',
    weights: { Common: 60, Uncommon: 30, Rare: 9, Legendary: 1, Singularity: 0 },
  },
  {
    id: 'rare',
    name: 'Rare Capsule',
    cost: 300_000,
    description: 'Higher-grade capsule with improved Rare odds.',
    weights: { Common: 15, Uncommon: 35, Rare: 35, Legendary: 14, Singularity: 1 },
  },
  {
    id: 'singularity',
    name: 'Singularity Box',
    cost: 2_000_000,
    description: 'Ultimate box. Guaranteed Rare or above. Chance for Singularity.',
    weights: { Common: 0, Uncommon: 5, Rare: 40, Legendary: 45, Singularity: 10 },
  },
];

// Pity: guaranteed Rare+ after this many pulls without one
export const PITY_THRESHOLD = 90;

const RARITY_ORDER: RarityTier[] = ['Common', 'Uncommon', 'Rare', 'Legendary', 'Singularity'];

function weightedRarityRoll(weights: Record<RarityTier, number>): RarityTier {
  const total = RARITY_ORDER.reduce((sum, r) => sum + (weights[r] ?? 0), 0);
  let roll = Math.random() * total;
  for (const rarity of RARITY_ORDER) {
    roll -= weights[rarity] ?? 0;
    if (roll <= 0) return rarity;
  }
  return 'Common';
}

function isRarePlus(rarity: RarityTier): boolean {
  return rarity === 'Rare' || rarity === 'Legendary' || rarity === 'Singularity';
}

export interface GachaPullResult {
  species: MonsterSpecies;
  isDuplicate: boolean;
  energyRefund: number;
  pitySaved: boolean;
}

export function pullGacha(
  box: GachaBox,
  ownedSpecies: string[],
  pityCount: number,
): GachaPullResult {
  const pitySaved = pityCount >= PITY_THRESHOLD;

  let rarity = weightedRarityRoll(box.weights);

  // Pity override: guarantee Rare+
  if (pitySaved && !isRarePlus(rarity)) {
    rarity = 'Rare';
  }

  // Get all candidates for this rarity; fall back to any rarity if none exist
  let pool = SEED_CATALOG.filter((s) => s.rarityTier === rarity);
  if (pool.length === 0) pool = SEED_CATALOG;

  const species = pool[Math.floor(Math.random() * pool.length)];
  const isDuplicate = ownedSpecies.includes(species.id);
  const energyRefund = isDuplicate ? Math.floor(box.cost * 0.2) : 0;

  return { species, isDuplicate, energyRefund, pitySaved };
}

// Milestone pull counts — hitting one triggers a celebration banner
export const PULL_MILESTONES = [10, 50, 100, 250, 500, 1_000, 2_500, 5_000] as const;
export type PullMilestone = (typeof PULL_MILESTONES)[number];

/** Returns the first milestone crossed between prevTotal and newTotal, or null. */
export function getMilestoneReached(prevTotal: number, newTotal: number): PullMilestone | null {
  for (const m of PULL_MILESTONES) {
    if (prevTotal < m && newTotal >= m) return m;
  }
  return null;
}

/** Returns the next milestone the player hasn't reached yet, or null if maxed. */
export function getNextMilestone(totalPulls: number): PullMilestone | null {
  return PULL_MILESTONES.find((m) => m > totalPulls) ?? null;
}

export function pullGachaMulti(
  box: GachaBox,
  ownedSpecies: string[],
  pityCount: number,
  count: number,
): GachaPullResult[] {
  const results: GachaPullResult[] = [];
  let currentPity = pityCount;
  const mutableOwned = [...ownedSpecies];

  for (let i = 0; i < count; i++) {
    const result = pullGacha(box, mutableOwned, currentPity);
    results.push(result);
    if (isRarePlus(result.species.rarityTier)) {
      currentPity = 0;
    } else {
      currentPity++;
    }
    if (!result.isDuplicate) {
      mutableOwned.push(result.species.id);
    }
  }

  return results;
}
