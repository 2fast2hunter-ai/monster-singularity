import { create } from 'zustand';
import type { DecayReport, StreakState, InventoryItem } from '../api/retentionApi';

export interface RetentionStore {
  loading: boolean;
  serverError: boolean;
  decayReport: DecayReport | null;
  streakState: StreakState | null;
  inventory: InventoryItem[];
  showDecayModal: boolean;
  showDay30Animation: boolean;

  setLoading: (v: boolean) => void;
  setServerError: (v: boolean) => void;
  setLoginResult: (decay: DecayReport | null, streak: StreakState) => void;
  setInventory: (items: InventoryItem[]) => void;
  dismissDecayModal: () => void;
  applyClaimResult: (streakCount: number, geneFragmentGranted: boolean) => void;
  dismissDay30Animation: () => void;
}

export const useRetentionStore = create<RetentionStore>((set) => ({
  loading: false,
  serverError: false,
  decayReport: null,
  streakState: null,
  inventory: [],
  showDecayModal: false,
  showDay30Animation: false,

  setLoading: (v) => set({ loading: v }),
  setServerError: (v) => set({ serverError: v }),

  setLoginResult: (decay, streak) =>
    set({
      decayReport: decay,
      streakState: streak,
      showDecayModal: decay !== null,
    }),

  setInventory: (items) => set({ inventory: items }),

  dismissDecayModal: () => set({ showDecayModal: false }),

  applyClaimResult: (streakCount, geneFragmentGranted) =>
    set((s) => ({
      streakState: s.streakState
        ? { ...s.streakState, streakCount, todayFilled: true, canClaimToday: false }
        : s.streakState,
      showDay30Animation: geneFragmentGranted,
    })),

  dismissDay30Animation: () => set({ showDay30Animation: false }),
}));
