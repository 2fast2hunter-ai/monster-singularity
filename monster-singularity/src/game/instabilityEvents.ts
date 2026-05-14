import type { Monster } from './types';
import type { StabilityClass } from './monster/types';

export type EventSeverity = 'minor' | 'major' | 'catastrophic';

export interface RunawayEvent {
  monsterId: string;
  severity: EventSeverity;
  productionLossFraction: number;
  durationSec: number;
  hpDamageFraction: number;
  startedAt: number;
}

// P(event/s) = 1 - (1 - hourlyRate)^(1/3600)
export const TICK_PROBABILITIES: Partial<Record<StabilityClass, number>> = {
  Volatile: 1 - Math.pow(1 - 0.005, 1 / 3600),        // ~0.00000139/s
  Chaotic: 1 - Math.pow(1 - 0.02, 1 / 3600),           // ~0.00000559/s
  Aberrant: 1 - Math.pow(1 - 0.06, 1 / 3600),          // ~0.0000172/s
  'Reality-Warping': 1 - Math.pow(1 - 0.15, 1 / 3600), // ~0.0000454/s
};

export const SEVERITY_PARAMS: Record<EventSeverity, {
  productionLossFraction: number;
  durationSec: number;
  hpDamageFraction: number;
}> = {
  minor:        { productionLossFraction: 0.10, durationSec: 120,  hpDamageFraction: 0.00 },
  major:        { productionLossFraction: 0.35, durationSec: 900,  hpDamageFraction: 0.05 },
  catastrophic: { productionLossFraction: 0.75, durationSec: 3600, hpDamageFraction: 0.25 },
};

const SEVERITY_THRESHOLDS: Array<[EventSeverity, number]> = [
  ['minor', 0.60],
  ['major', 0.90],
  ['catastrophic', 1.00],
];

function rollSeverity(): EventSeverity {
  const r = Math.random();
  let cumulative = 0;
  for (const [severity, weight] of SEVERITY_THRESHOLDS) {
    cumulative += weight - (cumulative > 0 ? SEVERITY_THRESHOLDS[SEVERITY_THRESHOLDS.findIndex(([s]) => s === severity) - 1]?.[1] ?? 0 : 0);
    if (r < cumulative) return severity;
  }
  return 'catastrophic';
}

function pickSeverity(): EventSeverity {
  const r = Math.random();
  if (r < 0.60) return 'minor';
  if (r < 0.90) return 'major';
  return 'catastrophic';
}

const FARM_EVENT_COOLDOWN_MS = 60_000;
const SOFT_GATE_PROB_MULTIPLIER = 1.5;
const IP_STARVATION_PROB_MULTIPLIER = 2.0;

/**
 * Rolls runaway events for all active monsters in a single game tick (1 second).
 * @param containedClasses - StabilityClass values with a purchased containment upgrade.
 * @param lastFarmEventAt - timestamp (ms) of the last runaway event on this farm; enforces 60s hard cap.
 * @param ipDepleted - true when GameState.instabilityParticles <= 0; doubles event probability.
 */
export function rollInstabilityEvents(
  monsters: Monster[],
  containedClasses: Set<StabilityClass>,
  now: number,
  lastFarmEventAt: number | undefined,
  ipDepleted: boolean,
): RunawayEvent[] {
  // Hard cap: at most 1 runaway event per farm per 60 seconds
  if (lastFarmEventAt !== undefined && now - lastFarmEventAt < FARM_EVENT_COOLDOWN_MS) {
    return [];
  }

  const events: RunawayEvent[] = [];

  for (const monster of monsters) {
    const baseProb = TICK_PROBABILITIES[monster.stabilityClass];
    if (baseProb === undefined) continue; // Stable: no events

    const isContained = containedClasses.has(monster.stabilityClass);

    // Soft-gate: uncontained Volatile/Chaotic get +50% event probability
    const softGateMult = !isContained ? SOFT_GATE_PROB_MULTIPLIER : 1;
    // IP starvation: 2× probability when instabilityParticles depleted
    const ipMult = ipDepleted ? IP_STARVATION_PROB_MULTIPLIER : 1;
    const prob = Math.min(1, baseProb * softGateMult * ipMult);

    for (let i = 0; i < monster.count; i++) {
      if (Math.random() >= prob) continue;

      const severity = pickSeverity();
      const params = SEVERITY_PARAMS[severity];

      // Soft-gate: 2× severity consequences when uncontained (Volatile/Chaotic)
      const severityMult = !isContained ? 2 : 1;

      events.push({
        monsterId: monster.id,
        severity,
        productionLossFraction: Math.min(1, params.productionLossFraction * severityMult),
        durationSec: params.durationSec * severityMult,
        hpDamageFraction: Math.min(1, params.hpDamageFraction * severityMult),
        startedAt: now,
      });

      // Hard cap: one event per farm per tick (stop after first)
      return events;
    }
  }

  return events;
}

/** Returns true if a runaway event is still active at the given time. */
export function isEventActive(event: RunawayEvent, now: number): boolean {
  return now < event.startedAt + event.durationSec * 1000;
}

/** Returns the combined production loss fraction from all active events for a given monster. */
export function getActiveProductionLoss(
  monsterId: string,
  activeEvents: RunawayEvent[],
  now: number,
): number {
  const active = activeEvents.filter(
    (e) => e.monsterId === monsterId && isEventActive(e, now),
  );
  if (active.length === 0) return 0;
  // Stack losses additively, capped at 100%
  return Math.min(1, active.reduce((sum, e) => sum + e.productionLossFraction, 0));
}
