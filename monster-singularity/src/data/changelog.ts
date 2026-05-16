export interface PatchEntry {
  version: string;
  date: string;
  notes: string[];
}

export const CHANGELOG: PatchEntry[] = [
  {
    version: 'v0.3',
    date: '2026-05-16',
    notes: [
      'Economy rebalance: progression curves adjusted, pity system added',
      'Farm Overview: sort and filter added',
      'Patch Notes tab added',
    ],
  },
  {
    version: 'v0.2',
    date: '2026-05-14',
    notes: [
      'In-game feedback button added',
      'Gacha system implemented (lootbox monster acquisition)',
    ],
  },
  {
    version: 'v0.1',
    date: '2026-05-06',
    notes: [
      'Initial alpha release',
      '300 monster species',
      'Breeding editor, Dimension Storm, Crypto-Zoo auction',
    ],
  },
];
