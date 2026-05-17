export type StaffRole =
  | 'logic_engineer'
  | 'designer'
  | 'artist'
  | 'qa_tester'
  | 'researcher';

export interface StaffRoleDef {
  id: StaffRole;
  name: string;
  description: string;
  hireCost: number;       // energy per hire
  maxCount: number;
  bonusLabel: string;     // e.g. "+5% production per hire"
  tasks: string[];
}

export const STAFF_ROLES: StaffRoleDef[] = [
  {
    id: 'logic_engineer',
    name: 'Logic Engineer',
    description: 'Optimises the BioReactor pipeline and idle systems.',
    hireCost: 15_000,
    maxCount: 10,
    bonusLabel: '+5% energy production per engineer',
    tasks: ['Optimise Production', 'Debug Systems', 'Idle Improvements'],
  },
  {
    id: 'designer',
    name: 'Designer',
    description: 'Improves Gacha drop quality through better specimen curation.',
    hireCost: 25_000,
    maxCount: 5,
    bonusLabel: '+4% Gacha pity reduction per designer',
    tasks: ['Monster Art', 'UI Design', 'Gacha Assets'],
  },
  {
    id: 'artist',
    name: 'Artist',
    description: 'Creates compelling auction listings that attract higher bids.',
    hireCost: 20_000,
    maxCount: 8,
    bonusLabel: '+3% Auction bid bonus per artist',
    tasks: ['Auction Graphics', 'Species Portraits', 'World Art'],
  },
  {
    id: 'qa_tester',
    name: 'QA Tester',
    description: 'Stress-tests monster ecosystems, slowing Instability decay.',
    hireCost: 10_000,
    maxCount: 8,
    bonusLabel: '+6% Instability drain reduction per tester',
    tasks: ['Stability Testing', 'Regression Testing', 'Performance Testing'],
  },
  {
    id: 'researcher',
    name: 'Researcher',
    description: 'Accelerates research in the Dimension Lab.',
    hireCost: 30_000,
    maxCount: 5,
    bonusLabel: '-5% research duration per researcher',
    tasks: ['Evolution Studies', 'Dimension Research', 'Genetics Analysis'],
  },
];

export interface StaffMember {
  id: string;           // unique per hire, e.g. "logic_engineer_0"
  role: StaffRole;
  assignedTask: string;
}

export interface StaffState {
  members: StaffMember[];
}

export function makeInitialStaffState(): StaffState {
  return { members: [] };
}

/** Production multiplier bonus from Logic Engineers (stacks additively then applied). */
export function getStaffProductionMultiplier(staff: StaffState): number {
  const count = staff.members.filter((m) => m.role === 'logic_engineer').length;
  return 1 + count * 0.05;
}

/** Pity reduction per pull from Designers (flat reduction applied to pity count). */
export function getStaffGachaPityBonus(staff: StaffState): number {
  return staff.members.filter((m) => m.role === 'designer').length * 0.04;
}

/** Auction bid bonus multiplier from Artists. */
export function getStaffAuctionBonus(staff: StaffState): number {
  const count = staff.members.filter((m) => m.role === 'artist').length;
  return 1 + count * 0.03;
}

/** Instability drain reduction factor from QA Testers (0 = no reduction, 1 = full). */
export function getStaffInstabilityReduction(staff: StaffState): number {
  const count = staff.members.filter((m) => m.role === 'qa_tester').length;
  return Math.min(0.6, count * 0.06);
}

/** Research duration multiplier from Researchers (<1 = faster). */
export function getStaffResearchSpeedMultiplier(staff: StaffState): number {
  const count = staff.members.filter((m) => m.role === 'researcher').length;
  return Math.max(0.5, 1 - count * 0.05);
}
