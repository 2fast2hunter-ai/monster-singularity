import { useGameStore } from '../store/gameStore';
import { formatNumber } from '../game/production';

export function MonsterPanel() {
  const monsters = useGameStore((s) => s.monsters);
  const productionMultiplier = useGameStore((s) => s.productionMultiplier);
  const energy = useGameStore((s) => s.energy);
  const addMonster = useGameStore((s) => s.addMonster);

  // Cost for next unit: base cost × 1.15^count (classic idle game curve)
  function nextCost(baseCost: number, count: number): number {
    return Math.floor(baseCost * Math.pow(1.15, count));
  }

  const BASE_COSTS: Record<string, number> = {
    slime_basic: 10,
  };

  return (
    <section className="panel">
      <h3 className="panel-title">Monsters</h3>
      <div className="monster-list">
        {monsters.map((m) => {
          const cost = nextCost(BASE_COSTS[m.id] ?? 10, m.count);
          const canAfford = energy >= cost;
          const effectiveRate = m.productionRate * m.count * productionMultiplier;
          return (
            <div key={m.id} className="monster-row">
              <div className="monster-info">
                <span className="monster-name">{m.name}</span>
                <span className="monster-count">×{m.count}</span>
                <span className="monster-rate">{formatNumber(effectiveRate)}/s</span>
              </div>
              <button
                className={`btn-buy ${canAfford ? '' : 'disabled'}`}
                onClick={() => canAfford && addMonster(m.id)}
                disabled={!canAfford}
              >
                Buy ({formatNumber(cost)})
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
