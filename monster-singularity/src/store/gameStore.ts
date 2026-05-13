import { create } from 'zustand';
import type { GameState, StreakState, DecayState, AuctionState } from '../game/types';
import { STAFF_ROLES, makeInitialStaffState, getStaffProductionMultiplier } from '../game/staff';
import type { StaffRole } from '../game/staff';
import { makeInitialState, loadGame, saveGame, clearSave } from '../game/persistence';
import { getAuctionWeekSeed } from '../game/auction';
import { GACHA_BOXES, pullGacha, pullGachaMulti } from '../game/gacha';
import type { GachaPullResult } from '../game/gacha';
import { calculateOfflineCatchup, MIN_OFFLINE_SECONDS_FOR_MODAL } from '../game/offlineCatchup';
import { getEffectiveProductionPerSecond, recalculateMultiplier } from '../game/production';
import { checkDecayOnLogin } from '../game/decayLogic';
import {
  getDimensionLevel,
  getResearchDurationMs,
  getRemainingMs,
  getInstabilityParticlesPerSecond,
  getRushCost,
} from '../game/timeDilation';
import { STABILITY_CLASS_ORDER } from '../game/monster/types';
import type { ResearchQueueItem } from '../game/types';
import { CATALOG_BY_ID, SEED_CATALOG } from '../game/monster/catalog';
import { previewBreeding as calcPreview, resolveBreeding } from '../game/monster/breeding';
import type { MonsterSpecies, BreedingPreview } from '../game/monster/types';
import type { BreedingResult } from '../game/monster/breeding';

const AUTOSAVE_TICK_INTERVAL = 300; // ticks (~5s at 60fps)
const STREAK_LENGTH = 30;

export interface CatchupInfo {
  energyGained: number;
  offlineSeconds: number;
  wasCapped: boolean;
}

export interface GameStore extends GameState {
  offlineCatchup: CatchupInfo | null;
  tickCount: number;

  // Breeding session state (not persisted)
  breedingPreview: BreedingPreview | null;
  breedingResult: BreedingResult | null;
  breedingParentA: MonsterSpecies | null;
  breedingParentB: MonsterSpecies | null;

  // Active instability penalty (runtime only, not persisted)
  instabilityPenalty: { multiplier: number; expiresAt: number } | null;

  // Core idle actions
  dismissCatchup: () => void;
  tick: (deltaSeconds: number) => void;
  purchaseUpgrade: (upgradeId: string) => void;
  addMonster: (monsterId: string, count?: number) => void;
  resetGame: () => void;

  // Catalog actions
  acquireSpecies: (speciesId: string) => void;

  // Breeding actions
  setBreedingParent: (slot: 'A' | 'B', species: MonsterSpecies | null) => void;
  computeBreedingPreview: () => void;
  confirmBreeding: () => void;
  dismissBreedingResult: () => void;

  // Retention actions
  claimDailyStreak: () => void;
  dismissDecayEvent: () => void;

  // Auction actions
  placeBid: (amount: number) => void;
  grantAuctionWin: (speciesId: string) => void;

  // Gacha actions
  gachaPullResults: GachaPullResult[] | null;
  dismissGachaResults: () => void;
  openGachaBox: (boxId: string, multi?: boolean) => void;

  // Research time-dilation actions
  rushResearch: (upgradeId: string) => void;

  // Staff actions
  hireStaff: (role: StaffRole) => void;
  assignTask: (memberId: string, task: string) => void;

