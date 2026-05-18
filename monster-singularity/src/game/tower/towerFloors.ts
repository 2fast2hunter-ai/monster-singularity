import type { TowerFloorDef } from './types';

// 30 floors using species from catalog.ts (MS-0001 through MS-0055)
// Floors 1-10:  Common/Uncommon Stable+Volatile monsters
// Floors 11-20: Chaotic/Rare monsters, type advantages
// Floors 21-28: Legendary Aberrant+Reality-Warping monsters
// Floors 29-30: Singularity-class bosses (x2 HP, +20% stats reflected in threshold)
//
// powerThreshold: minimum player farm power for guaranteed win.
// Player power = sum(monster.productionRate × stabilityMult × count) across all farm monsters.
// Stability mults: Stable=1, Volatile=2.5, Chaotic=7, Aberrant=18, Reality-Warping=50

export const TOWER_FLOORS: TowerFloorDef[] = [
  {
    floor: 1,
    name: 'The Nursery',
    description: 'A pen of docile starters. Any farm can clear this.',
    npcTeam: [
      { speciesId: 'MS-0001', name: 'Verdant Slime', count: 3 },
      { speciesId: 'MS-0002', name: 'Stone Toad', count: 2 },
    ],
    powerThreshold: 5,
    isBoss: false,
  },
  {
    floor: 2,
    name: 'Shell Patrol',
    description: 'Armored crabs and tortoises guard the second level.',
    npcTeam: [
      { speciesId: 'MS-0004', name: 'Blister Crab', count: 3 },
      { speciesId: 'MS-0005', name: 'Hollow Tortoise', count: 2 },
    ],
    powerThreshold: 12,
    isBoss: false,
  },
  {
    floor: 3,
    name: 'Crystal Hollow',
    description: 'Mineral-rich creatures block the passage ahead.',
    npcTeam: [
      { speciesId: 'MS-0002', name: 'Stone Toad', count: 2 },
      { speciesId: 'MS-0007', name: 'Quartz Elk', count: 2 },
      { speciesId: 'MS-0006', name: 'Lumen Worm', count: 1 },
    ],
    powerThreshold: 25,
    isBoss: false,
  },
  {
    floor: 4,
    name: 'The Copper Gate',
    description: 'Rare Stable-class specimens with surprising resilience.',
    npcTeam: [
      { speciesId: 'MS-0008', name: 'Copper Mantis', count: 2 },
      { speciesId: 'MS-0004', name: 'Blister Crab', count: 3 },
    ],
    powerThreshold: 50,
    isBoss: false,
  },
  {
    floor: 5,
    name: 'Static Kennel',
    description: 'Your first taste of Volatile energy — these creatures bite back.',
    npcTeam: [
      { speciesId: 'MS-0012', name: 'Spark Hound', count: 2 },
      { speciesId: 'MS-0013', name: 'Fog Wyrm', count: 2 },
      { speciesId: 'MS-0014', name: 'Cinderpede', count: 1 },
    ],
    powerThreshold: 80,
    isBoss: false,
  },
  {
    floor: 6,
    name: 'Thundering Pens',
    description: 'Storm-charged beasts with devastating charge attacks.',
    npcTeam: [
      { speciesId: 'MS-0016', name: 'Thunder Boar', count: 2 },
      { speciesId: 'MS-0015', name: 'Plasma Eel', count: 2 },
      { speciesId: 'MS-0022', name: 'Glitch Firefly', count: 1 },
    ],
    powerThreshold: 140,
    isBoss: false,
  },
  {
    floor: 7,
    name: 'Acid Flats',
    description: 'Corrosive and kinetic monsters protect the upper vault.',
    npcTeam: [
      { speciesId: 'MS-0009', name: 'Basalt Drake', count: 2 },
      { speciesId: 'MS-0017', name: 'Acid Bat Colony', count: 1 },
      { speciesId: 'MS-0019', name: 'Vortex Rhino', count: 1 },
    ],
    powerThreshold: 220,
    isBoss: false,
  },
  {
    floor: 8,
    name: 'Frost and Fury',
    description: 'Temperature-extreme Volatile elites. Dual-element threat.',
    npcTeam: [
      { speciesId: 'MS-0018', name: 'Frostfire Serpent', count: 2 },
      { speciesId: 'MS-0019', name: 'Vortex Rhino', count: 2 },
    ],
    powerThreshold: 350,
    isBoss: false,
  },
  {
    floor: 9,
    name: 'Legendary Stable',
    description: 'The Amber Colossus and its sky-bound companion await.',
    npcTeam: [
      { speciesId: 'MS-0010', name: 'Amber Colossus', count: 2 },
      { speciesId: 'MS-0020', name: 'Storm Kraken', count: 1 },
    ],
    powerThreshold: 550,
    isBoss: false,
  },
  {
    floor: 10,
    name: 'The Typhoon Gauntlet',
    description: 'Clear this and earn the Tower Climber badge. The Typhoon Leviathan commands the storm.',
    npcTeam: [
      { speciesId: 'MS-0021', name: 'Typhoon Leviathan', count: 1 },
      { speciesId: 'MS-0020', name: 'Storm Kraken', count: 2 },
    ],
    powerThreshold: 850,
    isBoss: false,
  },
  {
    floor: 11,
    name: 'Dimensional Seams',
    description: 'Chaotic-class monsters leech energy from dimensional rifts.',
    npcTeam: [
      { speciesId: 'MS-0023', name: 'Rift Leech', count: 3 },
      { speciesId: 'MS-0024', name: 'Entropy Fox', count: 2 },
    ],
    powerThreshold: 1400,
    isBoss: false,
  },
  {
    floor: 12,
    name: 'Phase Corridor',
    description: 'Phase-shifting predators that strike from multiple dimensions.',
    npcTeam: [
      { speciesId: 'MS-0025', name: 'Phase Mantis', count: 2 },
      { speciesId: 'MS-0026', name: 'Void Shark', count: 2 },
      { speciesId: 'MS-0032', name: 'Haze Salamander', count: 1 },
    ],
    powerThreshold: 2200,
    isBoss: false,
  },
  {
    floor: 13,
    name: 'Entropy Fields',
    description: 'Chaos Hydras and Fracture Wolves with unpredictable mutations.',
    npcTeam: [
      { speciesId: 'MS-0027', name: 'Chaos Hydra', count: 2 },
      { speciesId: 'MS-0028', name: 'Fracture Wolf', count: 1 },
      { speciesId: 'MS-0033', name: 'Distortion Crab', count: 2 },
    ],
    powerThreshold: 3500,
    isBoss: false,
  },
  {
    floor: 14,
    name: 'Void Channels',
    description: 'Sub-dimensional hunters with life-drain capabilities.',
    npcTeam: [
      { speciesId: 'MS-0028', name: 'Fracture Wolf', count: 2 },
      { speciesId: 'MS-0026', name: 'Void Shark', count: 3 },
    ],
    powerThreshold: 5500,
    isBoss: false,
  },
  {
    floor: 15,
    name: 'The Mirage Throne',
    description: 'A Chaotic Legendary flanked by its temporal retinue.',
    npcTeam: [
      { speciesId: 'MS-0029', name: 'Mirage Titan', count: 1 },
      { speciesId: 'MS-0027', name: 'Chaos Hydra', count: 2 },
      { speciesId: 'MS-0024', name: 'Entropy Fox', count: 2 },
    ],
    powerThreshold: 8500,
    isBoss: false,
  },
  {
    floor: 16,
    name: 'Null Expanse',
    description: 'Null Behemoths thrive in emptiness. Your farm must be full to compete.',
    npcTeam: [
      { speciesId: 'MS-0030', name: 'Null Behemoth', count: 2 },
      { speciesId: 'MS-0028', name: 'Fracture Wolf', count: 2 },
    ],
    powerThreshold: 13000,
    isBoss: false,
  },
  {
    floor: 17,
    name: 'Nerve Nexus',
    description: 'Aberrant-class creatures integrated with the tower\'s nerve system.',
    npcTeam: [
      { speciesId: 'MS-0034', name: 'Nerve Crawler', count: 2 },
      { speciesId: 'MS-0035', name: 'Tendon Golem', count: 2 },
      { speciesId: 'MS-0042', name: 'Hive Mantis', count: 1 },
    ],
    powerThreshold: 20000,
    isBoss: false,
  },
  {
    floor: 18,
    name: 'Ocular Summit',
    description: 'Wyverns with dimensional sight and membrane-wing predators.',
    npcTeam: [
      { speciesId: 'MS-0036', name: 'Oculus Wyvern', count: 2 },
      { speciesId: 'MS-0037', name: 'Membrane Drake', count: 1 },
      { speciesId: 'MS-0043', name: 'Pressure Wurm', count: 1 },
    ],
    powerThreshold: 30000,
    isBoss: false,
  },
  {
    floor: 19,
    name: 'Crown of Parasites',
    description: 'Colony organisms that scale with your monster count. Bring your full roster.',
    npcTeam: [
      { speciesId: 'MS-0038', name: 'Parasite Crown', count: 2 },
      { speciesId: 'MS-0044', name: 'Fractal Serpent', count: 1 },
      { speciesId: 'MS-0036', name: 'Oculus Wyvern', count: 1 },
    ],
    powerThreshold: 45000,
    isBoss: false,
  },
  {
    floor: 20,
    name: 'Abyssal Conclave',
    description: 'Clear this and earn the Tower Veteran badge. Legendary Aberrant titans guard the deep.',
    npcTeam: [
      { speciesId: 'MS-0039', name: 'Spine Colossus', count: 1 },
      { speciesId: 'MS-0040', name: 'Abyssal Hydra', count: 1 },
      { speciesId: 'MS-0038', name: 'Parasite Crown', count: 2 },
    ],
    powerThreshold: 70000,
    isBoss: false,
  },
  {
    floor: 21,
    name: 'Eldritch Antechamber',
    description: 'The Eldritch Titan — a Singularity-class Aberrant — holds this gate.',
    npcTeam: [
      { speciesId: 'MS-0041', name: 'Eldritch Titan', count: 1 },
      { speciesId: 'MS-0040', name: 'Abyssal Hydra', count: 2 },
    ],
    powerThreshold: 100000,
    isBoss: false,
  },
  {
    floor: 22,
    name: 'Rift Expanse',
    description: 'Reality-Warping creatures tear dimensional fabric. Void drain drains your output.',
    npcTeam: [
      { speciesId: 'MS-0045', name: 'Rift Wyrm', count: 2 },
      { speciesId: 'MS-0052', name: 'Dimensional Parasite', count: 1 },
    ],
    powerThreshold: 140000,
    isBoss: false,
  },
  {
    floor: 23,
    name: 'Paradox Hall',
    description: 'Contradictory physics made manifest. Reality bleeds at every step.',
    npcTeam: [
      { speciesId: 'MS-0046', name: 'Paradox Golem', count: 2 },
      { speciesId: 'MS-0047', name: 'Oblivion Maw', count: 1 },
    ],
    powerThreshold: 200000,
    isBoss: false,
  },
  {
    floor: 24,
    name: 'The Null Tribunal',
    description: 'A Null Hydra presides over cascading dimensional collapse.',
    npcTeam: [
      { speciesId: 'MS-0053', name: 'Null Hydra', count: 1 },
      { speciesId: 'MS-0048', name: 'Cascade Leviathan', count: 1 },
      { speciesId: 'MS-0046', name: 'Paradox Golem', count: 1 },
    ],
    powerThreshold: 280000,
    isBoss: false,
  },
  {
    floor: 25,
    name: 'Cascade Chamber',
    description: 'Perpetual cascade events triggered every few seconds. Survive the surge.',
    npcTeam: [
      { speciesId: 'MS-0048', name: 'Cascade Leviathan', count: 2 },
      { speciesId: 'MS-0047', name: 'Oblivion Maw', count: 1 },
    ],
    powerThreshold: 400000,
    isBoss: false,
  },
  {
    floor: 26,
    name: 'Goliath Vault',
    description: 'The Tentacle Goliath — the apex Reality-Warping reactor — and its Null Hydra guard.',
    npcTeam: [
      { speciesId: 'MS-0049', name: 'Tentacle Goliath', count: 1 },
      { speciesId: 'MS-0053', name: 'Null Hydra', count: 2 },
    ],
    powerThreshold: 560000,
    isBoss: false,
  },
  {
    floor: 27,
    name: 'Void Zenith',
    description: 'The highest stable form before the Singularity line. Two Void Incarnates stand watch.',
    npcTeam: [
      { speciesId: 'MS-0050', name: 'Void Incarnate', count: 2 },
      { speciesId: 'MS-0048', name: 'Cascade Leviathan', count: 1 },
    ],
    powerThreshold: 780000,
    isBoss: false,
  },
  {
    floor: 28,
    name: 'The Final Threshold',
    description: 'Two Void Incarnates and the Tentacle Goliath. The last barrier before the Singularity line.',
    npcTeam: [
      { speciesId: 'MS-0050', name: 'Void Incarnate', count: 2 },
      { speciesId: 'MS-0049', name: 'Tentacle Goliath', count: 1 },
    ],
    powerThreshold: 1100000,
    isBoss: false,
  },
  {
    floor: 29,
    name: 'BOSS: Abyssal Titan',
    description: 'A Singularity-class boss: x2 HP, +20% all stats. The Abyssal Titan has triggered a 24h production event — you must overpower it.',
    npcTeam: [
      { speciesId: 'MS-0054', name: 'Abyssal Titan', count: 1 },
      { speciesId: 'MS-0050', name: 'Void Incarnate', count: 2 },
    ],
    powerThreshold: 2000000,
    isBoss: true,
  },
  {
    floor: 30,
    name: 'BOSS: The Precursor',
    description: 'Clear this and earn the Tower Master badge — permanent. The Precursor itself stands at the apex of the tower. None have ever reached this far.',
    npcTeam: [
      { speciesId: 'MS-0055', name: 'The Precursor', count: 1 },
      { speciesId: 'MS-0051', name: 'Entropy Engine', count: 1 },
    ],
    powerThreshold: 5000000,
    isBoss: true,
  },
];

export const TOWER_FLOORS_BY_INDEX: TowerFloorDef[] = TOWER_FLOORS;
