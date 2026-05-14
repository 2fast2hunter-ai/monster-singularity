import type { Upgrade } from './types';
import type { StabilityClass } from './monster/types';

export interface ContainmentUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  containedClass: StabilityClass;
  /** soft: placement allowed uncontained, but 2× severity penalty applies */
  gateType: 'soft' | 'hard';
  purchased: boolean;
}

export const CONTAINMENT_GATE_DEFINITIONS: ContainmentUpgrade[] = [
  {
    id: 'containment_volatile',
    name: 'Volatile Containment (Tier 1)',
    description: 'Removes 2× severity penalty for Volatile monsters. Softens runaway events.',
    cost: 500,
    containedClass: 'Volatile',
    gateType: 'soft',
    purchased: false,
  },
  {
    id: 'containment_chaotic',
    name: 'Chaotic Containment (Tier 2)',
    description: 'Removes 2× severity penalty for Chaotic monsters. Softens runaway events.',
    cost: 5_000,
    containedClass: 'Chaotic',
    gateType: 'soft',
    purchased: false,
  },
  {
    id: 'containment_aberrant',
    name: 'Aberrant Containment (Tier 3)',
    description: 'Unlocks Bio-Reactor placement for Aberrant-class monsters.',
    cost: 50_000,
    containedClass: 'Aberrant',
    gateType: 'hard',
    purchased: false,
  },
  {
    id: 'containment_reality_warping',
    name: 'Reality-Warping Containment (Tier 4)',
    description: 'Unlocks Bio-Reactor placement for Reality-Warping-class monsters.',
    cost: 500_000,
    containedClass: 'Reality-Warping',
    gateType: 'hard',
    purchased: false,
  },
];

const HARD_GATE_CLASSES: ReadonlySet<StabilityClass> = new Set([
  'Aberrant',
  'Reality-Warping',
]);

/**
 * Returns true when the player may place a monster of the given stability class.
 * Hard gates block placement until the matching containment upgrade is purchased.
 */
export function canPlaceStabilityClass(
  stabilityClass: StabilityClass,
  purchasedContainment: string[],
): boolean {
  if (!HARD_GATE_CLASSES.has(stabilityClass)) return true;
  const gate = CONTAINMENT_GATE_DEFINITIONS.find((g) => g.containedClass === stabilityClass);
  return gate ? purchasedContainment.includes(gate.id) : false;
}

/** Returns the set of stability classes for which containment has been purchased. */
export function getContainedClasses(purchasedContainment: string[]): Set<StabilityClass> {
  const result = new Set<StabilityClass>();
  for (const gate of CONTAINMENT_GATE_DEFINITIONS) {
    if (purchasedContainment.includes(gate.id)) result.add(gate.containedClass);
  }
  return result;
}

export const UPGRADE_DEFINITIONS: Upgrade[] = [
  {
    id: 'efficiency_1',
    name: 'Cellular Efficiency I',
    description: '+50% energy output from all monsters',
    cost: 50,
    multiplier: 1.5,
    purchased: false,
  },
  {
    id: 'efficiency_2',
    name: 'Cellular Efficiency II',
    description: 'Double energy output from all monsters',
    cost: 500,
    multiplier: 2.0,
    purchased: false,
    unlockAt: 200,
  },
  {
    id: 'metabolic_surge',
    name: 'Metabolic Surge',
    description: 'Bio-electric output tripled',
    cost: 5_000,
    multiplier: 3.0,
    purchased: false,
    unlockAt: 2_000,
  },
  {
    id: 'quantum_absorption',
    name: 'Quantum Absorption',
    description: 'Energy absorption becomes non-linear (+5×)',
    cost: 50_000,
    multiplier: 5.0,
    purchased: false,
    unlockAt: 20_000,
  },
  {
    id: 'void_resonance',
    name: 'Void Resonance',
    description: 'Tap into dimensional energy streams (+10×)',
    cost: 500_000,
    multiplier: 10.0,
    purchased: false,
    unlockAt: 200_000,
  },
  {
    id: 'singularity_pulse',
    name: 'Singularity Pulse',
    description: 'Reality fractures grant exponential yield (+25×)',
    cost: 5_000_000,
    multiplier: 25.0,
    purchased: false,
    unlockAt: 2_000_000,
  },
];
