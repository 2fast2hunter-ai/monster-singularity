import { describe, it, expect } from 'vitest';
import {
  getTierForLevel,
  getNextSubLevelCost,
  checkDimensionTimeGate,
  getOmniDexSlotCount,
  getOmniDexCompletionPct,
  checkAlphaUnlock,
  currentConditions,
  getAvailableServerCycleSlotCount,
  makeServerCycleSlot,
  checkServerCycleHatches,
  validateDimensionPurchase,
  validateServerCycleEggPlacement,
} from '../dimensionProgress';
import { SERVER_CYCLE_INCUBATION_MS } from '../../config/progressionConfig';
import type { GameState } from '../types';

// Minimal GameState factory for tests
function makeState(overrides: Partial<GameState> = {}): GameState {
  const base: GameState = {
    energy: 0,
    totalEnergyProduced: 0,
    lastSaveTimestamp: 0,
    sessionStartTimestamp: 0,
    monsters: [],
    upgrades: [],
    productionMultiplier: 1,
    offlineCatchupCapHours: 48,
    dimensionStorm: null,
    ownedSpecies: [],
    streak: { streakCount: 0, lastClaimDate: null, geneFragmentGranted: false },
    decay: { lastLoginTimestamp: 0, decayEventPending: false, decayConsumedSpecies: [], decaySurvivingCount: 0 },
    auction: { weekNumber: -1, playerBid: null, bidPlacedAt: null },
    gacha: { totalPulls: 0, pityCount: 0 },
    researchQueue: [],
    instabilityParticles: 0,
    instabilityDepletedSince: null,
    purchasedContainment: [],
    staff: { members: [] },
    automations: [],
    automationState: {},
    achievements: [],
    lifetimeStats: {
      totalEnergyGenerated: 0, totalIPGenerated: 0, totalBred: 0,
      totalContainmentEvents: 0, playSessions: 0, speciesDiscovered: 0,
    },
    accountCreatedAt: 0,
    dimensionLevel: 1,
    dimensionTier: 1,
    serverCycleSlots: [],
    alphaEntityUnlocked: false,
    ...overrides,
  };
  return base;
}

// ── getTierForLevel ────────────────────────────────────────────────────────

describe('getTierForLevel', () => {
  it('level 1 → tier 1', () => expect(getTierForLevel(1)).toBe(1));
  it('level 3 → tier 1 (last sub-level of tier 1)', () => expect(getTierForLevel(3)).toBe(1));
  it('level 4 → tier 2 (first sub-level of tier 2)', () => expect(getTierForLevel(4)).toBe(2));
  it('level 7 → tier 2', () => expect(getTierForLevel(7)).toBe(2));
  it('level 8 → tier 3', () => expect(getTierForLevel(8)).toBe(3));
  it('level 46 → tier 11 (Apex entry)', () => expect(getTierForLevel(46)).toBe(11));
  it('level 50 → tier 11 (max)', () => expect(getTierForLevel(50)).toBe(11));
});

// ── getNextSubLevelCost ────────────────────────────────────────────────────

describe('getNextSubLevelCost', () => {
  it('level 50 → null (already max)', () => expect(getNextSubLevelCost(50)).toBeNull());

  // Tier 2 gate = 1,000. Sub-level multipliers: [1.0, 2.5, 6.0, 15.0]
  it('level 3 → 1,000 (tier 2 entry, 1.0× gate)', () => expect(getNextSubLevelCost(3)).toBe(1_000));
  it('level 4 → 2,500 (tier 2 second sub-level, 2.5× gate)', () => expect(getNextSubLevelCost(4)).toBe(2_500));
  it('level 5 → 6,000 (tier 2 third sub-level, 6.0×)', () => expect(getNextSubLevelCost(5)).toBe(6_000));

  // Tier 5 gate = 5,000,000. Sub-levels: 5,000,000 / 12,500,000 / 30,000,000 / 75,000,000 / 200,000,000
  it('level 16 → 5,000,000 (tier 5 entry)', () => expect(getNextSubLevelCost(16)).toBe(5_000_000));
  it('level 17 → 12,500,000 (tier 5 second sub-level)', () => expect(getNextSubLevelCost(17)).toBe(12_500_000));
});

// ── checkDimensionTimeGate ─────────────────────────────────────────────────

describe('checkDimensionTimeGate', () => {
  const DAY_MS = 24 * 60 * 60 * 1_000;

  it('tier 1 entry (level 1): no gate', () => {
    expect(checkDimensionTimeGate(1, 0, 0)).toBe('ok');
  });

  it('tier 2 entry (level 4): requires 3 days', () => {
    const createdAt = 0;
    // 2 days elapsed: blocked
    expect(checkDimensionTimeGate(4, createdAt, 2 * DAY_MS)).toBe('DIMENSION_TIME_GATE');
    // 3 days elapsed: ok
    expect(checkDimensionTimeGate(4, createdAt, 3 * DAY_MS)).toBe('ok');
  });

  it('sub-level within same tier: no gate', () => {
    // level 5 is second sub-level of tier 2 — gate should not apply
    expect(checkDimensionTimeGate(5, 0, 0)).toBe('ok');
  });

  it('tier 11 entry (level 46): requires 800 days', () => {
    const createdAt = 0;
    expect(checkDimensionTimeGate(46, createdAt, 799 * DAY_MS)).toBe('DIMENSION_TIME_GATE');
    expect(checkDimensionTimeGate(46, createdAt, 800 * DAY_MS)).toBe('ok');
  });
});

