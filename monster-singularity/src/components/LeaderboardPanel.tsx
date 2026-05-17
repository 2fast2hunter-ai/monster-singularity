import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateLeaderboard, formatEnergy } from '../game/leaderboard';
import { RivalCard } from './RivalCard';

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export function LeaderboardPanel() {
  const totalEnergyProduced = useGameStore((s) => s.totalEnergyProduced);
  const dateUTC = todayUTC();

  const entries = useMemo(
    () => generateLeaderboard(dateUTC, totalEnergyProduced),
    // Re-derive when energy crosses rank boundaries (every render is fine here since useMemo cost is trivial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dateUTC, totalEnergyProduced],
  );

  const playerEntry = entries.find((e) => e.isPlayer);
  const top = entries.filter((e) => !e.isPlayer).slice(0, 3);
  const rest = entries.filter((e) => !e.isPlayer).slice(3);

  return (
    <div className="community-tab">
    <RivalCard />
    <section className="panel leaderboard-panel">
      <h3 className="panel-title">Global Leaderboard</h3>
      <p className="leaderboard-subtitle">Daily rankings · resets at midnight UTC</p>

      <div className="leaderboard-top3">
        {top.map((e) => (
          <div key={e.rank} className={`leaderboard-top-entry rank-${e.rank}`}>
            <span className="lb-medal">{MEDAL[e.rank]}</span>
            <span className="lb-handle">{e.handle}</span>
            <span className="lb-energy">{formatEnergy(e.energy)} EP</span>
          </div>
        ))}
      </div>

      <div className="leaderboard-list">
        {rest.map((e) => (
          <div key={e.rank} className="lb-row">
            <span className="lb-rank">#{e.rank}</span>
            <span className="lb-handle">{e.handle}</span>
            <span className="lb-energy">{formatEnergy(e.energy)} EP</span>
          </div>
        ))}
      </div>

      {playerEntry && (
        <>
          <div className="lb-divider" />
          <div className="lb-player-row">
            <span className="lb-rank lb-rank-player">#{playerEntry.rank}</span>
            <span className="lb-handle lb-handle-player">{playerEntry.handle} (You)</span>
            <span className="lb-energy">{formatEnergy(playerEntry.energy)} EP</span>
          </div>
          {playerEntry.rank > 1 && (
            <p className="lb-gap-hint">
              {(() => {
                const above = entries[playerEntry.rank - 2];
                const gap = above ? above.energy - playerEntry.energy : 0;
                return gap > 0 ? `${formatEnergy(gap)} EP behind #${playerEntry.rank - 1}` : '';
              })()}
            </p>
          )}
          {playerEntry.rank === 1 && (
            <p className="lb-gap-hint lb-rank1-msg">👑 You hold the top spot today!</p>
          )}
        </>
      )}
    </section>
    </div>
  );
}
