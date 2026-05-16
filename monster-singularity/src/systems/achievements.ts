import type { GameState } from '../game/types';

export type AchievementCategory =
  | 'breeding'
  | 'collection'
  | 'production'
  | 'containment'
  | 'exploration';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  category: AchievementCategory;
}

export interface LifetimeStats {
  totalBred: number;
  totalContainmentEvents: number;
  totalIPGenerated: number;
  totalEnergyGenerated: number;
  speciesDiscovered: number;
  playSessions: number;
}

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // Breeding
  { id: 'first_breed',       category: 'breeding',    icon: '🧬', title: 'First Contact',         description: 'Breed your first monster.' },
  { id: 'breed_10',          category: 'breeding',    icon: '🔬', title: 'Lab Regular',            description: 'Breed 10 monsters.' },
  { id: 'breed_50',          category: 'breeding',    icon: '🧫', title: 'Prolific Breeder',       description: 'Breed 50 monsters.' },
  { id: 'breed_200',         category: 'breeding',    icon: '🏭', title: 'Breeding Machine',       description: 'Breed 200 monsters.' },
  { id: 'breed_legendary',   category: 'breeding',    icon: '⭐', title: 'Legend Born',            description: 'Breed a Legendary or Singularity monster.' },
  { id: 'breed_rw',          category: 'breeding',    icon: '🌀', title: 'Reality Crafter',        description: 'Breed a Reality-Warping class monster.' },

  // Collection
  { id: 'dex_5',             category: 'collection',  icon: '📖', title: 'Curious Collector',     description: 'Discover 5 species.' },
  { id: 'dex_20',            category: 'collection',  icon: '📚', title: 'Budding Taxonomist',    description: 'Discover 20 species.' },
  { id: 'dex_50',            category: 'collection',  icon: '🗂', title: 'Dex Fanatic',           description: 'Discover 50 species.' },
  { id: 'dex_100',           category: 'collection',  icon: '🏆', title: 'Century Club',          description: 'Discover 100 species.' },
  { id: 'dex_250',           category: 'collection',  icon: '🌟', title: 'Omni-Dex Scholar',      description: 'Discover 250 species.' },

  // Production
  { id: 'energy_1k',         category: 'production',  icon: '⚡', title: 'Spark',                 description: 'Generate 1,000 total energy.' },
  { id: 'energy_100k',       category: 'production',  icon: '🔋', title: 'Power Surge',           description: 'Generate 100,000 total energy.' },
  { id: 'energy_1m',         category: 'production',  icon: '⚡', title: 'Megawatt Monster',      description: 'Generate 1,000,000 total energy.' },
  { id: 'energy_1b',         category: 'production',  icon: '🌩', title: 'Gigawatt God',          description: 'Generate 1,000,000,000 total energy.' },
  { id: 'ip_500',            category: 'production',  icon: '🔮', title: 'Particle Wrangler',     description: 'Generate 500 Instability Particles.' },
  { id: 'ip_10k',            category: 'production',  icon: '💎', title: 'IP Hoarder',            description: 'Generate 10,000 Instability Particles.' },

  // Containment
  { id: 'first_contain',     category: 'containment', icon: '🛡', title: 'Crisis Averted',        description: 'Survive your first containment event.' },
  { id: 'contain_10',        category: 'containment', icon: '🚨', title: 'Seasoned Handler',      description: 'Survive 10 containment events.' },
  { id: 'contain_50',        category: 'containment', icon: '🔒', title: 'Containment Pro',       description: 'Survive 50 containment events.' },
  { id: 'contain_upgrade',   category: 'containment', icon: '🧱', title: 'Fortress Builder',      description: 'Purchase your first containment upgrade.' },

  // Exploration
  { id: 'dim_volatile',      category: 'exploration', icon: '🌪', title: 'Volatile Frontier',     description: 'Reach Dimension Tier 2 (Volatile).' },
  { id: 'dim_chaotic',       category: 'exploration', icon: '💥', title: 'Chaos Theory',          description: 'Reach Dimension Tier 3 (Chaotic).' },
  { id: 'dim_aberrant',      category: 'exploration', icon: '🌀', title: 'Aberrant Explorer',     description: 'Reach Dimension Tier 4 (Aberrant).' },
  { id: 'dim_rw',            category: 'exploration', icon: '🌌', title: 'Reality Rift',          description: 'Reach Dimension Tier 5 (Reality-Warping).' },
  { id: 'sessions_7',        category: 'exploration', icon: '📅', title: 'Dedicated Researcher',  description: 'Play 7 sessions.' },
  { id: 'sessions_30',       category: 'exploration', icon: '🗓', title: 'Lab Veteran',           description: 'Play 30 sessions.' },
];

