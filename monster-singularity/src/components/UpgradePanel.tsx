import { useGameStore } from '../store/gameStore';
import { formatNumber } from '../game/production';

export function UpgradePanel() {
  const upgrades = useGameStore((s) => s.upgrades);
  const energy = useGameStore((s) => s.energy);
  const totalEnergyProduced = useGameStore((s) => s.totalEnergyProduced);
  const purchaseUpgrade = useGameStore((s) => s.purchaseUpgrade);

  const visible = upgrades.filter(
    (u) => !u.purchased && (u.unlockAt === undefined || totalEnergyProduced >= u.unlockAt)
  );
  const purchased = upgrades.filter((u) => u.purchased);

  return (
    <section className="panel">
      <h3 className="panel-title">Upgrades</h3>
      {visible.length === 0 && purchased.length === 0 && (
        <p className="empty-hint">Produce more energy to unlock upgrades.</p>
      )}
      {visible.length === 0 && purchased.length > 0 && (
        <p className="empty-hint">All available upgrades purchased. Keep producing!</p>
      )}
      <div className="upgrade-list">
        {visible.map((u) => {
          const canAfford = energy >= u.cost;
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
                {formatNumber(u.cost)}
              </button>
            </div>
          );
        })}
      </div>
      {purchased.length > 0 && (
        <div className="purchased-list">
          <h4 className="purchased-title">Purchased</h4>
          {purchased.map((u) => (
            <div key={u.id} className="upgrade-row purchased">
              <span className="upgrade-name">{u.name}</span>
              <span className="upgrade-multiplier">×{u.multiplier}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