// ── OmniDex helpers ────────────────────────────────────────────────────────

describe('getOmniDexSlotCount', () => {
  it('tier 1 → 50 slots', () => expect(getOmniDexSlotCount(1)).toBe(50));
  it('tier 4 → 150 slots (tier 3 is last defined ≤ 4)', () => expect(getOmniDexSlotCount(4)).toBe(150));
  it('tier 11 → 5,000 slots', () => expect(getOmniDexSlotCount(11)).toBe(5_000));
});

describe('getOmniDexCompletionPct', () => {
  it('0 species at tier 1 = 0%', () => expect(getOmniDexCompletionPct([], 1)).toBe(0));
  it('50 species at tier 1 = 100%', () => {
    const owned = Array.from({ length: 50 }, (_, i) => `sp-${i}`);
    expect(getOmniDexCompletionPct(owned, 1)).toBe(100);
  });
  it('4,850 species at tier 11 ≥ 97%', () => {
    const owned = Array.from({ length: 4_850 }, (_, i) => `sp-${i}`);
    expect(getOmniDexCompletionPct(owned, 11)).toBeGreaterThanOrEqual(97);
  });
});

// ── checkAlphaUnlock ───────────────────────────────────────────────────────

describe('checkAlphaUnlock', () => {
  const maxOwned = Array.from({ length: 4_850 }, (_, i) => `sp-${i}`);

  it('all prerequisites met → true', () => {
    const state = makeState({
      streak: { streakCount: 1_000, lastClaimDate: '2026-01-01', geneFragmentGranted: true },
      dimensionLevel: 50,
      dimensionTier: 11,
      ownedSpecies: maxOwned,
    });
    expect(checkAlphaUnlock(state)).toBe(true);
  });

  it('streak < 1000 → false', () => {
    const state = makeState({
      streak: { streakCount: 999, lastClaimDate: '2026-01-01', geneFragmentGranted: true },
      dimensionLevel: 50,
      dimensionTier: 11,
      ownedSpecies: maxOwned,
    });
    expect(checkAlphaUnlock(state)).toBe(false);
  });

  it('dimensionLevel < 50 → false', () => {
    const state = makeState({
      streak: { streakCount: 1_000, lastClaimDate: '2026-01-01', geneFragmentGranted: true },
      dimensionLevel: 49,
      dimensionTier: 11,
      ownedSpecies: maxOwned,
    });
    expect(checkAlphaUnlock(state)).toBe(false);
  });

  it('OmniDex < 97% → false', () => {
    const state = makeState({
      streak: { streakCount: 1_000, lastClaimDate: '2026-01-01', geneFragmentGranted: true },
      dimensionLevel: 50,
      dimensionTier: 11,
      ownedSpecies: Array.from({ length: 4_000 }, (_, i) => `sp-${i}`),
    });
    expect(checkAlphaUnlock(state)).toBe(false);
  });
});

// ── currentConditions ──────────────────────────────────────────────────────

describe('currentConditions', () => {
  it('no special conditions active', () => {
    const state = makeState({ ownedSpecies: [] });
    const now = new Date('2026-05-15T10:00:00Z'); // not midnight UTC
    expect(currentConditions(state, now)).toEqual([]);
  });

  it('detects midnight UTC login', () => {
    const state = makeState();
    const midnight = new Date('2026-05-15T00:00:00Z');
    expect(currentConditions(state, midnight)).toContain('midnight_utc_login');
  });

  it('detects Chaotic dimension storm', () => {
    const state = makeState({
      dimensionStorm: {
        activeStabilityClass: 'Chaotic',
        startedAt: 0,
        endsAt: 999999999999,
      },
    });
    const now = new Date('2026-05-15T10:00:00Z');
    expect(currentConditions(state, now)).toContain('dimension_storm_chaotic');
  });

  it('detects streak milestones', () => {
    const state365 = makeState({ streak: { streakCount: 365, lastClaimDate: null, geneFragmentGranted: false } });
    expect(currentConditions(state365)).toContain('streak_exact_365');
    const state500 = makeState({ streak: { streakCount: 500, lastClaimDate: null, geneFragmentGranted: false } });
    expect(currentConditions(state500)).toContain('streak_exact_500');
  });

  it('detects OmniDex milestone at 50%', () => {
    const owned = Array.from({ length: 25 }, (_, i) => `sp-${i}`); // 25/50 = 50%
    const state = makeState({ ownedSpecies: owned, dimensionTier: 1 });
    expect(currentConditions(state)).toContain('omnidex_milestone_50');
  });
});

