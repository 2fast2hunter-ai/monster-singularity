import type { GameState } from './types';
import { UPGRADE_DEFINITIONS } from './upgrades';
import { makeInitialDecayState } from './decayLogic';
import { makeInitialStaffState } from './staff';
import { makeInitialAchievements, makeInitialLifetimeStats } from '../systems/achievements';
import { makeInitialTowerState } from './tower/towerLogic';

const SAVE_KEY = 'monster_singularity_v2';

export const INITIAL_MONSTERS = [
  { id: 'slime_basic', name: 'Basic Slime', productionRate: 1, count: 1, stabilityClass: 'Stable' as const, instabilityParticleCost: 0 },
];

export function makeInitialState(): GameState {
  const now = Date.now();
  return {
    energy: 0,
    totalEnergyProduced: 0,
    lastSaveTimestamp: now,
    sessionStartTimestamp: now,
    monsters: INITIAL_MONSTERS,
    upgrades: UPGRADE_DEFINITIONS.map((u) => ({ ...u })),
    productionMultiplier: 1.0,
    offlineCatchupCapHours: 48,
    ownedSpecies: ['MS-0001'], // Verdant Slime starter
    streak: { streakCount: 0, lastClaimDate: null, geneFragmentGranted: false, survivorBadge: false },
    decay: makeInitialDecayState(),
    dimensionStorm: null,
    auction: { weekNumber: -1, playerBid: null, bidPlacedAt: null },
    gacha: { totalPulls: 0, pityCount: 0 },
    researchQueue: [],
    instabilityParticles: 0,
    instabilityDepletedSince: null,
    purchasedContainment: [],
    staff: makeInitialStaffState(),
    automations: [],
    automationState: {},
    achievements: makeInitialAchievements(),
    lifetimeStats: makeInitialLifetimeStats(),
    accountCreatedAt: now,
    dimensionLevel: 1,
    dimensionTier: 1,
    serverCycleSlots: [],
    alphaEntityUnlocked: false,
    towerState: makeInitialTowerState(),
  };
}

export function saveGame(state: GameState): void {
  const serializable = {
    ...state,
    lastSaveTimestamp: Date.now(),
    // sessionStartTimestamp is runtime-only, not persisted
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(serializable));
  } catch {
    // localStorage quota exceeded — silently ignore
  }
}

export function loadGame(): GameState | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as GameState;

    // Forward-compat: merge upgrade definitions so new upgrades added in
    // later versions appear for returning players without clearing their save.
    const mergedUpgrades = UPGRADE_DEFINITIONS.map((def) => {
      const saved = parsed.upgrades?.find((u) => u.id === def.id);
      return saved ? { ...def, purchased: saved.purchased } : { ...def };
    });

    const initial = makeInitialState();
    return {
      ...parsed,
      upgrades: mergedUpgrades,
      productionMultiplier: mergedUpgrades
        .filter((u) => u.purchased)
        .reduce((acc, u) => acc * u.multiplier, 1.0),
      // Forward-compat defaults for new fields
      ownedSpecies: parsed.ownedSpecies ?? initial.ownedSpecies,
      streak: parsed.streak
        ? { ...initial.streak, ...parsed.streak, survivorBadge: parsed.streak.survivorBadge ?? false }
        : initial.streak,
      decay: parsed.decay ?? initial.decay,
      dimensionStorm: parsed.dimensionStorm ?? null,
      auction: parsed.auction ?? initial.auction,
      gacha: parsed.gacha ?? initial.gacha,
      researchQueue: parsed.researchQueue ?? [],
      instabilityParticles: parsed.instabilityParticles ?? 0,
      instabilityDepletedSince: parsed.instabilityDepletedSince ?? null,
      staff: parsed.staff ?? makeInitialStaffState(),
      automations: parsed.automations ?? [],
      automationState: parsed.automationState ?? {},
      achievements: parsed.achievements ?? makeInitialAchievements(),
      lifetimeStats: parsed.lifetimeStats ?? makeInitialLifetimeStats(),
      accountCreatedAt: parsed.accountCreatedAt ?? parsed.lastSaveTimestamp ?? Date.now(),
      dimensionLevel: parsed.dimensionLevel ?? 1,
      dimensionTier: parsed.dimensionTier ?? 1,
      serverCycleSlots: parsed.serverCycleSlots ?? [],
      alphaEntityUnlocked: parsed.alphaEntityUnlocked ?? false,
      towerState: parsed.towerState
        ? {
            ...makeInitialTowerState(),
            ...parsed.towerState,
            permanentBadges: parsed.towerState.permanentBadges ?? [],
            highestEverFloor: parsed.towerState.highestEverFloor ?? 0,
          }
        : makeInitialTowerState(),
    };
  } catch {
    return null;
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
