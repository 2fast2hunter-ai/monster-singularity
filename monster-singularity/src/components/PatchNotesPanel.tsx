import { useEffect, useState } from 'react';

const SEEN_VERSION_KEY = 'ms_patches_seen_version';
const LATEST_VERSION = '0.2.3';

type ChangeType = 'feature' | 'fix' | 'balance' | 'content';

interface PatchChange {
  type: ChangeType;
  text: string;
}

interface PatchEntry {
  version: string;
  date: string;
  title: string;
  changes: PatchChange[];
}

const PATCHES: PatchEntry[] = [
  {
    version: '0.2.3',
    date: '2026-05-16',
    title: 'Patches Overview',
    changes: [
      { type: 'feature', text: 'New Patches tab — track every update at a glance.' },
    ],
  },
  {
    version: '0.2.2',
    date: '2026-05-12',
    title: 'Team & Automation',
    changes: [
      { type: 'feature', text: 'Team tab — hire staff to boost production across all monster types.' },
      { type: 'feature', text: 'Automation panel — configure auto-breed and auto-harvest rules.' },
      { type: 'feature', text: 'Onboarding tutorial with step-by-step guidance for new players.' },
      { type: 'feature', text: 'Tab intro cards explain each screen on first visit.' },
    ],
  },
  {
    version: '0.2.1',
    date: '2026-05-10',
    title: 'Milestones',
    changes: [
      { type: 'feature', text: 'Milestones tab — earn achievements by breeding, discovering, and producing.' },
      { type: 'feature', text: 'Lifetime stats: total breeds, containments, energy, and IP generated.' },
      { type: 'content', text: '18 achievements across 5 categories.' },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-05-08',
    title: 'Alpha v0.2 — Gacha & Auction',
    changes: [
      { type: 'feature', text: 'Gacha system — pull rare monsters with Singularity Shards across 3 rarity tiers.' },
      { type: 'feature', text: 'Pity mechanic — guaranteed Legendary after 50 pulls without one.' },
      { type: 'feature', text: 'Multi-pull (×10) with duplicate refunds as bonus Shards.' },
      { type: 'feature', text: 'Crypto-Zoo weekly auction — bid Shards on rotating Legendary monsters.' },
      { type: 'balance', text: 'Seeded RNG ensures consistent auction outcomes per week across all players.' },
    ],
  },
  {
    version: '0.1.5',
    date: '2026-05-06',
    title: 'OmniDex Expansion & Deployment',
    changes: [
      { type: 'content', text: 'OmniDex expanded from 55 → 300 species (MS-0001 to MS-0300).' },
      { type: 'content', text: 'New species span all stability classes, including Reality-Warping tier.' },
      { type: 'feature', text: 'Game deployed to GitHub Pages — Monster Singularity is now live.' },
    ],
  },
  {
    version: '0.1.4',
    date: '2026-05-04',
    title: 'Dimension Storms & Retention',
    changes: [
      { type: 'feature', text: 'Monday Dimension Storms — weekly event that reshuffles the production meta.' },
      { type: 'feature', text: 'Ecosystem decay — after 48h offline stronger monsters consume weaker ones.' },
      { type: 'feature', text: 'Daily login streak counter with visual retention bar.' },
      { type: 'feature', text: 'Offline catch-up: energy and resources accrue while you are away.' },
    ],
  },
  {
    version: '0.1.3',
    date: '2026-05-02',
    title: 'Breeding Editor',
    changes: [
      { type: 'feature', text: 'Breeding panel with genetic sequence editor.' },
      { type: 'balance', text: 'Incorrect gene sequences cause instability and risk base destruction.' },
      { type: 'feature', text: 'Discovered species passively produce energy via the idle loop.' },
      { type: 'balance', text: 'Instability Particles now required to feed high-tier Bio-Reactors.' },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-04-28',
    title: 'Alpha v0.1 — Core Launch',
    changes: [
      { type: 'feature', text: 'Core idle loop: energy production, per-second rates, localStorage save state.' },
      { type: 'feature', text: 'Monster data model with genetics system and stability classes.' },
      { type: 'feature', text: 'OmniDex catalog with 55 initial species.' },
      { type: 'feature', text: 'Resource display: Energy, Instability Particles, Singularity Shards.' },
      { type: 'feature', text: 'Research/Upgrades panel for permanent production multipliers.' },
    ],
  },
];

const TAG_LABELS: Record<ChangeType, string> = {
  feature: 'NEW',
  fix: 'FIX',
  balance: 'BAL',
  content: 'DATA',
};

function getSeenVersion(): string {
  return localStorage.getItem(SEEN_VERSION_KEY) ?? '';
}

function isVersionNewer(a: string, b: string): boolean {
  const toNum = (v: string) => v.split('.').map(Number);
  const [am, ai, ap] = toNum(a);
  const [bm, bi, bp] = toNum(b);
  if (am !== bm) return am > bm;
  if (ai !== bi) return ai > bi;
  return ap > bp;
}

export function PatchNotesPanel() {
  const [seenVersion, setSeenVersion] = useState(getSeenVersion);

  useEffect(() => {
    localStorage.setItem(SEEN_VERSION_KEY, LATEST_VERSION);
    setSeenVersion(LATEST_VERSION);
  }, []);

  return (
    <section className="panel patches-panel">
      <h3 className="panel-title">Patch Notes</h3>
      <div className="patches-list">
        {PATCHES.map((patch) => {
          const isNew = isVersionNewer(patch.version, seenVersion);
          return (
            <div key={patch.version} className={`patch-entry ${isNew ? 'patch-entry--new' : ''}`}>
              <div className="patch-header">
                <div className="patch-version-row">
                  <span className="patch-version">v{patch.version}</span>
                  {isNew && <span className="patch-new-badge">NEW</span>}
                  <span className="patch-title">{patch.title}</span>
                </div>
                <span className="patch-date">{patch.date}</span>
              </div>
              <ul className="patch-changes">
                {patch.changes.map((change, i) => (
                  <li key={i} className="patch-change-row">
                    <span className={`patch-tag patch-tag--${change.type}`}>
                      {TAG_LABELS[change.type]}
                    </span>
                    <span className="patch-change-text">{change.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
