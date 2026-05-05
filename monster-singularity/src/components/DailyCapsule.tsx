import { useState } from 'react';
import { useRetentionStore } from '../store/retentionStore';
import { retentionApi } from '../api/retentionApi';

const PLAYER_ID = 'demo-player';
const STREAK_LENGTH = 30;

const MILESTONES: Record<number, string> = {
  7: 'Speed Boost x2',
  14: 'Rare Egg',
  21: 'Mutation Catalyst',
  30: 'Alpha Genome Shard',
};

function nextMilestone(streakCount: number): { day: number; reward: string } | null {
  const days = [7, 14, 21, 30] as const;
  for (const d of days) {
    if (streakCount < d) return { day: d, reward: MILESTONES[d] };
  }
  return null;
}

export function DailyCapsule() {
  const streak = useRetentionStore((s) => s.streakState);
  const showDay30 = useRetentionStore((s) => s.showDay30Animation);
  const applyClaimResult = useRetentionStore((s) => s.applyClaimResult);
  const dismissDay30 = useRetentionStore((s) => s.dismissDay30Animation);
  const setInventory = useRetentionStore((s) => s.setInventory);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!streak) return null;

  const { streakCount, todayFilled, canClaimToday, resetOccurred } = streak;
  const milestone = nextMilestone(streakCount);

  async function watchAd() {
    setError(null);
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c === null || c <= 1) {
          clearInterval(interval);
          return null;
        }
        return c - 1;
      });
    }, 1000);

    await new Promise<void>((r) => setTimeout(r, 5000));
    try {
      const result = await retentionApi.claimDailyReward(PLAYER_ID);
      applyClaimResult(result.streakCount, result.geneFragmentGranted ?? false);
      if (result.geneFragmentGranted) {
        const inv = await retentionApi.getInventory(PLAYER_ID);
        setInventory(inv);
      }
    } catch {
      setError('Server unreachable. Try again later.');
    }
  }

  return (
    <div className="panel daily-capsule-panel">
      <div className="panel-title">Daily Time Capsule</div>

      {resetOccurred && (
        <p className="capsule-reset-notice">Streak reset — you missed a day!</p>
      )}

      <div className="capsule-grid">
        {Array.from({ length: STREAK_LENGTH }, (_, i) => {
          const slotDay = i + 1;
          const filled = slotDay <= streakCount;
          const isToday = slotDay === streakCount + (todayFilled ? 0 : 1);
          const isMilestone = slotDay in MILESTONES;
          return (
            <div
              key={slotDay}
              className={[
                'capsule-slot',
                filled ? 'filled' : '',
                isToday && !todayFilled ? 'today' : '',
                isMilestone ? 'milestone' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              title={isMilestone ? `Day ${slotDay}: ${MILESTONES[slotDay]}` : `Day ${slotDay}`}
            >
              {isMilestone ? '★' : slotDay}
            </div>
          );
        })}
      </div>

      <div className="capsule-streak-row">
        <span className="capsule-streak-count">
          🔥 Streak: <strong>{streakCount}</strong> / {STREAK_LENGTH}
        </span>
        {milestone && (
          <span className="capsule-next-milestone">
            Next reward at Day {milestone.day}: <em>{milestone.reward}</em>
          </span>
        )}
        {!milestone && streakCount >= STREAK_LENGTH && (
          <span className="capsule-complete">All milestones reached!</span>
        )}
      </div>

      {canClaimToday && (
        <button
          className="btn-primary capsule-watch-btn"
          onClick={watchAd}
          disabled={countdown !== null}
        >
          {countdown !== null ? `Watching Ad (${countdown}s)...` : 'Watch Ad — Claim Today'}
        </button>
      )}

      {todayFilled && !canClaimToday && (
        <p className="capsule-claimed">Today's capsule claimed! Come back tomorrow.</p>
      )}

      {error && <p className="capsule-error">{error}</p>}

      {showDay30 && (
        <div className="modal-backdrop" onClick={dismissDay30}>
          <div className="modal day30-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">🧬</span>
              <h2>Alpha Genome Shard Unlocked!</h2>
            </div>
            <p className="modal-subtitle">
              30 days of devotion. The Alpha Entity stirs. You have earned the rarest
              gene fragment in existence.
            </p>
            <div className="day30-shine">★ ALPHA GENOME SHARD ★</div>
            <p className="modal-subtitle">Added to your inventory.</p>
            <button className="btn-primary modal-btn" onClick={dismissDay30}>
              Claim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