// ── Server Cycle helpers ───────────────────────────────────────────────────

describe('getAvailableServerCycleSlotCount', () => {
  it('tier 1–3: no slots', () => expect(getAvailableServerCycleSlotCount(3)).toBe(0));
  it('tier 4: 1 slot', () => expect(getAvailableServerCycleSlotCount(4)).toBe(1));
  it('tier 6: 2 slots', () => expect(getAvailableServerCycleSlotCount(6)).toBe(2));
  it('tier 10: 5 slots', () => expect(getAvailableServerCycleSlotCount(10)).toBe(5));
  it('tier 11: still 5 slots (max)', () => expect(getAvailableServerCycleSlotCount(11)).toBe(5));
});

describe('makeServerCycleSlot', () => {
  it('sets hatchesAt = placedAt + 180 days', () => {
    const now = 1_000_000;
    const slot = makeServerCycleSlot('Void', now);
    expect(slot.hatchesAt).toBe(now + SERVER_CYCLE_INCUBATION_MS);
    expect(slot.hatched).toBe(false);
    expect(slot.placedAt).toBe(now);
    expect(slot.eggTier).toBe('Void');
  });
});

describe('checkServerCycleHatches', () => {
  it('no hatches before hatchesAt', () => {
    const slot = makeServerCycleSlot('Stable', 0);
    const { updatedSlots, pendingHatches } = checkServerCycleHatches([slot], slot.hatchesAt - 1);
    expect(pendingHatches).toHaveLength(0);
    expect(updatedSlots[0].hatched).toBe(false);
  });

  it('hatches at or after hatchesAt', () => {
    const slot = makeServerCycleSlot('Void', 0);
    const { updatedSlots, pendingHatches } = checkServerCycleHatches([slot], slot.hatchesAt);
    expect(pendingHatches).toHaveLength(1);
    expect(pendingHatches[0].eggTier).toBe('Void');
    expect(updatedSlots[0].hatched).toBe(true);
  });

  it('already-hatched slot is not re-hatched', () => {
    const slot = { ...makeServerCycleSlot('Apex', 0), hatched: true };
    const { pendingHatches } = checkServerCycleHatches([slot], slot.hatchesAt + 1);
    expect(pendingHatches).toHaveLength(0);
  });
});

// ── validateDimensionPurchase ──────────────────────────────────────────────

describe('validateDimensionPurchase', () => {
  it('rejects when already at max level', () => {
    const state = makeState({ dimensionLevel: 50, energy: 1e20 });
    const result = validateDimensionPurchase(state);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('ALREADY_MAX');
  });

  it('rejects when insufficient energy', () => {
    const state = makeState({ dimensionLevel: 3, energy: 0, accountCreatedAt: 0 });
    const result = validateDimensionPurchase(state, 10 * 24 * 60 * 60 * 1_000); // day 10
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('INSUFFICIENT_ENERGY');
  });

  it('rejects when time gate not met', () => {
    // level 3 → level 4 (tier 2 entry) requires 3 days. Pass day 1.
    const state = makeState({ dimensionLevel: 3, energy: 1_000_000, accountCreatedAt: 0 });
    const result = validateDimensionPurchase(state, 1 * 24 * 60 * 60 * 1_000);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('DIMENSION_TIME_GATE');
  });

  it('succeeds with enough energy and time elapsed', () => {
    const threeDaysMs = 3 * 24 * 60 * 60 * 1_000;
    const state = makeState({ dimensionLevel: 3, energy: 1_000_000, accountCreatedAt: 0 });
    const result = validateDimensionPurchase(state, threeDaysMs);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.newLevel).toBe(4);
      expect(result.newTier).toBe(2);
      expect(result.cost).toBe(1_000);
    }
  });
});

// ── validateServerCycleEggPlacement ───────────────────────────────────────

describe('validateServerCycleEggPlacement', () => {
  it('rejects when slot not unlocked (tier < required)', () => {
    const state = makeState({ dimensionTier: 1, instabilityParticles: 100_000 });
    const result = validateServerCycleEggPlacement(state, 0, 'Stable');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('SLOT_LOCKED');
  });

  it('rejects when slot already occupied', () => {
    const existing = makeServerCycleSlot('Void', 0);
    const state = makeState({ dimensionTier: 4, instabilityParticles: 100_000, serverCycleSlots: [existing] });
    const result = validateServerCycleEggPlacement(state, 0, 'Stable');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('SLOT_OCCUPIED');
  });

  it('rejects when insufficient IP', () => {
    const state = makeState({ dimensionTier: 4, instabilityParticles: 10, serverCycleSlots: [] });
    const result = validateServerCycleEggPlacement(state, 0, 'Stable'); // costs 500 IP
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('INSUFFICIENT_IP');
  });

  it('succeeds with unlocked slot, empty slot, and enough IP', () => {
    const state = makeState({ dimensionTier: 4, instabilityParticles: 1_000, serverCycleSlots: [] });
    const result = validateServerCycleEggPlacement(state, 0, 'Stable');
    expect(result.ok).toBe(true);
  });
});
