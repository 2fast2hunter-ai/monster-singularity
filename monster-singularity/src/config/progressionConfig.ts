// Monster Singularity — Progression Constants
// Source of truth: docs/progression-design.md (AETA-35)
// All numeric balance values live here; do not hardcode in logic files.

// ── Dimension Tier Definitions ─────────────────────────────────────────────

export interface DimensionTierDef {
  tier: number;            // 1–11
  name: string;
  subLevelCount: number;   // levels within this tier
  levelRangeStart: number; // inclusive
  levelRangeEnd: number;   // inclusive
  energyGate: number;      // cumulative energy required to enter this tier
  realTimeDayFloor: number;// minimum account age in days before tier is purchasable
}

export const DIMENSION_TIERS: DimensionTierDef[] = [
  { tier: 1,  name: "Foundation",       subLevelCount: 3, levelRangeStart: 1,  levelRangeEnd: 3,  energyGate: 0,                realTimeDayFloor: 0   },
  { tier: 2,  name: "Resonant",         subLevelCount: 4, levelRangeStart: 4,  levelRangeEnd: 7,  energyGate: 1_000,            realTimeDayFloor: 3   },
  { tier: 3,  name: "Fractured",        subLevelCount: 4, levelRangeStart: 8,  levelRangeEnd: 11, energyGate: 50_000,           realTimeDayFloor: 10  },
  { tier: 4,  name: "Crystalline",      subLevelCount: 5, levelRangeStart: 12, levelRangeEnd: 16, energyGate: 500_000,          realTimeDayFloor: 25  },
  { tier: 5,  name: "Void-Touched",     subLevelCount: 5, levelRangeStart: 17, levelRangeEnd: 21, energyGate: 5_000_000,        realTimeDayFloor: 60  },
  { tier: 6,  name: "Abyssal",          subLevelCount: 5, levelRangeStart: 22, levelRangeEnd: 26, energyGate: 50_000_000,       realTimeDayFloor: 120 },
  { tier: 7,  name: "Singularity Edge", subLevelCount: 5, levelRangeStart: 27, levelRangeEnd: 31, energyGate: 500_000_000,      realTimeDayFloor: 200 },
  { tier: 8,  name: "Reality-Broken",   subLevelCount: 5, levelRangeStart: 32, levelRangeEnd: 36, energyGate: 5_000_000_000,    realTimeDayFloor: 300 },
  { tier: 9,  name: "Null-Space",       subLevelCount: 5, levelRangeStart: 37, levelRangeEnd: 41, energyGate: 50_000_000_000,   realTimeDayFloor: 450 },
  { tier: 10, name: "Precipice",        subLevelCount: 4, levelRangeStart: 42, levelRangeEnd: 45, energyGate: 500_000_000_000,  realTimeDayFloor: 600 },
  { tier: 11, name: "Apex",             subLevelCount: 5, levelRangeStart: 46, levelRangeEnd: 50, energyGate: 5_000_000_000_000,realTimeDayFloor: 800 },
];

export const DIMENSION_LEVEL_MAX = 50;
export const DIMENSION_TIER_MAX = 11;

// Multipliers for sub-levels within a tier (index = 0-based sub-level position)
export const SUB_LEVEL_ENERGY_MULTIPLIERS = [1.0, 2.5, 6.0, 15.0, 40.0] as const;

// ── Alpha Entity Prerequisites ─────────────────────────────────────────────

export const ALPHA_ENTITY_STREAK_REQUIRED = 1_000;   // consecutive daily logins
export const ALPHA_ENTITY_DIMENSION_LEVEL_REQUIRED = 50;
export const ALPHA_ENTITY_OMNIDEX_PCT_REQUIRED = 97; // percent (0–100)

// ── OmniDex Slot Counts by Tier ────────────────────────────────────────────

export const OMNIDEX_SLOTS_BY_TIER: Record<number, number> = {
  1: 50,
  2: 100,
  3: 150,
  5: 300,
  7: 600,
  9: 1_000,
  10: 2_000,
  11: 5_000,
};

// ── Server Cycle (Legendary Egg) Constants ─────────────────────────────────

export const SERVER_CYCLE_INCUBATION_DAYS = 180;
export const SERVER_CYCLE_INCUBATION_MS = SERVER_CYCLE_INCUBATION_DAYS * 24 * 60 * 60 * 1_000;

export const SERVER_CYCLE_SLOT_UNLOCK_TIER: Record<number, number> = {
  1: 4,  // slot 1 unlocks at tier 4
  2: 6,
  3: 8,
  4: 9,
  5: 10,
};
export const SERVER_CYCLE_SLOT_MAX = 5;

export type EggTier = "Stable" | "Void" | "Apex";

export const EGG_IP_COST: Record<EggTier, number> = {
  Stable: 500,
  Void:   5_000,
  Apex:   50_000,
};

export const EGG_RESULT_RARITY: Record<EggTier, string> = {
  Stable: "Rare",
  Void:   "Legendary",
  Apex:   "Singularity",
};

// IP refund percentage when egg hatches a duplicate (no OmniDex slot filled)
export const EGG_DUPLICATE_IP_REFUND_PCT = 20;

// ── Energy Production Scaling ──────────────────────────────────────────────

// Base energy production per second at dimension level d:
//   baseProduction(d) = BASE_PRODUCTION_SEED × (PRODUCTION_GROWTH_BASE ^ (d - 1))
export const BASE_PRODUCTION_SEED = 1.0;
export const PRODUCTION_GROWTH_BASE = 3.5;

// ── Login Streak Milestone Species ────────────────────────────────────────

export const STREAK_MILESTONE_SPECIES: { streakDay: number; speciesId: string }[] = [
  { streakDay: 100,  speciesId: "MS-STREAK-100" },
  { streakDay: 200,  speciesId: "MS-STREAK-200" },
  { streakDay: 365,  speciesId: "MS-CIRCADIAN-DRAKE" },   // "Circadian Drake"
  { streakDay: 500,  speciesId: "MS-CHRONOLITH-GOLEM" },  // "Chronolith Golem"
  { streakDay: 730,  speciesId: "MS-BIENNIAL-SERPENT" },  // "Biennial Serpent"
  { streakDay: 1000, speciesId: "MS-ALPHA-HERALD" },
];

// ── OmniDex Completion Milestone Unlocks ──────────────────────────────────

export const OMNIDEX_MILESTONE_SPECIES: { pct: number; speciesIds: string[] }[] = [
  { pct: 50, speciesIds: ["MS-OMD-050A", "MS-OMD-050B"] },
  { pct: 75, speciesIds: ["MS-OMD-075A", "MS-OMD-075B", "MS-OMD-075C"] },
  { pct: 90, speciesIds: ["MS-OMD-090A", "MS-OMD-090B", "MS-OMD-090C", "MS-OMD-090D", "MS-OMD-090E"] },
];

// ── Condition-Specific Species Conditions ────────────────────────────────

export type AcquisitionCondition =
  | "dimension_storm_chaotic"
  | "dimension_storm_reality_warping"
  | "streak_exact_365"
  | "streak_exact_500"
  | "streak_exact_730"
  | "midnight_utc_login"
  | "server_cycle_apex_egg"
  | "breed_two_legendary_same_species"
  | "omnidex_milestone_50"
  | "omnidex_milestone_75"
  | "omnidex_milestone_90";
