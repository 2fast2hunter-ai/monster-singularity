import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  generateLeaderboard,
  getRival,
  getDailyFlavorText,
  formatEnergy,
} from '../game/leaderboard';

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export function RivalCard() {
  const totalEnergyProduced = useGameStore((s) => s.totalEnergyProduced);
  const [surpassedToast, setSurpassedToast] = useState(false);
  const [lastRivalHandle, setLastRivalHandle] = useState<string | null>(null);

  const dateUTC = todayUTC();
  const entries = generateLeaderboard(dateUTC, totalEnergyProduced);
  const playerEntry = entries.find((e) => e.isPlayer);
  const playerRank = playerEntry?.rank ?? entries.length;
  const rival = getRival(entries, playerRank);
  const flavorText = getDailyFlavorText(dateUTC);

  useEffect(() => {
    if (!rival && lastRivalHandle) {
      // Player just surpassed their rival (rival is now null because rank changed)
      setSurpassedToast(true);
      const t = setTimeout(() => setSurpassedToast(false), 4000);
      return () => clearTimeout(t);
    }
    if (rival) setLastRivalHandle(rival.handle);
  }, [rival, lastRivalHandle]);

  if (playerRank === 1) {
    return (
      <section className="panel rival-card rival-card--top">
        <p className="rival-top-msg">👑 No rival — you hold the top rank!</p>
      </section>
    );
  }

  if (!rival) return null;

  const playerEnergy = playerEntry?.energy ?? 0;
  const progress = Math.min(0.99, playerEnergy / rival.energy);
  const gap = rival.energy - playerEnergy;

  return (
    <section className="panel rival-card">
      <h4 className="rival-title">Current Rival</h4>

      <div className="rival-header">
        <span className="rival-badge">#{rival.rank}</span>
        <span className="rival-handle">{rival.handle}</span>
        <span className="rival-energy">{formatEnergy(rival.energy)} EP</span>
      </div>

      <div className="rival-progress-wrap">
        <div className="rival-progress-bar" style={{ width: `${(progress * 100).toFixed(1)}%` }} />
      </div>
      <p className="rival-gap-text">{formatEnergy(gap)} EP behind</p>

      <p className="rival-flavor">{flavorText}</p>

      {surpassedToast && (
        <div className="rival-surpass-toast">🎉 You surpassed your rival! New rival assigned.</div>
      )}
    </section>
  );
}
