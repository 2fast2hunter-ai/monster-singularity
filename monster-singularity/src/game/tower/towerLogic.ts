import type { Monster } from '../types';
import type { TowerAttemptResult, TowerState } from './types';
import { TOWER_FLOORS } from './towerFloors';
import { STABILITY_MULTIPLIERS } from '../production';
import { SEED_CATALOG } from '../monster/catalog';
import type { RarityTier } from '../monster/types';

export const TOWER_MILESTONE_FLOORS = [10, 20, 30] as const;

export const TOWER_BADGES = {
  10: 'tower_climber',
  20: 'tower_veteran',
  30: 'tower_master',
} as const;

export const TOWER_ENERGY_REWARDS = {
  10: 2000,
  20: 5000,
  30: 10000,
} as const;

export const TOWER_SPECIES_REWARD_TIER: Record<number, RarityTier | null> = {
  10: null,
  20: 'Rare',
  30: 'Legendary',
};

export function makeInitialTowerState(): TowerState {
  return {
    weeklyFloor: 0,
    highestEverFloor: 0,
    lastWeeklyReset: getLastMondayUTC(),
    permanentBadges: [],
    weeklyRewardsClaimed: [],
    lastAttemptResult: null,
  };
}

/** Returns Unix ms for the most recent Monday 00:00 UTC. */
export function getLastMondayUTC(now = Date.now()): number {
  const d = new Date(now);
  const day = d.getUTCDay(); // 0=Sun, 1=Mon … 6=Sat
  const daysBack = day === 0 ? 6 : day - 1; // days since last Monday
  d.setUTCDate(d.getUTCDate() - daysBack);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

/** Returns ms until the next Monday 00:00 UTC from `now`. */
export function getMsUntilNextReset(now = Date.now()): number {
  const lastMonday = getLastMondayUTC(now);
  return lastMonday + 7 * 24 * 60 * 60 * 1000 - now;
}

/** Computes player tower power from their farm monsters. */
export function calcPlayerPower(monsters: Monster[]): number {
  return monsters.reduce((sum, m) => {
    const mult = STABILITY_MULTIPLIERS[m.stabilityClass] ?? 1;
    return sum + m.productionRate * m.count * mult;
  }, 0);
}

/**
 * Resolves a tower floor attempt.
 * Win is guaranteed if playerPower >= threshold.
 * Between 50% and 100% of threshold, win chance scales linearly 0–100%.
 * Below 50% of threshold, auto-fail (but retry is always allowed).
 */
export function resolveTowerAttempt(
  floor: number,
  playerPower: number,
  monsters: Monster[],
  towerState: TowerState,
  ownedSpecies: string[],
): {
  result: TowerAttemptResult;
  energyReward: number;
  newOwnedSpecies: string[];
  newMonsterEntry: Monster | null;
} {
  const floorDef = TOWER_FLOORS[floor - 1];
  if (!floorDef) throw new Error(`Invalid floor ${floor}`);

  const threshold = floorDef.powerThreshold;
  let success: boolean;

  if (playerPower >= threshold) {
    success = true;
  } else if (playerPower >= threshold * 0.5) {
    const ratio = (playerPower - threshold * 0.5) / (threshold * 0.5);
    success = Math.random() < ratio;
  } else {
    success = false;
  }

  let energyReward = 0;
  let rewardSpeciesGranted: string | null = null;
  let newOwnedSpecies = [...ownedSpecies];
  let newMonsterEntry: Monster | null = null;
  let milestoneBadgeGranted: string | null = null;

  if (success) {
    const milestoneFloor = TOWER_MILESTONE_FLOORS.find(
      (mf) => mf === floor && !towerState.weeklyRewardsClaimed.includes(mf),
    );

    if (milestoneFloor !== undefined) {
      energyReward = TOWER_ENERGY_REWARDS[milestoneFloor];
      milestoneBadgeGranted = TOWER_BADGES[milestoneFloor];

      const rewardTier = TOWER_SPECIES_REWARD_TIER[milestoneFloor];
      if (rewardTier) {
        const unownedOfTier = SEED_CATALOG.filter(
          (s) => s.rarityTier === rewardTier && !newOwnedSpecies.includes(s.id),
        );
        if (unownedOfTier.length > 0) {
          const pick = unownedOfTier[Math.floor(Math.random() * unownedOfTier.length)];
          rewardSpeciesGranted = pick.id;
          newOwnedSpecies = [...newOwnedSpecies, pick.id];
          newMonsterEntry = {
            id: pick.id,
            name: pick.name,
            productionRate: pick.baseProductionRate,
            count: 1,
            stabilityClass: pick.stabilityClass,
            instabilityParticleCost: pick.instabilityParticleCost,
          };
        }
      }
    }
  }

  const result: TowerAttemptResult = {
    floor,
    success,
    playerPower,
    floorThreshold: threshold,
    rewardEnergyGranted: energyReward,
    rewardSpeciesGranted,
    milestoneBadgeGranted,
    timestamp: Date.now(),
  };

  return { result, energyReward, newOwnedSpecies, newMonsterEntry };
}

/**
 * Checks if a weekly reset is due and applies it.
 * Returns updated TowerState (may be unchanged if no reset needed).
 */
export function maybeApplyWeeklyReset(tower: TowerState, now = Date.now()): TowerState {
  const currentMonday = getLastMondayUTC(now);
  if (currentMonday > tower.lastWeeklyReset) {
    return {
      ...tower,
      weeklyFloor: 0,
      weeklyRewardsClaimed: [],
      lastWeeklyReset: currentMonday,
      lastAttemptResult: null,
      // permanentBadges and highestEverFloor survive
    };
  }
  return tower;
}

/** The floor a player may currently attempt (weeklyFloor + 1, capped at 30). */
export function getCurrentAttemptFloor(tower: TowerState): number {
  return Math.min(tower.weeklyFloor + 1, 30);
}
