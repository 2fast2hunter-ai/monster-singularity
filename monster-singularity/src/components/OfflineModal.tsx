import { useGameStore } from '../store/gameStore';
import { formatNumber, formatDuration } from '../game/production';

export function OfflineModal() {
  const catchup = useGameStore((s) => s.offlineCatchup);
  const dismiss = useGameStore((s) => s.dismissCatchup);

  if (!catchup) return null;

  return (
    <div className="modal-backdrop" onClick={dismiss}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">🌀</span>
          <h2>Welcome Back</h2>
        </div>
        <p className="modal-subtitle">Your monsters kept working while you were gone.</p>
        <div className="modal-stat">
          <span className="stat-label">Offline for</span>
          <span className="stat-value">{formatDuration(catchup.offlineSeconds)}</span>
        </div>
        <div className="modal-stat highlight">
          <span className="stat-label">Energy gained</span>
          <span className="stat-value">+{formatNumber(catchup.energyGained)}</span>
        </div>
        {catchup.wasCapped && (
          <p className="modal-cap-notice">
            Production was capped at 48h maximum. Consider visiting more often.
          </p>
        )}
        <button className="btn-primary modal-btn" onClick={dismiss}>
          Continue
        </button>
      </div>
    </div>
  );
}
