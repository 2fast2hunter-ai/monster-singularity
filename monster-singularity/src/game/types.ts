import type { StabilityClass } from './monster/types';
import type { EggTier } from '../config/progressionConfig';
import type { TowerState } from './tower/types';
export type { StabilityClass };
export type { StaffState, StaffMember, StaffRole } from './staff';
export type { Achievement, LifetimeStats } from '../systems/achievements';
export type { TowerState };

export interface ServerCycleSlot {
  eggTier: EggTier;
  placedAt: number;   // Unix ms
  hatchesAt: number;  // Unix ms = placedAt + 180 days
  hatched: boolean;
}

export interface DimensionStorm {
  activeStabilityClass: StabilityClass;
  startedAt: number; // Unix ms — start of storm window (Monday midnight UTC)
  endsAt: number;    // Unix ms — end of storm window (next Monday midnight UTC)
}

export interface Monster {
  id: string;
  name: string;
  productionRate: number; // energy per second, base
  count: number;
  stabilityClass: StabilityClass;
  instabilityParticleCost: number; // IP consumed per second per unit (0 for Stable)
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  multiplier: number; // multiplies global production rate
  purchased: boolean;
  unlockAt?: number; // total energy ever produced required to show upgrade
}

// Retention state: persisted per-player
export interface StreakState {
  streakCount: number;
  lastClaimDate: string | null; // UTC date string YYYY-MM-DD
  geneFragmentGranted: boolean;
  /** True once the 30-Day Survivor badge has been earned (days 29+); permanent across resets */
  survivorBadge: boolean;
}

export interface DecayState {
  lastLoginTimestamp: number; // Unix ms — updated on every session start
  decayEventPending: boolean; // true if decay triggered and not yet dismissed
  decayConsumedSpecies: string[]; // species names consumed in last decay event
  decaySurvivingCount: number;
}

export interface AuctionState {
  weekNumber: number;       // epoch week seed when bid was placed (-1 = never bid)
  playerBid: number | null; // energy spent on bid (null = no bid this week)
  bidPlacedAt: number | null; // Unix ms timestamp of bid placement
}

export interface GachaState {
  totalPulls: number;
  pityCount: number; // pulls since last Rare+ (resets on Rare+ pull)
}

// Time-dilation: research items queued for timed completion at dimension 5+
export interface ResearchQueueItem {
  upgradeId: string;
  startedAt: number;   // Unix ms
  durationMs: number;  // total duration in ms
  energyCost: number;  // already deducted from energy
}

export interface GameState {
  energy: number;
  totalEnergyProduced: number;
  lastSaveTimestamp: number; // Unix ms — written on every save
  sessionStartTimestamp: number; // Unix ms — written on load, not saved
  monsters: Monster[];
  upgrades: Upgrade[];
  productionMultiplier: number; // combined multiplier from purchased upgrades
  offlineCatchupCapHours: number; // max hours of offline production to award
  dimensionStorm: DimensionStorm | null; // runtime only — not persisted; null = not yet fetched

  // Species catalog ownership
  ownedSpecies: string[]; // MonsterSpecies IDs the player has acquired

  // Retention mechanics
  streak: StreakState;
  decay: DecayState;

  // Weekly Crypto-Zoo auction
  auction: AuctionState;

  // Gacha / loot box system
  gacha: GachaState;

  // Time-dilation research queue (persisted)
  researchQueue: ResearchQueueItem[];

  // Secondary resource: Instability Particles (earns from unstable monsters)
  instabilityParticles: number;

  // Unix ms when IP hit zero; null when IP > 0. After 10 min → ecosystem decay.
  instabilityDepletedSince: number | null;

  // Staff / member system
  staff: import('./staff').StaffState;

  // Purchased containment upgrade IDs (from CONTAINMENT_GATE_DEFINITIONS)
  purchasedContainment: string[];

  // Unlocked automation IDs
  automations: string[];
  // Tracks per-automation internal state (e.g. cooldown timestamps)
  automationState: Record<string, number>;

  // Achievement system (persisted)
  achievements: import('../systems/achievements').Achievement[];
  lifetimeStats: import('../systems/achievements').LifetimeStats;

  // Account creation timestamp (Unix ms) — used for real-time dimension floor gates
  accountCreatedAt: number;

  // Dimension progression (1–50 levels, 1–11 tiers)
  dimensionLevel: number;
  dimensionTier: number;

  // Server Cycle legendary egg incubation slots
  serverCycleSlots: ServerCycleSlot[];

  // Set to true when all three Alpha Entity prerequisites are met
  alphaEntityUnlocked: boolean;

  // Challenge Tower
  towerState: TowerState;
}
