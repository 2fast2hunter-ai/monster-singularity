export interface ServerMonster {
  id: number;
  name: string;
  species: string;
  power: number;
  alive: boolean;
}

export interface DecayReport {
  eventId: number;
  hoursOffline: number;
  decayFraction: number;
  consumed: { id: number; name: string; species: string; power: number }[];
  surviving: number;
}

export interface StreakState {
  streakCount: number;
  streakLength: number;
  lastClaimDate: string | null;
  todayFilled: boolean;
  canClaimToday: boolean;
  resetOccurred: boolean;
  geneFragmentGranted: boolean;
}

export interface LoginResponse {
  hoursOffline: number;
  decayThresholdHours: number;
  decay: DecayReport | null;
  streak: StreakState;
  ecosystem: { aliveCount: number; monsters: ServerMonster[] };
}

export interface ClaimResult {
  alreadyClaimed: boolean;
  streakCount: number;
  geneFragmentGranted: boolean;
  streakLength: number;
}

export interface RestoreResult {
  restored: number;
  monsters?: { id: number; name: string; species: string; power: number }[];
  message?: string;
}

export interface InventoryItem {
  id: number;
  player_id: string;
  item_type: string;
  item_name: string;
  quantity: number;
  granted_at: number;
}

const BASE = '/api/players';

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${url} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const retentionApi = {
  login: (playerId: string) =>
    post<LoginResponse>(`${BASE}/${playerId}/login`),

  restoreAfterAd: (playerId: string) =>
    post<RestoreResult>(`${BASE}/${playerId}/decay/restore-ad`),

  claimDailyReward: (playerId: string) =>
    post<ClaimResult>(`${BASE}/${playerId}/streak/claim`),

  getInventory: (playerId: string) =>
    get<InventoryItem[]>(`${BASE}/${playerId}/inventory`),

  simulateDecay: (playerId: string, hoursAgo = 72) =>
    post(`${BASE}/${playerId}/decay/simulate`, { hoursAgo }),

  simulateStreakMiss: (playerId: string) =>
    post(`${BASE}/${playerId}/streak/simulate-miss`),
};