  // Toast notification for completed research
  researchCompletedToasts: string[]; // upgrade names
  dismissResearchToast: (upgradeName: string) => void;
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUTC(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function bootstrap(): { state: GameState; catchup: CatchupInfo | null } {
  const now = Date.now();
  const saved = loadGame();

  if (!saved) {
    return { state: makeInitialState(), catchup: null };
  }

  // Run decay check on login
  const decayResult = checkDecayOnLogin(saved.decay.lastLoginTimestamp, saved.ownedSpecies);
  let ownedSpecies = saved.ownedSpecies;
  let decay: DecayState = {
    ...saved.decay,
    lastLoginTimestamp: now,
    decayEventPending: false,
    decayConsumedSpecies: [],
    decaySurvivingCount: ownedSpecies.length,
  };

  if (decayResult.triggered) {
    ownedSpecies = ownedSpecies.filter((id) => !decayResult.consumedSpecies.includes(id));
    decay = {
      lastLoginTimestamp: now,
      decayEventPending: true,
      decayConsumedSpecies: decayResult.consumedSpecies.map((id) => {
        const s = CATALOG_BY_ID[id];
        return s ? s.name : id;
      }),
      decaySurvivingCount: decayResult.survivingCount,
    };
  }

  // Reset streak if a day was missed
  const streak: StreakState = { ...saved.streak };
  const lastClaim = streak.lastClaimDate;
  if (lastClaim && lastClaim !== todayUTC() && lastClaim !== yesterdayUTC()) {
    streak.streakCount = 0;
  }

  const offlineSeconds = (now - saved.lastSaveTimestamp) / 1000;
  let state: GameState = { ...saved, sessionStartTimestamp: now, ownedSpecies, streak, decay };
  let catchup: CatchupInfo | null = null;

  if (offlineSeconds > MIN_OFFLINE_SECONDS_FOR_MODAL) {
    const result = calculateOfflineCatchup(saved, now);
    if (result.energyGained > 0) {
      state = {
        ...state,
        energy: saved.energy + result.energyGained,
        totalEnergyProduced: saved.totalEnergyProduced + result.energyGained,
        lastSaveTimestamp: now,
      };
      catchup = {
        energyGained: result.energyGained,
        offlineSeconds: result.offlineSeconds,
        wasCapped: result.wasCapped,
      };
    }
  }

  return { state, catchup };
}

const { state: bootstrapState, catchup: bootstrapCatchup } = bootstrap();

export const useGameStore = create<GameStore>((set, get) => ({
  ...bootstrapState,
  offlineCatchup: bootstrapCatchup,
  tickCount: 0,
  breedingPreview: null,
  breedingResult: null,
  breedingParentA: null,
  breedingParentB: null,
  instabilityPenalty: null,
  gachaPullResults: null,
  researchCompletedToasts: [],

  dismissCatchup: () => set({ offlineCatchup: null }),

  tick: (deltaSeconds: number) => {
    const s = get();
    const now = Date.now();
    let production = getEffectiveProductionPerSecond(s) * getStaffProductionMultiplier(s.staff);
    let instabilityPenalty = s.instabilityPenalty;

    if (instabilityPenalty) {
      if (now >= instabilityPenalty.expiresAt) {
        instabilityPenalty = null;
      } else {
        production *= instabilityPenalty.multiplier;
      }
    }

    const gained = production * deltaSeconds;
    const newEnergy = s.energy + gained;
    const newTotal = s.totalEnergyProduced + gained;
    const newTickCount = s.tickCount + 1;

    // Instability particles: generated by unstable monsters, consumed by high-class ones
    const ipGained = getInstabilityParticlesPerSecond(s.monsters) * deltaSeconds;
    const ipConsumed = s.monsters.reduce((sum, m) => {
      // Chaotic+ consume particles to sustain their output
      const rates: Record<string, number> = { Chaotic: 0.05, Aberrant: 0.2, 'Reality-Warping': 0.8 };
      return sum + (rates[m.stabilityClass] ?? 0) * m.count;
    }, 0) * deltaSeconds;
    const rawNewIP = s.instabilityParticles + ipGained - ipConsumed;
    const newIP = Math.max(0, rawNewIP);

    // Track depletion timer and trigger ecosystem decay after 10 minutes
    const IP_DEPLETION_DECAY_MS = 10 * 60 * 1000;
    let instabilityDepletedSince = s.instabilityDepletedSince;
    let monsters = s.monsters;
    if (newIP <= 0) {
      if (instabilityDepletedSince === null) {
        instabilityDepletedSince = now;
      } else if (now - instabilityDepletedSince >= IP_DEPLETION_DECAY_MS) {
        // Consume the highest-stability-class monster (one count)
        const highestClass = [...STABILITY_CLASS_ORDER].reverse().find((cls) =>
          monsters.some((m) => m.stabilityClass === cls && m.count > 0 && cls !== 'Stable')
        );
        if (highestClass) {
          monsters = monsters.map((m) => {
            if (m.stabilityClass === highestClass && m.count > 0) {
              return { ...m, count: m.count - 1 };
            }
            return m;
          }).filter((m) => m.count > 0);
          instabilityDepletedSince = now; // reset timer after each decay event
        }
      }
    } else {
      instabilityDepletedSince = null;
    }

    // Advance research queue — complete any items whose timer has expired
    let researchQueue = s.researchQueue;
    let upgrades = s.upgrades;
    let productionMultiplier = s.productionMultiplier;
    const newToasts: string[] = [];

    const completed = researchQueue.filter((item) => getRemainingMs(item, now) <= 0);
    if (completed.length > 0) {
      researchQueue = researchQueue.filter((item) => getRemainingMs(item, now) > 0);
      for (const item of completed) {
        const def = upgrades.find((u) => u.id === item.upgradeId);
        if (def && !def.purchased) {
          upgrades = upgrades.map((u) => u.id === item.upgradeId ? { ...u, purchased: true } : u);
          productionMultiplier = recalculateMultiplier(upgrades);
          newToasts.push(def.name);
        }
      }
    }

    const nextState: Partial<GameStore> = {
      energy: newEnergy,
      totalEnergyProduced: newTotal,
      tickCount: newTickCount,
      instabilityPenalty,
      instabilityParticles: newIP,
      instabilityDepletedSince,
      monsters,
      researchQueue,
      upgrades,
      productionMultiplier,
    };

    if (newToasts.length > 0) {
      nextState.researchCompletedToasts = [...s.researchCompletedToasts, ...newToasts];
    }

    set(nextState);

    if (newTickCount % AUTOSAVE_TICK_INTERVAL === 0) {
      saveGame({ ...s, energy: newEnergy, totalEnergyProduced: newTotal, researchQueue, upgrades, productionMultiplier, instabilityParticles: newIP, instabilityDepletedSince, monsters });
    }
  },

  purchaseUpgrade: (upgradeId: string) => {
    const s = get();
    const upgrade = s.upgrades.find((u) => u.id === upgradeId);
    if (!upgrade || upgrade.purchased || s.energy < upgrade.cost) return;

    // Also block if already queued
    if (s.researchQueue.some((item) => item.upgradeId === upgradeId)) return;

    const newEnergy = s.energy - upgrade.cost;
    const dimLevel = getDimensionLevel(s.upgrades);
    const durationMs = getResearchDurationMs(dimLevel);

    if (durationMs > 0) {
      // Time-dilation: queue the research instead of instant purchase
      const queueItem: ResearchQueueItem = {
        upgradeId,
        startedAt: Date.now(),
        durationMs,
        energyCost: upgrade.cost,
      };
      const newQueue = [...s.researchQueue, queueItem];
      const updated = { energy: newEnergy, researchQueue: newQueue };
      set(updated);
      saveGame({ ...s, ...updated });
    } else {
      // Instant purchase
      const newUpgrades = s.upgrades.map((u) =>
        u.id === upgradeId ? { ...u, purchased: true } : u
      );
      const newMultiplier = recalculateMultiplier(newUpgrades);
      const updated = { upgrades: newUpgrades, productionMultiplier: newMultiplier, energy: newEnergy };
      set(updated);
      saveGame({ ...s, ...updated });
    }
  },

  addMonster: (monsterId: string, count = 1) => {
    const s = get();
    const newMonsters = s.monsters.map((m) =>
      m.id === monsterId ? { ...m, count: m.count + count } : m
    );
    set({ monsters: newMonsters });
    saveGame({ ...s, monsters: newMonsters });
  },

  resetGame: () => {
    clearSave();
    const fresh = makeInitialState();
    set({ ...fresh, offlineCatchup: null, tickCount: 0, breedingPreview: null, breedingResult: null, breedingParentA: null, breedingParentB: null, instabilityDepletedSince: null, staff: makeInitialStaffState() });
  },

  // ── Catalog ────────────────────────────────────────────────────────────────

  acquireSpecies: (speciesId: string) => {
    const s = get();
    const species = CATALOG_BY_ID[speciesId];
    if (!species) return;
    if (s.ownedSpecies.includes(speciesId)) return;

    const cost = Math.floor(species.baseProductionRate * 50);
    if (s.energy < cost) return;

    const newOwned = [...s.ownedSpecies, speciesId];
    const newEnergy = s.energy - cost;

    // Add to the idle monsters list too
    const alreadyInFarm = s.monsters.find((m) => m.id === speciesId);
    const newMonsters = alreadyInFarm
      ? s.monsters
      : [...s.monsters, { id: speciesId, name: species.name, productionRate: species.baseProductionRate, count: 1, stabilityClass: species.stabilityClass }];

    const updated = { ownedSpecies: newOwned, energy: newEnergy, monsters: newMonsters };
    set(updated);
    saveGame({ ...s, ...updated });
  },

  // ── Breeding ───────────────────────────────────────────────────────────────

  setBreedingParent: (slot, species) => {
    if (slot === 'A') set({ breedingParentA: species, breedingPreview: null, breedingResult: null });
    else set({ breedingParentB: species, breedingPreview: null, breedingResult: null });
  },

  computeBreedingPreview: () => {
    const { breedingParentA, breedingParentB } = get();
    if (!breedingParentA || !breedingParentB) return;
    const preview = calcPreview({ parentA: breedingParentA, parentB: breedingParentB });
    set({ breedingPreview: preview });
  },

  confirmBreeding: () => {
    const { breedingParentA, breedingParentB, breedingPreview } = get();
    if (!breedingParentA || !breedingParentB || !breedingPreview) return;

    const result = resolveBreeding(
      { parentA: breedingParentA, parentB: breedingParentB },
      breedingPreview,
    );
    set({ breedingResult: result });

    const s = get();

    // Apply instability damage to game state
    if (result.instabilityEvent) {
      const ev = result.instabilityEvent;
      const energyLoss = s.energy * (ev.baseDamagePercent / 100);
      const penaltyMultiplier = Math.max(0, 1 - ev.productionLossPercent / 100);
      const expiresAt = Date.now() + ev.productionLossDurationSec * 1000;
      const updated = {
        energy: Math.max(0, s.energy - energyLoss),
        instabilityPenalty: { multiplier: penaltyMultiplier, expiresAt },
      };
      set(updated);
      saveGame({ ...s, ...updated });
    }

    // Catastrophic destruction — remove parent monsters from farm
    if (result.baseDestroyed) {
      const destroyedIds = new Set([breedingParentA.id, breedingParentB.id]);
      const newOwned = s.ownedSpecies.filter((id) => !destroyedIds.has(id));
      const newMonsters = s.monsters.filter((m) => !destroyedIds.has(m.id));
      const updated = { ownedSpecies: newOwned, monsters: newMonsters };
      set(updated);
      saveGame({ ...s, ...updated });
      return;
    }

    // Successful breed — try to match offspring gene sequence to catalog
    if (result.success) {
      const offspringSeq = result.mutatedSequence ?? breedingPreview.offspringSequence;
      const match = SEED_CATALOG.find(
        (sp) => sp.geneSequence.join('') === offspringSeq.join(''),
      );
      const fresh = get();
      if (match && !fresh.ownedSpecies.includes(match.id)) {
        const alreadyInFarm = fresh.monsters.find((m) => m.id === match.id);
        const newMonsters = alreadyInFarm
          ? fresh.monsters
          : [...fresh.monsters, { id: match.id, name: match.name, productionRate: match.baseProductionRate, count: 1, stabilityClass: match.stabilityClass }];
        const updated = { ownedSpecies: [...fresh.ownedSpecies, match.id], monsters: newMonsters };
        set(updated);
        saveGame({ ...fresh, ...updated });
      }
    }
  },

  dismissBreedingResult: () =>
    set({ breedingResult: null, breedingPreview: null, breedingParentA: null, breedingParentB: null }),

  // ── Retention ─────────────────────────────────────────────────────────────

  claimDailyStreak: () => {
    const s = get();
    const today = todayUTC();
    if (s.streak.lastClaimDate === today) return;

    const newCount = s.streak.streakCount + 1;
    const geneFragmentGranted = newCount >= STREAK_LENGTH && !s.streak.geneFragmentGranted;
    const newStreak: StreakState = {
      streakCount: newCount,
      lastClaimDate: today,
      geneFragmentGranted: s.streak.geneFragmentGranted || geneFragmentGranted,
    };

    const updated = { streak: newStreak };
    set(updated);
    saveGame({ ...s, ...updated });
  },

  dismissDecayEvent: () => {
    const s = get();
    const updated = { decay: { ...s.decay, decayEventPending: false } };
    set(updated);
    saveGame({ ...s, ...updated });
  },

  // ── Auction ───────────────────────────────────────────────────────────────

  placeBid: (amount: number) => {
    const s = get();
    const weekSeed = getAuctionWeekSeed();
    if (s.energy < amount) return;
    if (s.auction.weekNumber === weekSeed && s.auction.playerBid !== null) return;

    const auction: AuctionState = { weekNumber: weekSeed, playerBid: amount, bidPlacedAt: Date.now() };
    const updated = { energy: s.energy - amount, auction };
    set(updated);
    saveGame({ ...s, ...updated });
  },

  grantAuctionWin: (speciesId: string) => {
    const s = get();
    if (s.ownedSpecies.includes(speciesId)) return;
    const species = CATALOG_BY_ID[speciesId];
    if (!species) return;

    const newOwned = [...s.ownedSpecies, speciesId];
    const alreadyInFarm = s.monsters.find((m) => m.id === speciesId);
    const newMonsters = alreadyInFarm
      ? s.monsters
      : [...s.monsters, { id: speciesId, name: species.name, productionRate: species.baseProductionRate, count: 1, stabilityClass: species.stabilityClass }];
    const updated = { ownedSpecies: newOwned, monsters: newMonsters };
    set(updated);
    saveGame({ ...s, ...updated });
  },

  // ── Gacha ─────────────────────────────────────────────────────────────────

  dismissGachaResults: () => set({ gachaPullResults: null }),

  openGachaBox: (boxId: string, multi = false) => {
    const s = get();
    const box = GACHA_BOXES.find((b) => b.id === boxId);
    if (!box) return;

    const count = multi ? 10 : 1;
    const totalCost = multi ? Math.floor(box.cost * count * 0.9) : box.cost;
    if (s.energy < totalCost) return;

    const results: GachaPullResult[] = multi
      ? pullGachaMulti(box, s.ownedSpecies, s.gacha.pityCount, 10)
      : [pullGacha(box, s.ownedSpecies, s.gacha.pityCount)];

    // Apply results to game state
    let ownedSpecies = [...s.ownedSpecies];
    let monsters = [...s.monsters];
    let refundTotal = 0;

    for (const result of results) {
      refundTotal += result.energyRefund;
      if (!result.isDuplicate && !ownedSpecies.includes(result.species.id)) {
        ownedSpecies = [...ownedSpecies, result.species.id];
        const alreadyInFarm = monsters.find((m) => m.id === result.species.id);
        if (!alreadyInFarm) {
          monsters = [...monsters, {
            id: result.species.id,
            name: result.species.name,
            productionRate: result.species.baseProductionRate,
            count: 1,
            stabilityClass: result.species.stabilityClass,
          }];
        }
      }
    }

    // Update pity: count non-Rare+ pulls, reset on any Rare+
    let newPityCount = s.gacha.pityCount;
    for (const result of results) {
      const tier = result.species.rarityTier;
      if (tier === 'Rare' || tier === 'Legendary' || tier === 'Singularity') {
        newPityCount = 0;
      } else {
        newPityCount++;
      }
    }

    const newEnergy = s.energy - totalCost + refundTotal;
    const newGacha = {
      totalPulls: s.gacha.totalPulls + count,
      pityCount: newPityCount,
    };

    const stateUpdate = { energy: newEnergy, ownedSpecies, monsters, gacha: newGacha };
    set({ ...stateUpdate, gachaPullResults: results });
    saveGame({ ...s, ...stateUpdate });
  },

  // ── Research time-dilation ─────────────────────────────────────────────────

  rushResearch: (upgradeId: string) => {
    const s = get();
    const item = s.researchQueue.find((i) => i.upgradeId === upgradeId);
    if (!item) return;

    const dimLevel = getDimensionLevel(s.upgrades);
    const cost = getRushCost(dimLevel);
    if (s.instabilityParticles < cost) return;

    // Reduce remaining time by 50%
    const now = Date.now();
    const remaining = getRemainingMs(item, now);
    const newDurationMs = item.durationMs - remaining / 2;
    const newQueue = s.researchQueue.map((i) =>
      i.upgradeId === upgradeId ? { ...i, durationMs: newDurationMs } : i
    );
    const updated = { instabilityParticles: s.instabilityParticles - cost, researchQueue: newQueue };
    set(updated);
    saveGame({ ...s, ...updated });
  },

  dismissResearchToast: (upgradeName: string) => {
    set((s) => ({ researchCompletedToasts: s.researchCompletedToasts.filter((n) => n !== upgradeName) }));
  },

  // ── Staff ─────────────────────────────────────────────────────────────────

  hireStaff: (role: StaffRole) => {
    const s = get();
    const def = STAFF_ROLES.find((r) => r.id === role);
    if (!def) return;

    const currentCount = s.staff.members.filter((m) => m.role === role).length;
    if (currentCount >= def.maxCount) return;
    if (s.energy < def.hireCost) return;

    const idx = currentCount;
    const newMember = {
      id: `${role}_${idx}`,
      role,
      assignedTask: def.tasks[0],
    };
    const newStaff = { members: [...s.staff.members, newMember] };
    const updated = { energy: s.energy - def.hireCost, staff: newStaff };
    set(updated);
    saveGame({ ...s, ...updated });
  },

  assignTask: (memberId: string, task: string) => {
    const s = get();
    const newMembers = s.staff.members.map((m) =>
      m.id === memberId ? { ...m, assignedTask: task } : m
    );
    const newStaff = { members: newMembers };
    const updated = { staff: newStaff };
    set(updated);
    saveGame({ ...s, ...updated });
  },
}));
