import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatNumber } from '../game/production';
import { getDimensionLevel, getResearchDurationMs, getRemainingMs, formatCountdown, getRushCost } from '../game/timeDilation';

export function UpgradePanel() {
  const upgrades = useGameStore((s) => s.upgrades);
  const energy = useGameStore((s) => s.energy);
  const totalEnergyProduced = useGameStore((s) => s.totalEnergyProduced);
  const researchQueue = useGameStore((s) => s.researchQueue);
  const instabilityParticles = useGameStore((s) => s.instabilityParticles);
  const purchaseUpgrade = useGameStore((s) => s.purchaseUpgrade);
  const rushResearch = useGameStore((s) => s.rushResearch);

  // Force re-render every second so countdown ticks
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const dimLevel = getDimensionLevel(upgrades);
  const durationMs = getResearchDurationMs(dimLevel);
  const rushCost = getRushCost(dimLevel);
  const queuedIds = new Set(researchQueue.map((i) => i.upgradeId));

  const visible = upgrades.filter(
    (u) => !u.purchased && !queuedIds.has(u.id) && (u.unlockAt === undefined || totalEnergyProduced >= u.unlockAt)
  );
  const purchased = upgrades.filter((u) => u.purchased);

  // Next locked upgrade — teaser row
  const nextLocked = upgrades
    .filter((u) => !u.purchased && u.unlockAt !== undefined && totalEnergyProduced < u.unlockAt!)
    .sort((a, b) => a.unlockAt! - b.unlockAt!)[0] ?? null;
  const now = Date.now();

  return (
    <section className="panel">
      <h3 className="panel-title">Research</h3>

      {dimLevel >= 5 && (
        <p className="time-dilation-notice">
          ⏳ Dimension {dimLevel} — research takes {formatCountdown(durationMs)}
          {instabilityParticles >= rushCost
            ? ` · Rush costs ${Math.floor(rushCost)} ⚡IP`
            : ` · Earn ${Math.floor(rushCost)} ⚡IP to rush`}
        </p>
      )}

      {/* Active research queue */}
      {researchQueue.length > 0 && (
        <div className="research-queue">
          <h4 className="purchased-title">In Progress</h4>
          {researchQueue.map((item) => {
            const remaining = getRemainingMs(item, now);
            const pct = Math.max(0, Math.min(100, ((item.durationMs - remaining) / item.durationMs) * 100));
            const upgrade = upgrades.find((u) => u.id === item.upgradeId);
            const canRush = instabilityParticles >= rushCost;
            return (
              <div key={item.upgradeId} className="upgrade-row queued">
                <div className="upgrade-info">
                  <span className="upgrade-name">{upgrade?.name ?? item.upgradeId}</span>
                  <span className="upgrade-desc">Ready in {formatCountdown(remaining)}</span>
                  <div className="research-progress-bar">
                    <div className="research-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <button
                  className={`btn-upgrade ${canRush ? '' : 'disabled'}`}
                  onClick={() => canRush && rushResearch(item.upgradeId)}
                  disabled={!canRush}
                  title={`Rush: −50% time · costs ${Math.floor(rushCost)} ⚡IP`}
                >
                  Rush ({Math.floor(rushCost)} ⚡IP)
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Available upgrades */}
      {visible.length === 0 && purchased.length === 0 && researchQueue.length === 0 && (
        <p className="empty-hint">Produce more energy to unlock upgrades.</p>
      )}
      {visible.length === 0 && (purchased.length > 0 || researchQueue.length > 0) && (
        <p className="empty-hint">All available upgrades purchased or queued. Keep producing!</p>
      )}
      <div className="upgrade-list">
        {visible.map((u) => {
          const canAfford = energy >= u.cost;
          const label = durationMs > 0 ? `${formatNumber(u.cost)} · ${formatCountdown(durationMs)}` : formatNumber(u.cost);
          return (
            <div key={u.id} className={`upgrade-row ${canAfford ? 'affordable' : ''}`}>
              <div className="upgrade-info">
                <span className="upgrade-name">{u.name}</span>
                <span className="upgrade-desc">{u.description}</span>
              </div>
              <button
                className={`btn-upgrade ${canAfford ? '' : 'disabled'}`}
                onClick={() => canAfford && purchaseUpgrade(u.id)}
                disabled={!canAfford}
              >
                {label}
              </button>
            </div>
          );
        })}
      </div>

      {/* Next locked upgrade teaser */}
      {nextLocked && (
        <div className="upgrade-row upgrade-locked-teaser">
          <div className="upgrade-info">
            <span className="upgrade-name upgrade-locked-name">
              🔒 {nextLocked.name}
            </span>
            <span className="upgrade-desc">{nextLocked.description}</span>
            <div className="upgrade-unlock-progress">
              <div className="upgrade-unlock-bar">
                <div
                  className="upgrade-unlock-fill"
                  style={{ width: `${Math.min(100, (totalEnergyProduced / nextLocked.unlockAt!) * 100)}%` }}
                />
              </div>
              <span className="upgrade-unlock-label">
                {formatNumber(Math.min(totalEnergyProduced, nextLocked.unlockAt!))} / {formatNumber(nextLocked.unlockAt!)} energy
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Purchased */}
      {purchased.length > 0 && (
        <div className="purchased-list">
          <h4 className="purchased-title">Completed</h4>
          {purchased.map((u) => (
            <div key={u.id} className="upgrade-row purchased">
              <span className="upgrade-name">{u.name}</span>
              <span className="upgrade-multiplier">×{u.multiplier}</span>
            </div>
          ))}
        </div>
      )}

      {dimLevel >= 3 && (
        <p className="ip-hint">⚡ Instability Particles: {formatNumber(instabilityParticles)} (from unstable monsters)</p>
      )}
    </section>
  );
}
