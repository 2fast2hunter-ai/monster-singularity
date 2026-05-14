// Monster Singularity — Core Data Model
// Monster schema, gene system, breeding mechanics

// ── Stability Classes ──────────────────────────────────────────────────────────

export type StabilityClass =
  | "Stable"
  | "Volatile"
  | "Chaotic"
  | "Aberrant"
  | "Reality-Warping";

export const STABILITY_CLASS_ORDER: StabilityClass[] = [
  "Stable",
  "Volatile",
  "Chaotic",
  "Aberrant",
  "Reality-Warping",
];

// ── Rarity Tiers ──────────────────────────────────────────────────────────────

export type RarityTier =
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Legendary"
  | "Singularity";

// ── Gene Alphabet ─────────────────────────────────────────────────────────────
// 8 nucleobases (A-H). Sequences are 6 bases long.
// Each position modifies a trait domain.

export type GeneBase = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export type GeneSequence = [
  GeneBase, // position 0 → Production multiplier domain
  GeneBase, // position 1 → Instability particle cost domain
  GeneBase, // position 2 → Stability class modifier
  GeneBase, // position 3 → Rarity pressure domain
  GeneBase, // position 4 → Mutation affinity domain
  GeneBase, // position 5 → Special trait unlock domain
];

// ── Trait Mappings ────────────────────────────────────────────────────────────
// Each gene base maps to a coefficient for its domain.

export const PRODUCTION_COEFF: Record<GeneBase, number> = {
  A: 1.0, B: 1.5, C: 2.0, D: 0.5,
  E: 3.0, F: 0.8, G: 4.0, H: 0.25,
};

export const INSTABILITY_COST_COEFF: Record<GeneBase, number> = {
  A: 0.0,  B: 0.5, C: 1.0, D: 2.0,
  E: 3.5,  F: 1.5, G: 5.0, H: 0.0,
};

// How much a position-2 base shifts stability class (index offset)
export const STABILITY_SHIFT: Record<GeneBase, number> = {
  A: 0, B: 0, C: 1, D: 1, E: 2, F: -1, G: 2, H: -1,
};

export const RARITY_WEIGHT: Record<GeneBase, number> = {
  A: 10, B: 8, C: 6, D: 4, E: 2, F: 1, G: 0.5, H: 0.1,
};

// Mutation affinity: how easily offspring mutate (0–1 scale per base)
export const MUTATION_AFFINITY: Record<GeneBase, number> = {
  A: 0.02, B: 0.05, C: 0.08, D: 0.12,
  E: 0.18, F: 0.25, G: 0.35, H: 0.50,
};

// Special trait unlocked when position-5 base matches unlock table
export type SpecialTrait =
  | "none"
  | "acid_spray"
  | "temporal_rift"
  | "mind_shatter"
  | "void_drain"
  | "reality_bleed"
  | "echo_collapse"
  | "singularity_pulse";

export const SPECIAL_TRAIT_UNLOCK: Record<GeneBase, SpecialTrait> = {
  A: "none",
  B: "acid_spray",
  C: "temporal_rift",
  D: "mind_shatter",
  E: "void_drain",
  F: "reality_bleed",
  G: "echo_collapse",
  H: "singularity_pulse",
};

// ── Monster Species ───────────────────────────────────────────────────────────

export interface MonsterSpecies {
  id: string;                        // e.g. "MS-0001"
  name: string;
  stabilityClass: StabilityClass;
  rarityTier: RarityTier;
  baseProductionRate: number;        // resources/sec at level 1
  instabilityParticleCost: number;   // particles/sec consumed (0 = none)
  geneSequence: GeneSequence;
  specialTrait: SpecialTrait;
  description: string;
  unlockCondition?: string;          // optional — e.g. "breed MS-0003 + MS-0017"
  omniDexSlot: number;               // 1–10000; catalogue position
  dimension?: 1 | 2 | 3;            // dimensional origin; 1 = default
}

// ── Breeding System ───────────────────────────────────────────────────────────

export interface BreedingPair {
  parentA: MonsterSpecies;
  parentB: MonsterSpecies;
}

export interface BreedingPreview {
  offspringSequence: GeneSequence;
  predictedStabilityClass: StabilityClass;
  instabilityRisk: number;           // 0–1; shown to player pre-confirm
  riskLabel: "Safe" | "Risky" | "Dangerous" | "Critical";
  estimatedProductionRate: number;
  estimatedInstabilityParticleCost: number;
  estimatedSpecialTrait: SpecialTrait;
  potentialOutcomes: BreedingOutcome[];
}

export type BreedingOutcome =
  | { kind: "success"; offspringId: string }
  | { kind: "instability_damage"; baseDamagePercent: number; productionLossPercent: number }
  | { kind: "mutation"; mutatedSequence: GeneSequence }
  | { kind: "destruction"; message: string };

// ── Instability Events ────────────────────────────────────────────────────────

export interface InstabilityEvent {
  triggeredBy: string;               // species id
  timestamp: number;                 // unix ms
  severity: "minor" | "major" | "catastrophic";
  baseDamagePercent: number;         // 0–100
  productionLossPercent: number;     // 0–100; duration-based
  productionLossDurationSec: number;
  message: string;
}
