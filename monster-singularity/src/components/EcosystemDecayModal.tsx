import { useState } from 'react';
import { useRetentionStore } from '../store/retentionStore';
import { retentionApi } from '../api/retentionApi';

const PLAYER_ID = 'demo-player';

export function EcosystemDecayModal() {
  const decay = useRetentionStore((s) => s.decayReport);
  const show = useRetentionStore((s) => s.showDecayModal);
  const dismiss = useRetentionStore((s) => s.dismissDecayModal);
  const setInventory = useRetentionStore((s) => s.setInventory);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [restored, setRestored] = useState<number | null>(null);

  if (!show || !decay) return null;

  const lostCount = decay.consumed.length;
  const productionDropPct = Math.round(decay.decayFraction * 100);

  async function watchAd() {
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
      const result = await retentionApi.restoreAfterAd(PLAYER_ID);
      setRestored(result.restored);
      const inv = await retentionApi.getInventory(PLAYER_ID);
      setInventory(inv);
    } catch {
      // restore failed silently — still dismiss
    }
  }

  return (
    <div className="modal-backdrop" onClick={dismiss}>
      <div className="modal decay-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">💀</span>
          <h2>Ecosystem Collapse</h2>
        </div>
        <p className="modal-subtitle">
          Your monsters fought for dominance while you were away.
        </p>

        <div className="modal-stat">
          <span className="stat-label">Offline for</span>
          <span className="stat-value">{decay.hoursOffline.toFixed(1)}h</span>
        </div>
        <div className="modal-stat highlight">
          <span className="stat-label">Monsters lost</span>
          <span className="stat-value decay-loss">-{lostCount}</span>
        </div>
        <div className="modal-stat">
          <span className="stat-label">Production drop</span>
          <span className="stat-value decay-loss">~{productionDropPct}%</span>
        </div>
        <div className="modal-stat">
          <span className="stat-label">Survivors</span>
          <span className="stat-value">{decay.surviving}</span>
        </div>

        {decay.consumed.length > 0 && (
          <div className="decay-lost-list">
            <p className="decay-lost-label">Consumed:</p>
            {decay.consumed.slice(0, 5).map((m) => (
              <span key={m.id} className="decay-lost-chip">{m.name}</span>
            ))}
            {decay.consumed.length > 5 && (
              <span className="decay-lost-chip decay-more">+{decay.consumed.length - 5} more</span>
            )}
          </div>
        )}

        {restored !== null ? (
          <p className="decay-restored-notice">
            {restored > 0
              ? `Restored ${restored} monster${restored > 1 ? 's' : ''}!`
              : 'Nothing left to restore.'}
          </p>
        ) : (
          <button
            className="btn-primary modal-btn btn-watch-ad"
            onClick={watchAd}
            disabled={countdown !== null}
          >
            {countdown !== null
              ? `Ad in ${countdown}s...`
              : `Watch Ad to Restore ~30%`}
          </button>
        )}

        <button className="btn-dismiss modal-btn" onClick={dismiss}>
          {restored !== null ? 'Continue' : 'Dismiss (no restore)'}
        </button>
      </div>
    </div>
  );
}
