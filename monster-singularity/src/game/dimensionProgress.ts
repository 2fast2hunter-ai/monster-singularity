// Dimension progression logic — spec source: docs/progression-design.md (AETA-35)
// All constants live in progressionConfig.ts; never hardcode here.

import {
  DIMENSION_TIERS,
  DIMENSION_LEVEL_MAX,
  SUB_LEVEL_ENERGY_MULTIPLIERS,
  SERVER_CYCLE_INCUBATION_MS,
  SERVER_CYCLE_SLOT_UNLOCK_TIER,
  SERVER_CYCLE_SLOT_MAX,
  EGG_IP_COST,

  ALPHA_ENTITY_STREAK_REQUIRED,
  ALPHA_ENTITY_DIMENSION_LEVEL_REQUIRED,
  ALPHA_ENTITY_OMNIDEX_PCT_REQUIRED,
  OMNIDEX_SLOTS_BY_TIER,
} from '../config/progressionConfig';
import type { EggTier, AcquisitionCondition } from '../config/progressionConfig';
import type { GameState, ServerCycleSlot } from './types';

// ── Tier / Level Helpers ───────────────────────────────────────────────────

export function getTierForLevel(level: number): number {
  for (let i = DIMENSION_TIERS.length - 1; i >= 0; i--) {
    if (level >= DIMENSION_TIERS[i].levelRangeStart) return DIMENSION_TIERS[i].tier;
  }
  return 1;
}

// Energy cost to purchase the next dimension level (current + 1).
// Returns null when already at max.
export function getNextSubLevelCost(currentLevel: number): number | null {
  if (currentLevel >= DIMENSION_LEVEL_MAX) return null;
  const nextLevel = currentLevel + 1;
  const tierDef = DIMENSION_TIERS.find(
    (t) => nextLevel >= t.levelRangeStart && nextLevel <= t.levelRangeEnd,
  );
  if (!tierDef) return null;
  const subLevelIndex = nextLevel - tierDef.levelRangeStart; // 0-based
  const multiplier = SUB_LEVEL_ENERGY_MULTIPLIERS[subLevelIndex] ?? 1.0;
  return Math.floor(tierDef.energyGate * multiplier);
}

// Real-time floor gate — only applies to the first sub-level of each tier.
// Returns 'ok' or 'DIMENSION_TIME_GATE'.
export function checkDimensionTimeGate(
  nextLevel: number,
  accountCreatedAt: number,
  now: number = Date.now(),
): 'ok' | 'DIMENSION_TIME_GATE' {
  const tierDef = DIMENSION_TIERS.find(
    (t) => nextLevel >= t.levelRangeStart && nextLevel <= t.levelRangeEnd,
  );
  if (!tierDef) return 'ok';
  if (nextLevel !== tierDef.levelRangeStart) return 'ok'; // gate is per-tier entry only
  const dayFloorMs = tierDef.realTimeDayFloor * 24 * 60 * 60 * 1_000;
  return now - accountCreatedAt >= dayFloorMs ? 'ok' : 'DIMENSION_TIME_GATE';
}

// ── OmniDex Helpers ────────────────────────────────────────────────────────

export function getOmniDexSlotCount(dimensionTier: number): number {
  for (let t = dimensionTier; t >= 1; t--) {
    if (OMNIDEX_SLOTS_BY_TIER[t] !== undefined) return OMNIDEX_SLOTS_BY_TIER[t];
  }
  return 50;
}

export function getOmniDexCompletionPct(
  ownedSpecies: string[],
  dimensionTier: number,
): number {
  const slots = getOmniDexSlotCount(dimensionTier);
  return Math.min(100, (ownedSpecies.length / slots) * 100);
}

// ── Alpha Entity Unlock Check ──────────────────────────────────────────────

export function checkAlphaUnlock(state: GameState): boolean {
  if (state.streak.streakCount < ALPHA_ENTITY_STREAK_REQUIRED) return false;
  if (state.dimensionLevel < ALPHA_ENTITY_DIMENSION_LEVEL_REQUIRED) return false;
  const pct = getOmniDexCompletionPct(state.ownedSpecies, state.dimensionTier);
  if (pct < ALPHA_ENTITY_OMNIDEX_PCT_REQUIRED) return false;
  return true;
}

// ── Condition-Specific Species Helper ─────────────────────────────────────

export function currentConditions(state: GameState, now: Date = new Date()): AcquisitionCondition[] {
  const conditions: AcquisitionCondition[] = [];

  if (state.dimensionStorm) {
    if (state.dimensionStorm.activeStabilityClass === 'Chaotic') {
      conditions.push('dimension_storm_chaotic');
    } else if (state.dimensionStorm.activeStabilityClass === 'Reality-Warping') {
      conditions.push('dimension_storm_reality_warping');
    }
  }

  const streak = state.streak.streakCount;
  if (streak === 365) conditions.push('streak_exact_365');
  if (streak === 500) conditions.push('streak_exact_500');
  if (streak === 730) conditions.push('streak_exact_730');

  if (now.getUTCHours() === 0) conditions.push('midnight_utc_login');

  const pct = getOmniDexCompletionPct(state.ownedSpecies, state.dimensionTier);
  if (pct >= 50) conditions.push('omnidex_milestone_50');
  if (pct >= 75) conditions.push('omnidex_milestone_75');
  if (pct >= 90) conditions.push('omnidex_milestone_90');

  return conditions;
}

