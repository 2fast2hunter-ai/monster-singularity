import { useGameStore } from '../store/gameStore';
import { CALENDAR_REWARDS } from '../game/loginCalendar';

const STREAK_LENGTH = 30;

interface Props {
  onClose: () => void;
}

export function LoginCalendarModal({ onClose }: Props) {
  const streak = useGameStore((s) => s.streak);
  const claimDailyStreak = useGameStore((s) => s.claimDailyStreak);
  const calendarClaimResult = useGameStore((s) => s.calendarClaimResult);
  const dismissCalendarClaimResult = useGameStore((s) => s.dismissCalendarClaimResult);

  const today = new Date().toISOString().slice(0, 10);
  const canClaim = streak.lastClaimDate !== today;
  const currentDay = streak.streakCount;

  function handleClaim() {
    claimDailyStreak();
  }

  function handleDismissResult() {
    dismissCalendarClaimResult();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal calendar-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">📅</span>
          <h2>Daily Login Calendar</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {streak.survivorBadge && (
          <div className="calendar-badge-banner">
            🏆 30-Day Survivor — Badge Earned!
          </div>
        )}

        <div className="calendar-grid">
          {Array.from({ length: STREAK_LENGTH }, (_, i) => {
            const day = i + 1;
            const reward = CALENDAR_REWARDS[day];
            const claimed = day <= currentDay;
            const isToday = day === currentDay + 1 && canClaim;
            const isSpecial = reward?.kind === 'egg' || reward?.awardsBadge;

            return (
              <div
                key={day}
                className={[
                  'calendar-day',
                  claimed ? 'claimed' : '',
                  isToday ? 'today pulse' : '',
                  isSpecial ? 'special' : '',
                ].filter(Boolean).join(' ')}
              >
                <span className="calendar-day-num">{day}</span>
                <span className="calendar-day-icon">{claimed ? '✓' : (reward?.icon ?? '⚡')}</span>
                <span className="calendar-day-label">{reward?.label ?? ''}</span>
              </div>
            );
          })}
        </div>

        <div className="calendar-footer">
          {canClaim ? (
            <button className="btn-primary calendar-claim-btn" onClick={handleClaim}>
              Claim Day {currentDay + 1} — {CALENDAR_REWARDS[currentDay + 1]?.label ?? 'Reward'}
            </button>
          ) : (
            <p className="calendar-claimed-msg">✓ Today's reward claimed · Come back tomorrow</p>
          )}
          <p className="calendar-streak-note">Day {currentDay}/{STREAK_LENGTH} · Missing a day resets the streak</p>
        </div>

        {/* Claim result overlay */}
        {calendarClaimResult && (
          <div className="calendar-result-overlay" onClick={handleDismissResult}>
            <div className="calendar-result-box" onClick={(e) => e.stopPropagation()}>
              <div className="calendar-result-icon">{calendarClaimResult.reward.icon}</div>
              <h3>Day {calendarClaimResult.day} Claimed!</h3>
              <p className="calendar-result-reward">{calendarClaimResult.reward.label}</p>
              {calendarClaimResult.pullResult && (
                <p className="calendar-result-species">
                  {calendarClaimResult.pullResult.isDuplicate
                    ? `Duplicate — ${calendarClaimResult.pullResult.species.name}`
                    : `New species: ${calendarClaimResult.pullResult.species.name}!`}
                </p>
              )}
              {calendarClaimResult.badgeAwarded && (
                <p className="calendar-result-badge">🏆 30-Day Survivor badge earned!</p>
              )}
              <button className="btn-primary" onClick={handleDismissResult}>Awesome!</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
