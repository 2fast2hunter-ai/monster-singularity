import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatDecayCountdown, DECAY_THRESHOLD_HOURS } from '../game/decayLogic';

const STREAK_LENGTH = 30;
const ECOSYSTEM_INTRO_KEY = 'ms_ecosystem_intro_seen';
const STREAK_INTRO_KEY = 'ms_streak_intro_seen';

export function RetentionBar() {
  const decay = useGameStore((s) => s.decay);
  const streak = useGameStore((s) => s.streak);
  const claimDailyStreak = useGameStore((s) => s.claimDailyStreak);
  const dismissDecayEvent = useGameStore((s) => s.dismissDecayEvent);

  const [countdown, setCountdown] = useState(() => formatDecayCountdown(decay.lastLoginTimestamp));
  const [ecosystemIntroSeen, setEcosystemIntroSeen] = useState(() => !!localStorage.getItem(ECOSYSTEM_INTRO_KEY));
  const [streakIntroSeen, setStreakIntroSeen] = useState(() => !!localStorage.getItem(STREAK_INTRO_KEY));

  function dismissEcosystemIntro() {
    localStorage.setItem(ECOSYSTEM_INTRO_KEY, '1');
    setEcosystemIntroSeen(true);
  }

  function dismissStreakIntro() {
    localStorage.setItem(STREAK_INTRO_KEY, '1');
    setStreakIntroSeen(true);
  }

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(formatDecayCountdown(decay.lastLoginTimestamp));
    }, 60_000);
    return () => clearInterval(id);
  }, [decay.lastLoginTimestamp]);

  const today = new Date().toISOString().slice(0, 10);
  const canClaim = streak.lastClaimDate !== today;
  const daysLeft = STREAK_LENGTH - streak.streakCount;

  return (
    <>
      {/* Decay event modal */}
      {decay.decayEventPending && (
        <div className="modal-backdrop">
          <div className="modal decay-modal">
            <div className="modal-header">
              <span className="modal-icon">💀</span>
              <h2>Ecosystem Decay</h2>
            </div>
            <p className="modal-subtitle">
              You were offline too long. Stronger monsters survived; the weakest were consumed.
            </p>
            <div className="modal-stat">
              <span className="stat-label">Consumed</span>
              <span className="stat-value" style={{ color: '#ef4444' }}>
                {decay.decayConsumedSpecies.slice(0, 5).join(', ')}
                {decay.decayConsumedSpecies.length > 5 && ` +${decay.decayConsumedSpecies.length - 5} more`}
              </span>
            </div>
            <div className="modal-stat">
              <span className="stat-label">Surviving</span>
              <span className="stat-value" style={{ color: '#10b981' }}>{decay.decaySurvivingCount} species</span>
            </div>
            <button className="btn-primary modal-btn" onClick={dismissDecayEvent}>
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* Retention status bar */}
      <div className="retention-bar">
        {/* Decay timer */}
        <div className={`retention-block ${countdown === 'DECAY ACTIVE' ? 'danger' : ''}`}>
          <span className="retention-label">Ecosystem</span>
          <span className="retention-value">
            {countdown === 'DECAY ACTIVE'
              ? <span style={{ color: '#ef4444' }}>⚠ DECAY ACTIVE</span>
              : <>{countdown} safe</>
            }
          </span>
          <span className="retention-hint">{DECAY_THRESHOLD_HOURS}h offline triggers decay</span>
          {!ecosystemIntroSeen && (
            <div className="retention-intro-caption">
              <span>Offline more than 48h? Your weakest monsters get consumed. Log in daily to keep your ecosystem healthy.</span>
              <button className="retention-intro-dismiss" aria-label="Dismiss" onClick={dismissEcosystemIntro}>✕</button>
            </div>
          )}
        </div>

        {/* Streak tracker */}
        <div className="retention-block">
          <span className="retention-label">Daily Streak</span>
          <span className="retention-value">
            Day {streak.streakCount}/{STREAK_LENGTH}
          </span>
          <div className="streak-mini-grid">
            {Array.from({ length: STREAK_LENGTH }, (_, i) => (
              <div
                key={i}
                className={`streak-dot ${i < streak.streakCount ? 'filled' : ''} ${i === STREAK_LENGTH - 1 ? 'reward' : ''}`}
                title={i === STREAK_LENGTH - 1 ? 'Day 30: Alpha Genome Shard' : `Day ${i + 1}`}
              />
            ))}
          </div>
          {canClaim ? (
            <button className="btn-streak-claim" onClick={claimDailyStreak}>
              Claim Day {streak.streakCount + 1}
            </button>
          ) : (
            <span className="streak-claimed">✓ Claimed today · {daysLeft} days to Alpha Genome Shard</span>
          )}
          {!streakIntroSeen && (
            <div className="retention-intro-caption">
              <span>Claim your daily streak each day. Reach Day 30 to earn the Alpha Genome Shard — a permanent upgrade.</span>
              <button className="retention-intro-dismiss" aria-label="Dismiss" onClick={dismissStreakIntro}>✕</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
