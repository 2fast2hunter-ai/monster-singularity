import { SEED_CATALOG } from './monster/catalog';

const STORM_BOOST_MULTIPLIER = 1.5;
const STORM_SPECIES_COUNT = 5;

// Deterministic seeded PRNG (mulberry32) — same result for all players in the same week
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Week number since Unix epoch (Monday-anchored)
function currentWeekSeed(): number {
  return Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
}

export interface DimensionStorm {
  weekSeed: number;
  boostedSpeciesIds: string[];
  boostMultiplier: number;
  // ISO week string for display
  label: string;
}

export function getCurrentDimensionStorm(): DimensionStorm {
  const weekSeed = currentWeekSeed();
  const rng = mulberry32(weekSeed);

  const ids = [...SEED_CATALOG.map((s) => s.id)];
  // Fisher-Yates shuffle using seeded rng, take first N
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const boostedSpeciesIds = ids.slice(0, STORM_SPECIES_COUNT);

  // Display label: "Week of YYYY-MM-DD"
  const weekStart = new Date(weekSeed * 7 * 24 * 3600 * 1000);
  const label = `Week of ${weekStart.toISOString().slice(0, 10)}`;

  return { weekSeed, boostedSpeciesIds, boostMultiplier: STORM_BOOST_MULTIPLIER, label };
}

export function getStormBoostForSpecies(speciesId: string, storm: DimensionStorm): number {
  return storm.boostedSpeciesIds.includes(speciesId) ? storm.boostMultiplier : 1.0;
}
