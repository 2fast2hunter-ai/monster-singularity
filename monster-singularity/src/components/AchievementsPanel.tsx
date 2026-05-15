import { useGameStore } from '../store/gameStore';
import type { Achievement, LifetimeStats, AchievementCategory } from '../systems/achievements';

export type { Achievement, LifetimeStats };

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  breeding:    'Breeding',
  collection:  'Collection',
  production:  'Production',
  containment: 'Containment',
  exploration: 'Exploration',
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as AchievementCategory[];

type ProgressEntry = { current: number; target: number };

function buildProgressMap(
  stats: LifetimeStats,
  totalEnergyProduced: number,
): Record<string, ProgressEntry> {
  return {
    breed_10:    { current: stats.totalBred,              target: 10 },
    breed_50:    { current: stats.totalBred,              target: 50 },
    breed_200:   { current: stats.totalBred,              target: 200 },
    dex_5:       { current: stats.speciesDiscovered,      target: 5 },
    dex_20:      { current: stats.speciesDiscovered,      target: 20 },
    dex_50:      { current: stats.speciesDiscovered,      target: 50 },
    dex_100:     { current: stats.speciesDiscovered,      target: 100 },
    dex_250:     { current: stats.speciesDiscovered,      target: 250 },
    energy_1k:   { current: totalEnergyProduced,          target: 1_000 },
    energy_100k: { current: totalEnergyProduced,          target: 100_000 },
    energy_1m:   { current: totalEnergyProduced,          target: 1_000_000 },
    energy_1b:   { current: totalEnergyProduced,          target: 1_000_000_000 },
    ip_500:      { current: stats.totalIPGenerated,       target: 500 },
    ip_10k:      { current: stats.totalIPGenerated,       target: 10_000 },
    contain_10:  { current: stats.totalContainmentEvents, target: 10 },
    contain_50:  { current: stats.totalContainmentEvents, target: 50 },
    sessions_7:  { current: stats.playSessions,           target: 7 },
    sessions_30: { current: stats.playSessions,           target: 30 },
  };
}

export function AchievementsPanel() {
  const achievements = useGameStore((s) => s.achievements);
  const stats = useGameStore((s) => s.lifetimeStats);
  const totalEnergyProduced = useGameStore((s) => s.totalEnergyProduced);

  const progressMap = buildProgressMap(stats, totalEnergyProduced);

  const unlocked = achievements.filter((a) => a.unlocked).length;
  const total = achievements.length;
  const pct = total === 0 ? 0 : Math.round((unlocked / total) * 100);

  return (
    <section className="panel achievements-panel">
      <h3 className="panel-title">Achievements</h3>

      {/* Progress summary */}
      <div className="ach-summary">
        <div className="ach-summary-numbers">
          <span className="ach-count">{unlocked}</span>
          <span className="ach-total"> / {total} unlocked</span>
          <span className="ach-pct"> ({pct}%)</span>
        </div>
        <div className="ach-progress-track">
          <div className="ach-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Lifetime stats */}
      <div className="ach-stats-grid">
        <StatChip label="Monsters Bred"    value={stats.totalBred.toLocaleString()} />
        <StatChip label="Containments"     value={stats.totalContainmentEvents.toLocaleString()} />
        <StatChip label="IP Generated"     value={fmtBig(stats.totalIPGenerated)} />
        <StatChip label="Energy Generated" value={fmtBig(stats.totalEnergyGenerated)} />
        <StatChip label="Species Found"    value={stats.speciesDiscovered.toLocaleString()} />
        <StatChip label="Sessions"         value={stats.playSessions.toLocaleString()} />
      </div>

      {/* Achievement list by category */}
      {CATEGORIES.map((cat) => {
        const catAchs = achievements.filter((a) => a.category === cat);
        if (catAchs.length === 0) return null;
        return (
          <div key={cat} className="ach-category">
            <div className="ach-category-label">{CATEGORY_LABELS[cat]}</div>
            <div className="ach-list">
              {catAchs.map((ach) => {
                const prog = !ach.unlocked ? progressMap[ach.id] : undefined;
                const progPct = prog ? Math.min(100, (prog.current / prog.target) * 100) : 0;
                return (
                  <div
                    key={ach.id}
                    className={`ach-row ${ach.unlocked ? 'unlocked' : 'locked'}`}
                  >
                    <span className="ach-icon" aria-hidden="true">{ach.icon}</span>
                    <div className="ach-info">
                      <span className="ach-title">{ach.title}</span>
                      <span className="ach-desc">{ach.description}</span>
                      {prog && (
                        <div className="ach-prog">
                          <div className="ach-prog-track">
                            <div className="ach-prog-fill" style={{ width: `${progPct}%` }} />
                          </div>
                          <span className="ach-prog-label">
                            {fmtBig(Math.min(prog.current, prog.target))} / {fmtBig(prog.target)}
                          </span>
                        </div>
                      )}
                    </div>
                    {ach.unlocked
                      ? <span className="ach-badge" aria-label="Unlocked">✓</span>
                      : <span className="ach-locked-icon" aria-label="Locked">🔒</span>
                    }
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="ach-stat-chip">
      <span className="ach-stat-value">{value}</span>
      <span className="ach-stat-label">{label}</span>
    </div>
  );
}

function fmtBig(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
}
