import {
  GeneBase,
  GeneSequence,
  MonsterSpecies,
  BreedingPair,
  BreedingPreview,
  BreedingOutcome,
  InstabilityEvent,
  StabilityClass,
  SpecialTrait,
  STABILITY_CLASS_ORDER,
  PRODUCTION_COEFF,
  INSTABILITY_COST_COEFF,
  STABILITY_SHIFT,
  RARITY_WEIGHT,
  MUTATION_AFFINITY,
  SPECIAL_TRAIT_UNLOCK,
} from "./types";

// ── Gene Combination ──────────────────────────────────────────────────────────
// Each position: randomly inherited from either parent (50/50), then maybe mutated.

function combineBases(
  a: GeneBase,
  b: GeneBase,
  mutationAffinity: number,
  rng: () => number,
): GeneBase {
  const ALL_BASES: GeneBase[] = ["A","B","C","D","E","F","G","H"];
  const inherited = rng() < 0.5 ? a : b;
  if (rng() < mutationAffinity) {
    return ALL_BASES[Math.floor(rng() * ALL_BASES.length)];
  }
  return inherited;
}

export function combineSequences(
  seqA: GeneSequence,
  seqB: GeneSequence,
  rng: () => number = Math.random,
): GeneSequence {
  const avgMutation = seqA.map((_, i) =>
    (MUTATION_AFFINITY[seqA[i]] + MUTATION_AFFINITY[seqB[i]]) / 2,
  );

  return seqA.map((baseA, i) =>
    combineBases(baseA, seqB[i], avgMutation[i], rng),
  ) as GeneSequence;
}

// ── Derived Stats from Sequence ───────────────────────────────────────────────

export function deriveProductionRate(seq: GeneSequence, baseRate = 1.0): number {
  return baseRate * PRODUCTION_COEFF[seq[0]];
}

export function deriveInstabilityParticleCost(seq: GeneSequence): number {
  return INSTABILITY_COST_COEFF[seq[1]];
}

export function deriveStabilityClass(seq: GeneSequence, parentClass: StabilityClass): StabilityClass {
  const baseIdx = STABILITY_CLASS_ORDER.indexOf(parentClass);
  const shift = STABILITY_SHIFT[seq[2]];
  const clamped = Math.min(
    STABILITY_CLASS_ORDER.length - 1,
    Math.max(0, baseIdx + shift),
  );
  return STABILITY_CLASS_ORDER[clamped];
}

export function deriveSpecialTrait(seq: GeneSequence): SpecialTrait {
  return SPECIAL_TRAIT_UNLOCK[seq[5]];
}

// ── Instability Risk Calculation ──────────────────────────────────────────────
// Risk is driven by: high instability cost, Aberrant/Reality-Warping parents,
// and high mutation affinity bases.

export function calculateInstabilityRisk(pair: BreedingPair, offspringSeq: GeneSequence): number {
  const stabilityPenalty: Record<StabilityClass, number> = {
    "Stable": 0.0,
    "Volatile": 0.1,
    "Chaotic": 0.25,
    "Aberrant": 0.45,
    "Reality-Warping": 0.70,
  };

  const parentRisk =
    (stabilityPenalty[pair.parentA.stabilityClass] +
      stabilityPenalty[pair.parentB.stabilityClass]) /
    2;

  const costRisk = Math.min(1, deriveInstabilityParticleCost(offspringSeq) / 10);
  const mutationRisk = MUTATION_AFFINITY[offspringSeq[4]];

  return Math.min(1, parentRisk * 0.5 + costRisk * 0.3 + mutationRisk * 0.2);
}

function riskLabel(risk: number): BreedingPreview["riskLabel"] {
  if (risk < 0.2) return "Safe";
  if (risk < 0.45) return "Risky";
  if (risk < 0.7) return "Dangerous";
  return "Critical";
}

// ── Breeding Preview (shown to player before confirming) ──────────────────────

