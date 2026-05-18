import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { TOWER_FLOORS } from '../game/tower/towerFloors';
import {
  getMsUntilNextReset,
  getCurrentAttemptFloor,
  calcPlayerPower,
  TOWER_ENERGY_REWARDS,
  TOWER_MILESTONE_FLOORS,
} from '../game/tower/towerLogic';
import type { TowerAttemptResult } from '../game/tower/types';

const UNDO_WINDOW_MS = 2000;
const UNDO_TICK_MS = 50;

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

function formatPower(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

interface ResultModalProps {
  result: TowerAttemptResult;
  onClose: () => void;
}

function ResultModal({ result, onClose }: ResultModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{result.success ? '✓ Floor Cleared!' : '✗ Attempt Failed'}</h2>
        <div className="tower-result-stats">
          <div>
            <span className="stat-label">Your Power</span>
            <span className="stat-value">{formatPower(result.playerPower)}</span>
          </div>
          <div>
            <span className="stat-label">Floor Threshold</span>
            <span className="stat-value">{formatPower(result.floorThreshold)}</span>
          </div>
        </div>
        {result.success && (
          <div className="tower-result-rewards">
            {result.rewardEnergyGranted > 0 && (
              <p>+{formatPower(result.rewardEnergyGranted)} Energy</p>
            )}
            {result.milestoneBadgeGranted && (
              <p>Badge earned: <strong>{result.milestoneBadgeGranted.replace(/_/g, ' ')}</strong></p>
            )}
            {result.rewardSpeciesGranted && (
              <p>New species unlocked: <strong>{result.rewardSpeciesGranted}</strong></p>
            )}
          </div>
        )}
        {!result.success && (
          <p className="tower-result-hint">
            {result.playerPower < result.floorThreshold * 0.5
              ? 'Your power is too low. Grow your farm and try again.'
              : 'So close — a bit more power will tip the odds in your favor.'}
          </p>
        )}
        <button className="btn-primary" onClick={onClose}>Continue</button>
      </div>
    </div>
  );
}

export function TowerTab() {
  const towerState = useGameStore((s) => s.towerState);
  const monsters = useGameStore((s) => s.monsters);
  const attemptTowerFloor = useGameStore((s) => s.attemptTowerFloor);
  const pendingTowerResult = useGameStore((s) => s.pendingTowerResult);
  const dismissTowerResult = useGameStore((s) => s.dismissTowerResult);

  const [countdown, setCountdown] = useState(() => getMsUntilNextReset());
  const [pendingFloor, setPendingFloor] = useState<number | null>(null);
  const [undoPct, setUndoPct] = useState(100);
  const attemptTowerFloorRef = useRef(attemptTowerFloor);
  attemptTowerFloorRef.current = attemptTowerFloor;

  useEffect(() => {
    const id = setInterval(() => setCountdown(getMsUntilNextReset()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Fire the action after the undo window expires
  useEffect(() => {
    if (pendingFloor === null) return;
    const id = setTimeout(() => {
      attemptTowerFloorRef.current(pendingFloor);
      setPendingFloor(null);
    }, UNDO_WINDOW_MS);
    return () => clearTimeout(id);
  }, [pendingFloor]);

  // Drain the progress bar
  useEffect(() => {
    if (pendingFloor === null) return;
    setUndoPct(100);
    const id = setInterval(() => {
      setUndoPct((prev) => Math.max(0, prev - (UNDO_TICK_MS / UNDO_WINDOW_MS) * 100));
    }, UNDO_TICK_MS);
    return () => clearInterval(id);
  }, [pendingFloor]);

  const playerPower = calcPlayerPower(monsters);
  const currentFloor = getCurrentAttemptFloor(towerState);

  return (
    <div className="tower-tab">
      {pendingTowerResult && (
        <ResultModal result={pendingTowerResult} onClose={dismissTowerResult} />
      )}

      {pendingFloor !== null && (
        <div className="tower-undo-banner">
          <div className="tower-undo-bar" style={{ width: `${undoPct}%` }} />
          <div className="tower-undo-content">
            <span className="tower-undo-label">Challenging Floor {pendingFloor}…</span>
            <button
              className="tower-undo-btn"
              onClick={() => setPendingFloor(null)}
            >
              Undo
            </button>
          </div>
        </div>
      )}

      <div className="tower-header">
        <div className="tower-header-stats">
          <div className="tower-stat">
            <span className="tower-stat-label">All-Time Best</span>
            <span className="tower-stat-value">
              {towerState.highestEverFloor > 0 ? `Floor ${towerState.highestEverFloor}` : '—'}
            </span>
          </div>
          <div className="tower-stat">
            <span className="tower-stat-label">This Week</span>
            <span className="tower-stat-value">
              {towerState.weeklyFloor > 0 ? `Floor ${towerState.weeklyFloor}` : 'Not started'}
            </span>
          </div>
          <div className="tower-stat">
            <span className="tower-stat-label">Your Power</span>
            <span className="tower-stat-value">{formatPower(playerPower)}</span>
          </div>
          <div className="tower-stat">
            <span className="tower-stat-label">Resets in</span>
            <span className="tower-stat-value">{formatCountdown(countdown)}</span>
          </div>
        </div>

        {towerState.permanentBadges.length > 0 && (
          <div className="tower-badges">
            {towerState.permanentBadges.map((badge) => (
              <span key={badge} className="tower-badge-chip">
                {badge.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="tower-milestone-info">
        {TOWER_MILESTONE_FLOORS.map((mf) => {
          const claimed = towerState.weeklyRewardsClaimed.includes(mf);
          return (
            <span key={mf} className={`tower-milestone-pill ${claimed ? 'claimed' : ''}`}>
              Floor {mf}: {TOWER_ENERGY_REWARDS[mf].toLocaleString()} ⚡
              {mf === 30 ? ' + Legendary egg' : mf === 20 ? ' + Rare egg' : ''}
              {claimed ? ' ✓' : ''}
            </span>
          );
        })}
      </div>

      <div className="tower-floor-list">
        {TOWER_FLOORS.map((floorDef) => {
          const status =
            floorDef.floor <= towerState.weeklyFloor
              ? 'cleared'
              : floorDef.floor === currentFloor
              ? 'current'
              : 'locked';

          return (
            <div
              key={floorDef.floor}
              className={`tower-floor-row tower-floor-${status} ${floorDef.isBoss ? 'tower-floor-boss' : ''}`}
            >
              <div className="tower-floor-left">
                <span className="tower-floor-number">
                  {status === 'cleared' ? '✓' : status === 'current' ? '▶' : '🔒'} F{floorDef.floor}
                </span>
                <div className="tower-floor-info">
                  <span className="tower-floor-name">{floorDef.name}</span>
                  <span className="tower-floor-team">
                    {floorDef.npcTeam.map((m) => `${m.name} ×${m.count}`).join(', ')}
                  </span>
                </div>
              </div>
              <div className="tower-floor-right">
                <span className="tower-floor-threshold">
                  Threshold: {formatPower(floorDef.powerThreshold)}
                </span>
                {status === 'current' && (
                  <button
                    className="btn-primary tower-challenge-btn"
                    disabled={pendingFloor !== null}
                    onClick={() => setPendingFloor(floorDef.floor)}
                  >
                    Challenge
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
