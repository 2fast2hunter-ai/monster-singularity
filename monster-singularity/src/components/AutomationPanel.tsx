import { useGameStore } from '../store/gameStore';
import { AUTOMATION_DEFINITIONS } from '../game/automations';
import { formatNumber } from '../game/production';

export function AutomationPanel() {
  const energy = useGameStore((s) => s.energy);
  const totalEnergyProduced = useGameStore((s) => s.totalEnergyProduced);
  const automations = useGameStore((s) => s.automations);
  const automationState = useGameStore((s) => s.automationState);
  const purchaseAutomation = useGameStore((s) => s.purchaseAutomation);

  const visible = AUTOMATION_DEFINITIONS.filter(
    (a) => totalEnergyProduced >= a.unlockAt
  );

  if (visible.length === 0) {
    return (
      <section className="panel">
        <h3 className="panel-title">Automations</h3>
        <p className="empty-hint">Produce more energy to unlock automations.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h3 className="panel-title">Automations</h3>
      <div className="upgrade-list">
        {visible.map((def) => {
          const owned = automations.includes(def.id);
          const canAfford = energy >= def.cost;
          const lastFired = automationState[def.id];
          const intervalSec = def.intervalMs / 1000;

          return (
            <div
              key={def.id}
              className={`upgrade-row ${owned ? 'purchased' : canAfford ? 'affordable' : ''}`}
            >
              <div className="upgrade-info">
                <span className="upgrade-name">
                  {def.name}
                  {owned && <span style={{ color: '#4ade80', marginLeft: 6, fontSize: '11px' }}>● Active</span>}
                </span>
                <span className="upgrade-desc">{def.description}</span>
                {owned && lastFired && (
                  <span style={{ fontSize: '10px', color: '#6b7280' }}>
                    Last fired: {new Date(lastFired).toLocaleTimeString()} · every {intervalSec}s
                  </span>
                )}
              </div>
              {owned ? (
                <span className="upgrade-multiplier">✓</span>
              ) : (
                <button
                  className={`btn-upgrade ${canAfford ? '' : 'disabled'}`}
                  onClick={() => canAfford && purchaseAutomation(def.id)}
                  disabled={!canAfford}
                >
                  {formatNumber(def.cost)}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