export function makeInitialAchievements(): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map((def) => ({ ...def, unlocked: false }));
}

export function makeInitialLifetimeStats(): LifetimeStats {
  return {
    totalBred: 0,
    totalContainmentEvents: 0,
    totalIPGenerated: 0,
    totalEnergyGenerated: 0,
    speciesDiscovered: 0,
    playSessions: 0,
  };
}

function unlockIfNeeded(achievements: Achievement[], id: string): Achievement[] {
  const idx = achievements.findIndex((a) => a.id === id);
  if (idx === -1 || achievements[idx].unlocked) return achievements;
  const next = [...achievements];
  next[idx] = { ...next[idx], unlocked: true, unlockedAt: Date.now() };
  return next;
}

export function checkAchievements(
  achievements: Achievement[],
  stats: LifetimeStats,
  state: Pick<GameState, 'ownedSpecies' | 'totalEnergyProduced' | 'monsters' | 'purchasedContainment' | 'upgrades'>,
): Achievement[] {
  let ach = achievements;

  // Breeding
  if (stats.totalBred >= 1)   ach = unlockIfNeeded(ach, 'first_breed');
  if (stats.totalBred >= 10)  ach = unlockIfNeeded(ach, 'breed_10');
  if (stats.totalBred >= 50)  ach = unlockIfNeeded(ach, 'breed_50');
  if (stats.totalBred >= 200) ach = unlockIfNeeded(ach, 'breed_200');

  // breed_legendary / breed_rw unlock via explicit events in the store (gacha/breeding handlers)

  // Collection
  const discovered = state.ownedSpecies.length;
  if (discovered >= 5)   ach = unlockIfNeeded(ach, 'dex_5');
  if (discovered >= 20)  ach = unlockIfNeeded(ach, 'dex_20');
  if (discovered >= 50)  ach = unlockIfNeeded(ach, 'dex_50');
  if (discovered >= 100) ach = unlockIfNeeded(ach, 'dex_100');
  if (discovered >= 250) ach = unlockIfNeeded(ach, 'dex_250');

  // Production — energy
  const energy = state.totalEnergyProduced;
  if (energy >= 1_000)         ach = unlockIfNeeded(ach, 'energy_1k');
  if (energy >= 100_000)       ach = unlockIfNeeded(ach, 'energy_100k');
  if (energy >= 1_000_000)     ach = unlockIfNeeded(ach, 'energy_1m');
  if (energy >= 1_000_000_000) ach = unlockIfNeeded(ach, 'energy_1b');

  // Production — IP
  if (stats.totalIPGenerated >= 500)    ach = unlockIfNeeded(ach, 'ip_500');
  if (stats.totalIPGenerated >= 10_000) ach = unlockIfNeeded(ach, 'ip_10k');

  // Containment
  if (stats.totalContainmentEvents >= 1)  ach = unlockIfNeeded(ach, 'first_contain');
  if (stats.totalContainmentEvents >= 10) ach = unlockIfNeeded(ach, 'contain_10');
  if (stats.totalContainmentEvents >= 50) ach = unlockIfNeeded(ach, 'contain_50');
  if (state.purchasedContainment.length >= 1) ach = unlockIfNeeded(ach, 'contain_upgrade');

  // Exploration — dimension tiers (via owned monsters' stability class)
  const hasVolatile    = state.monsters.some((m) => m.stabilityClass === 'Volatile');
  const hasChaotic     = state.monsters.some((m) => m.stabilityClass === 'Chaotic');
  const hasAberrant    = state.monsters.some((m) => m.stabilityClass === 'Aberrant');
  const hasRW          = state.monsters.some((m) => m.stabilityClass === 'Reality-Warping');
  if (hasVolatile) ach = unlockIfNeeded(ach, 'dim_volatile');
  if (hasChaotic)  ach = unlockIfNeeded(ach, 'dim_chaotic');
  if (hasAberrant) ach = unlockIfNeeded(ach, 'dim_aberrant');
  if (hasRW)       ach = unlockIfNeeded(ach, 'dim_rw');

  // Legendary/RW bred
  if (hasRW) ach = unlockIfNeeded(ach, 'breed_rw');

  // Sessions
  if (stats.playSessions >= 7)  ach = unlockIfNeeded(ach, 'sessions_7');
  if (stats.playSessions >= 30) ach = unlockIfNeeded(ach, 'sessions_30');

  return ach;
}
