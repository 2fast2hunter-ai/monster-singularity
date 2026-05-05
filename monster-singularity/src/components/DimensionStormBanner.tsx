import { getCurrentDimensionStorm } from '../game/dimensionStorm';
import { CATALOG_BY_ID } from '../game/monster/catalog';

export function DimensionStormBanner() {
  const storm = getCurrentDimensionStorm();
  const names = storm.boostedSpeciesIds
    .map((id) => CATALOG_BY_ID[id]?.name ?? id)
    .join(', ');

  return (
    <div className="storm-banner">
      <span className="storm-icon-large">⚡</span>
      <div className="storm-text">
        <span className="storm-title">DIMENSION STORM ACTIVE — {storm.label}</span>
        <span className="storm-desc">
          ×{storm.boostMultiplier} production: {names}
        </span>
      </div>
    </div>
  );
}
