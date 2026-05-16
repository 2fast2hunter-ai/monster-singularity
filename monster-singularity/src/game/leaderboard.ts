// Simulated global leaderboard — fully client-side, zero network requests.
// Same UTC date seed produces identical fake entries across sessions.

export const PLAYER_ID_KEY = 'ms_player_id';

export function getOrCreatePlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

// mulberry32 — fast, seedable PRNG
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const HANDLE_PARTS = [
  ['Neo', 'Void', 'Apex', 'Dark', 'Hyper', 'Omega', 'Flux', 'Nova', 'Rift', 'Echo'],
  ['Tamer', 'Breeder', 'Warden', 'Shepherd', 'Keeper', 'Hunter', 'Ranger', 'Forger', 'Seeker', 'Caller'],
];

function generateHandle(rng: () => number): string {
  const prefix = HANDLE_PARTS[0][Math.floor(rng() * HANDLE_PARTS[0].length)];
  const suffix = HANDLE_PARTS[1][Math.floor(rng() * HANDLE_PARTS[1].length)];
  const num = Math.floor(rng() * 9000) + 1000;
  return `${prefix}${suffix}${num}`;
}

export interface LeaderboardEntry {
  rank: number;
  handle: string;
  energy: number;
  isPlayer: boolean;
}

export function generateLeaderboard(dateUTC: string, playerEnergy: number): LeaderboardEntry[] {
  const seed = hashString(dateUTC);
  const rng = mulberry32(seed);

  // Generate 10 fake competitors with energies spanning a wide range
  const fakeEntries: { handle: string; energy: number }[] = [];
  for (let i = 0; i < 10; i++) {
    const handle = generateHandle(rng);
    // Entries range from ~0.5x to ~50x player's energy, skewed toward top
    const multiplier = Math.pow(10, rng() * 2.5); // 1x to ~316x
    const base = Math.max(1000, playerEnergy);
    const energy = Math.floor(base * multiplier * (0.5 + rng()));
    fakeEntries.push({ handle, energy });
  }

  // Add player entry
  const playerId = getOrCreatePlayerId();
  const playerHandleSeed = hashString(playerId + dateUTC);
  const playerRng = mulberry32(playerHandleSeed);
  const playerHandle = generateHandle(playerRng);

  const allEntries = [
    ...fakeEntries.map((e) => ({ ...e, isPlayer: false })),
    { handle: playerHandle, energy: playerEnergy, isPlayer: true },
  ];

  // Sort descending by energy, assign ranks
  allEntries.sort((a, b) => b.energy - a.energy);
  return allEntries.map((e, i) => ({ rank: i + 1, ...e }));
}

export function formatEnergy(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toFixed(0);
}