// ── Server Cycle Helpers ───────────────────────────────────────────────────

export function getAvailableServerCycleSlotCount(dimensionTier: number): number {
  let count = 0;
  for (let slot = 1; slot <= SERVER_CYCLE_SLOT_MAX; slot++) {
    if (dimensionTier >= (SERVER_CYCLE_SLOT_UNLOCK_TIER[slot] ?? 99)) count++;
  }
  return count;
}

export function makeServerCycleSlot(eggTier: EggTier, now: number = Date.now()): ServerCycleSlot {
  return {
    eggTier,
    placedAt: now,
    hatchesAt: now + SERVER_CYCLE_INCUBATION_MS,
    hatched: false,
  };
}

export interface ServerCycleHatchResult {
  slotIndex: number;
  eggTier: EggTier;
  // speciesId is null when the hatch yields a duplicate (real resolution via sha256 seed
  // uses player_id + slot_id + placedAt; that lookup lives in the retention API layer)
  speciesId: string | null;
  ipRefunded: number;
}

// Called on session start. Returns results for any slots whose hatchesAt has passed.
// Marks those slots as hatched; the caller should update state.serverCycleSlots.
export function checkServerCycleHatches(
  slots: ServerCycleSlot[],
  now: number = Date.now(),
): { updatedSlots: ServerCycleSlot[]; pendingHatches: Pick<ServerCycleHatchResult, 'slotIndex' | 'eggTier'>[] } {
  const pendingHatches: Pick<ServerCycleHatchResult, 'slotIndex' | 'eggTier'>[] = [];
  const updatedSlots = slots.map((slot, i) => {
    if (!slot.hatched && now >= slot.hatchesAt) {
      pendingHatches.push({ slotIndex: i, eggTier: slot.eggTier });
      return { ...slot, hatched: true };
    }
    return slot;
  });
  return { updatedSlots, pendingHatches };
}

// ── Purchase Action Validation ─────────────────────────────────────────────

export type DimensionPurchaseError =
  | 'ALREADY_MAX'
  | 'INSUFFICIENT_ENERGY'
  | 'DIMENSION_TIME_GATE';

export type DimensionPurchaseResult =
  | { ok: true; newLevel: number; newTier: number; cost: number }
  | { ok: false; error: DimensionPurchaseError; daysRemaining?: number };

export function validateDimensionPurchase(
  state: GameState,
  now: number = Date.now(),
): DimensionPurchaseResult {
  const currentLevel = state.dimensionLevel;
  if (currentLevel >= DIMENSION_LEVEL_MAX) return { ok: false, error: 'ALREADY_MAX' };

  const cost = getNextSubLevelCost(currentLevel);
  if (cost === null) return { ok: false, error: 'ALREADY_MAX' };
  if (state.energy < cost) return { ok: false, error: 'INSUFFICIENT_ENERGY' };

  const nextLevel = currentLevel + 1;
  const gateResult = checkDimensionTimeGate(nextLevel, state.accountCreatedAt, now);
  if (gateResult === 'DIMENSION_TIME_GATE') {
    const tierDef = DIMENSION_TIERS.find(
      (t) => nextLevel >= t.levelRangeStart && nextLevel <= t.levelRangeEnd,
    );
    const dayFloorMs = (tierDef?.realTimeDayFloor ?? 0) * 24 * 60 * 60 * 1_000;
    const daysRemaining = Math.ceil(
      (dayFloorMs - (now - state.accountCreatedAt)) / (24 * 60 * 60 * 1_000),
    );
    return { ok: false, error: 'DIMENSION_TIME_GATE', daysRemaining };
  }

  return {
    ok: true,
    newLevel: nextLevel,
    newTier: getTierForLevel(nextLevel),
    cost,
  };
}

export type ServerCyclePlaceError =
  | 'SLOT_LOCKED'
  | 'SLOT_OCCUPIED'
  | 'INSUFFICIENT_IP'
  | 'INVALID_SLOT';

export type ServerCyclePlaceResult =
  | { ok: true; slot: ServerCycleSlot; slotIndex: number }
  | { ok: false; error: ServerCyclePlaceError };

export function validateServerCycleEggPlacement(
  state: GameState,
  slotIndex: number,
  eggTier: EggTier,
  now: number = Date.now(),
): ServerCyclePlaceResult {
  const availableCount = getAvailableServerCycleSlotCount(state.dimensionTier);
  if (slotIndex < 0 || slotIndex >= availableCount) {
    return { ok: false, error: slotIndex >= SERVER_CYCLE_SLOT_MAX ? 'INVALID_SLOT' : 'SLOT_LOCKED' };
  }
  const existing = state.serverCycleSlots[slotIndex];
  if (existing && !existing.hatched) {
    return { ok: false, error: 'SLOT_OCCUPIED' };
  }
  const ipCost = EGG_IP_COST[eggTier];
  if (state.instabilityParticles < ipCost) {
    return { ok: false, error: 'INSUFFICIENT_IP' };
  }
  return { ok: true, slot: makeServerCycleSlot(eggTier, now), slotIndex };
}
