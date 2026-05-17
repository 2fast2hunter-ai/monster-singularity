export interface AutomationDef {
  id: string;
  name: string;
  description: string;
  cost: number;       // one-time energy cost to unlock
  unlockAt: number;   // totalEnergyProduced threshold to show
  intervalMs: number; // how often the automation fires
}

export const AUTOMATION_DEFINITIONS: AutomationDef[] = [
  {
    id: 'auto_buy_slime',
    name: 'Slime Cultivator',
    description: 'Automatically buys 1 Basic Slime every 10s when you can afford it.',
    cost: 10_000,
    unlockAt: 3_000,
    intervalMs: 10_000,
  },
  {
    id: 'auto_buy_max_slime',
    name: 'Slime Mass-Cultivator',
    description: 'Automatically bulk-buys as many Basic Slimes as affordable every 30s.',
    cost: 100_000,
    unlockAt: 50_000,
    intervalMs: 30_000,
  },
  {
    id: 'auto_research',
    name: 'Auto-Research',
    description: 'Automatically queues the cheapest affordable upgrade every 60s.',
    cost: 500_000,
    unlockAt: 200_000,
    intervalMs: 60_000,
  },
  {
    id: 'auto_species_scout',
    name: 'Species Scout',
    description: 'Automatically acquires the cheapest unowned catalog species every 2 minutes when affordable.',
    cost: 1_000_000,
    unlockAt: 500_000,
    intervalMs: 120_000,
  },
  {
    id: 'auto_gacha_pull',
    name: 'Auto Gacha Puller',
    description: 'Automatically opens a Standard Capsule every 5 minutes when you can afford it.',
    cost: 2_500_000,
    unlockAt: 1_000_000,
    intervalMs: 300_000,
  },
  {
    id: 'auto_ip_rush',
    name: 'IP Rush Researcher',
    description: 'Automatically spends excess Instability Particles to rush queued research every 90s when IP ≥ 3× rush cost.',
    cost: 5_000_000,
    unlockAt: 2_500_000,
    intervalMs: 90_000,
  },
];
