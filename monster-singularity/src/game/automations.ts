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
    cost: 500,
    unlockAt: 100,
    intervalMs: 10_000,
  },
  {
    id: 'auto_buy_max_slime',
    name: 'Slime Mass-Cultivator',
    description: 'Automatically bulk-buys as many Basic Slimes as affordable every 30s.',
    cost: 10_000,
    unlockAt: 5_000,
    intervalMs: 30_000,
  },
  {
    id: 'auto_research',
    name: 'Auto-Research',
    description: 'Automatically queues the cheapest affordable upgrade every 60s.',
    cost: 50_000,
    unlockAt: 20_000,
    intervalMs: 60_000,
  },
];
