import { useGameStore } from '../store/gameStore';
import { getEffectiveProductionPerSecond, formatNumber } from '../game/production';

export function ResourceDisplay() {
  const energy = useGameStore((s) => s.energy);
  const monsters = useGameStore((s) => s.monsters);
  const productionMultiplier = useGameStore((s) => s.productionMultiplier);
  const totalEnergyProduced = useGameStore((s) => s.totalEnergyProduced);

  const perSecond = getEffectiveProductionPerSecond({ monsters, productionMultiplier });

  return (
    <section className="resource-display">
      <div className="energy-orb">
        <div className="energy-value">{formatNumber(energy)}</div>
        <div className="energy-label">ENERGY</div>
      </div>
      <div className="production-stats">
        <div className="stat-row">
          <span className="stat-label">Per second</span>
          <span className="stat-value">{formatNumber(perSecond)}/s</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">All time</span>
          <span className="stat-value">{formatNumber(totalEnergyProduced)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Multiplier</span>
          <span className="stat-value">{productionMultiplier.toFixed(1)}×</span>
        </div>
      </div>
    </section>
  );
}
