import { create } from 'zustand';
import type { GameState, StreakState, DecayState } from '../game/types';
import { makeInitialState, loadGame, saveGame, clearSave } from '../game/persistence';
import { calculateOfflineCatchup, MIN_OFFLINE_SECONDS_FOR_MODAL } from '../game/offlineCatchup';
import { getEffectiveProductionPerSecond, recalculateMultiplier } from '../game/production';
import { checkDecayOnLogin } from '../game/decayLogic';
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

  dismissCatchup: () => set({ offlineCatchup: null }),

  tick: (deltaSeconds: number) => {
    const s = get();
    const now = Date.now();
    let production = getEffectiveProductionPerSecond(s);
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

    const nextState: Partial<GameStore> = {
      energy: newEnergy,
      totalEnergyProduced: newTotal,
      tickCount: newTickCount,
      instabilityPenalty,
    };

    set(nextState);

    if (newTickCount % AUTOSAVE_TICK_INTERVAL === 0) {
      saveGame({ ...s, energy: newEnergy, totalEnergyProduced: newTotal });
    }
  },

  purchaseUpgrade: (upgradeId: string) => {
    const s = get();
    const upgrade = s.upgrades.find((u) => u.id === upgradeId);
    if (!upgrade || upgrade.purchased || s.energy < upgrade.cost) return;

    const newUpgrades = s.upgrades.map((u) =>
      u.id === upgradeId ? { ...u, purchased: true } : u
    );
    const newMultiplier = recalculateMultiplier(newUpgrades);
    const newEnergy = s.energy - upgrade.cost;

    const updated = { upgrades: newUpgrades, productionMultiplier: newMultiplier, energy: newEnergy };
    set(updated);
    saveGame({ ...s, ...updated });
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
    set({ ...fresh, offlineCatchup: null, tickCount: 0, breedingPreview: null, breedingResult: null, breedingParentA: null, breedingParentB: null });
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
}));
