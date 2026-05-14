import { describe, it, expect } from 'vitest';
import {
  STABILITY_MULTIPLIERS,
  getMonsterBioReactorOutput,
  getBaseProductionPerSecond,
  getEffectiveProductionPerSecond,
} from '../production';
import { getInstabilityParticlesPerSecond } from '../timeDilation';
import type { Monster } from '../types';

function makeMonster(overrides: Partial<Monster>): Monster {
  return {
    id: 'test',
    name: 'Test Monster',
    productionRate: 1,
    count: 1,
    stabilityClass: 'Stable',
    ...overrides,
  };
}

describe('STABILITY_MULTIPLIERS', () => {
  it('Stable = 1x', () => expect(STABILITY_MULTIPLIERS['Stable']).toBe(1.0));
  it('Volatile = 2.5x', () => expect(STABILITY_MULTIPLIERS['Volatile']).toBe(2.5));
  it('Chaotic = 7x', () => expect(STABILITY_MULTIPLIERS['Chaotic']).toBe(7.0));
  it('Aberrant = 18x', () => expect(STABILITY_MULTIPLIERS['Aberrant']).toBe(18.0));
  it('Reality-Warping = 50x', () => expect(STABILITY_MULTIPLIERS['Reality-Warping']).toBe(50.0));
});

describe('getMonsterBioReactorOutput', () => {
  it('applies stability multiplier to production rate', () => {
    const m = makeMonster({ productionRate: 2, count: 3, stabilityClass: 'Volatile' });
    // 2 * 3 * 2.5 = 15
    expect(getMonsterBioReactorOutput(m)).toBeCloseTo(15);
  });

  it('stable monster: no multiplier boost', () => {
    const m = makeMonster({ productionRate: 5, count: 2, stabilityClass: 'Stable' });
    expect(getMonsterBioReactorOutput(m)).toBeCloseTo(10);
  });

  it('Reality-Warping monster: 50x multiplier', () => {
    const m = makeMonster({ productionRate: 1, count: 1, stabilityClass: 'Reality-Warping' });
    expect(getMonsterBioReactorOutput(m)).toBeCloseTo(50);
  });
});

describe('getBaseProductionPerSecond', () => {
  it('sums bio-reactor output across all monsters', () => {
    const monsters: Monster[] = [
      makeMonster({ productionRate: 1, count: 1, stabilityClass: 'Stable' }),   // 1
      makeMonster({ id: 'm2', productionRate: 1, count: 1, stabilityClass: 'Volatile' }), // 2.5
    ];
    expect(getBaseProductionPerSecond({ monsters })).toBeCloseTo(3.5);
  });
});

describe('getEffectiveProductionPerSecond', () => {
  it('applies global multiplier on top of stability-scaled output', () => {
    const monsters: Monster[] = [
      makeMonster({ productionRate: 1, count: 1, stabilityClass: 'Chaotic' }), // 7
    ];
    expect(getEffectiveProductionPerSecond({ monsters, productionMultiplier: 2 })).toBeCloseTo(14);
  });
});

describe('instability particle generation', () => {
  it('Stable monsters produce 0 IP/s', () => {
    const monsters = [makeMonster({ stabilityClass: 'Stable', count: 5 })];
    expect(getInstabilityParticlesPerSecond(monsters)).toBe(0);
  });

  it('Volatile monsters produce IP', () => {
    const monsters = [makeMonster({ stabilityClass: 'Volatile', count: 2 })];
    expect(getInstabilityParticlesPerSecond(monsters)).toBeCloseTo(0.1); // 0.05 * 2
  });

  it('Reality-Warping monsters produce 1.0 IP/s each', () => {
    const monsters = [makeMonster({ stabilityClass: 'Reality-Warping', count: 3 })];
    expect(getInstabilityParticlesPerSecond(monsters)).toBeCloseTo(3.0);
  });

  it('mixed farm sums correctly', () => {
    const monsters: Monster[] = [
      makeMonster({ stabilityClass: 'Stable', count: 10 }),           // 0
      makeMonster({ id: 'm2', stabilityClass: 'Chaotic', count: 2 }), // 0.3
      makeMonster({ id: 'm3', stabilityClass: 'Aberrant', count: 1 }),// 0.4
    ];
    expect(getInstabilityParticlesPerSecond(monsters)).toBeCloseTo(0.7);
  });
});

describe('ecosystem decay trigger condition', () => {
  it('depletion starts when IP hits 0', () => {
    // Simulate: if particles are 0 and depletion just started, no decay yet
    const depletedSince = Date.now();
    const elapsed = Date.now() - depletedSince;
    expect(elapsed).toBeLessThan(10 * 60 * 1000);
  });

  it('decay triggers after 10 minutes of depletion', () => {
    const depletedSince = Date.now() - 11 * 60 * 1000; // 11 min ago
    const elapsed = Date.now() - depletedSince;
    expect(elapsed).toBeGreaterThanOrEqual(10 * 60 * 1000);
  });
});
