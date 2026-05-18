export interface TowerNpcMonster {
  speciesId: string;
  name: string;
  count: number;
}

export interface TowerFloorDef {
  floor: number;
  name: string;
  description: string;
  npcTeam: TowerNpcMonster[];
  powerThreshold: number; // guaranteed win above this; probabilistic below
  isBoss: boolean;
}

export type TowerFloorStatus = 'cleared' | 'current' | 'locked';

export interface TowerAttemptResult {
  floor: number;
  success: boolean;
  playerPower: number;
  floorThreshold: number;
  rewardEnergyGranted: number;
  rewardSpeciesGranted: string | null; // species ID if a species was granted
  milestoneBadgeGranted: string | null;
  timestamp: number;
}

export interface TowerState {
  weeklyFloor: number;         // 0 = not started; 1-30 = highest cleared this week
  highestEverFloor: number;    // all-time high (used for profile display)
  lastWeeklyReset: number;     // Unix ms of last Monday 00:00 UTC reset
  permanentBadges: string[];   // e.g. ['tower_master'] — survive weekly resets
  weeklyRewardsClaimed: number[]; // floor milestones claimed this week [10, 20, 30]
  lastAttemptResult: TowerAttemptResult | null;
}