export function previewBreeding(
  pair: BreedingPair,
  rng: () => number = Math.random,
): BreedingPreview {
  const offspringSeq = combineSequences(
    pair.parentA.geneSequence,
    pair.parentB.geneSequence,
    rng,
  );

  const dominantParentClass =
    STABILITY_CLASS_ORDER.indexOf(pair.parentA.stabilityClass) >=
    STABILITY_CLASS_ORDER.indexOf(pair.parentB.stabilityClass)
      ? pair.parentA.stabilityClass
      : pair.parentB.stabilityClass;

  const predictedStability = deriveStabilityClass(offspringSeq, dominantParentClass);
  const risk = calculateInstabilityRisk(pair, offspringSeq);
  const production = deriveProductionRate(offspringSeq, 1.0);
  const particleCost = deriveInstabilityParticleCost(offspringSeq);
  const special = deriveSpecialTrait(offspringSeq);

  const outcomes: BreedingOutcome[] = buildPotentialOutcomes(risk, predictedStability);

  return {
    offspringSequence: offspringSeq,
    predictedStabilityClass: predictedStability,
    instabilityRisk: risk,
    riskLabel: riskLabel(risk),
    estimatedProductionRate: production,
    estimatedInstabilityParticleCost: particleCost,
    estimatedSpecialTrait: special,
    potentialOutcomes: outcomes,
  };
}

function buildPotentialOutcomes(risk: number, stability: StabilityClass): BreedingOutcome[] {
  const outcomes: BreedingOutcome[] = [];

  if (risk < 0.7) {
    outcomes.push({ kind: "success", offspringId: "pending-assignment" });
  }

  if (risk > 0.1) {
    outcomes.push({
      kind: "instability_damage",
      baseDamagePercent: Math.round(risk * 40),
      productionLossPercent: Math.round(risk * 60),
    });
  }

  if (risk > 0.3) {
    outcomes.push({
      kind: "mutation",
      mutatedSequence: ["A","A","A","A","A","A"],
    });
  }

  if (stability === "Reality-Warping" && risk > 0.6) {
    outcomes.push({
      kind: "destruction",
      message: "Reality-Warping instability cascade — base sector destroyed.",
    });
  }

  return outcomes;
}

// ── Confirmed Breeding Resolution ─────────────────────────────────────────────

export interface BreedingResult {
  success: boolean;
  offspringSpeciesId?: string;
  instabilityEvent?: InstabilityEvent;
  mutatedSequence?: GeneSequence;
  baseDestroyed?: boolean;
}

export function resolveBreeding(
  pair: BreedingPair,
  preview: BreedingPreview,
  rng: () => number = Math.random,
): BreedingResult {
  const roll = rng();

  // Catastrophic destruction
  if (
    preview.predictedStabilityClass === "Reality-Warping" &&
    preview.instabilityRisk > 0.6 &&
    roll < preview.instabilityRisk * 0.3
  ) {
    return {
      success: false,
      baseDestroyed: true,
      instabilityEvent: makeInstabilityEvent(pair, "catastrophic"),
    };
  }

  // Major instability — damage + production loss, no offspring
  if (roll < preview.instabilityRisk * 0.5) {
    const severity = preview.instabilityRisk > 0.6 ? "major" : "minor";
    return {
      success: false,
      instabilityEvent: makeInstabilityEvent(pair, severity),
    };
  }

  // Mutation — offspring exists but with scrambled sequence
  if (roll < preview.instabilityRisk) {
    const mutated = scrambleSequence(preview.offspringSequence, rng);
    return {
      success: true,
      offspringSpeciesId: "mutant-pending",
      mutatedSequence: mutated,
    };
  }

  // Clean success
  return { success: true, offspringSpeciesId: "pending-assignment" };
}

function makeInstabilityEvent(
  pair: BreedingPair,
  severity: InstabilityEvent["severity"],
): InstabilityEvent {
  const dmg = severity === "catastrophic" ? 80 : severity === "major" ? 40 : 10;
  return {
    triggeredBy: `${pair.parentA.id}+${pair.parentB.id}`,
    timestamp: Date.now(),
    severity,
    baseDamagePercent: dmg,
    productionLossPercent: dmg * 1.5,
    productionLossDurationSec: severity === "catastrophic" ? 3600 : severity === "major" ? 900 : 120,
    message: `Breeding instability event: ${severity} cascade from ${pair.parentA.name} × ${pair.parentB.name}`,
  };
}

function scrambleSequence(seq: GeneSequence, rng: () => number): GeneSequence {
  const ALL_BASES: GeneBase[] = ["A","B","C","D","E","F","G","H"];
  return seq.map((b) =>
    rng() < 0.4 ? ALL_BASES[Math.floor(rng() * ALL_BASES.length)] : b,
  ) as GeneSequence;
}
