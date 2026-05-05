import { SEED_CATALOG } from './monster/catalog';
import type { MonsterSpecies } from './monster/types';

const WEEK_MS = 7 * 24 * 3600 * 1000;
export const AUCTION_BASE_BID = 10_000;

// Same mulberry32 used by dimensionStorm — seeded differently via offset
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getAuctionWeekSeed(): number {
  return Math.floor(Date.now() / WEEK_MS);
}

export function getAuctionCloseTime(weekSeed: number): number {
  return (weekSeed + 1) * WEEK_MS;
}

// Pick one Legendary or Singularity species for this week's auction.
// Uses a prime-offset seed so it never conflicts with DimensionStorm's shuffle.
export function getAuctionSpecies(weekSeed: number): MonsterSpecies {
  const eligible = SEED_CATALOG.filter(
    (s) => s.rarityTier === 'Legendary' || s.rarityTier === 'Singularity',
  );
  const rng = mulberry32(weekSeed * 1_000_003 + 7);
  return eligible[Math.floor(rng() * eligible.length)];
}

// The winning floor: the simulated bid at close time.
// Seeded per-week: 20,000 – 80,000 energy.
export function getAuctionFloor(weekSeed: number): number {
  const rng = mulberry32(weekSeed * 1_000_003 + 13);
  return Math.floor(AUCTION_BASE_BID * (2 + rng() * 6));
}

// Simulated current bid at an arbitrary timestamp.
// Follows an exponential curve: BASE_BID at week start → floor at week end.
// This creates visible urgency without a real backend.
export function getSimulatedBid(weekSeed: number, now: number): number {
  const weekStart = weekSeed * WEEK_MS;
  const closeTime = (weekSeed + 1) * WEEK_MS;
  const progress = Math.min(1, Math.max(0, (now - weekStart) / (closeTime - weekStart)));
  const floor = getAuctionFloor(weekSeed);
  return Math.floor(AUCTION_BASE_BID * Math.pow(floor / AUCTION_BASE_BID, progress));
}

export interface PastAuction {
  weekSeed: number;
  weekLabel: string;
  species: MonsterSpecies;
  floor: number;
}

// Past N weekly auctions — deterministic for all players from the same seed.
export function getPastAuctions(count = 4): PastAuction[] {
  const currentWeek = getAuctionWeekSeed();
  return Array.from({ length: count }, (_, i) => {
    const w = currentWeek - i - 1;
    const weekStart = new Date(w * WEEK_MS);
    return {
      weekSeed: w,
      weekLabel: weekStart.toISOString().slice(0, 10),
      species: getAuctionSpecies(w),
      floor: getAuctionFloor(w),
    };
  });
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'CLOSED';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  return `${hours}h ${mins}m ${secs}s`;
}
