import { useState } from 'react';
import { getCurrentDimensionStorm } from '../game/dimensionStorm';
import { CATALOG_BY_ID } from '../game/monster/catalog';

const STORM_HINT_KEY = 'ms_storm_hint_seen';

export function DimensionStormBanner() {
  const storm = getCurrentDimensionStorm();
  const names = storm.boostedSpeciesIds
    .map((id) => CATALOG_BY_ID[id]?.name ?? id)
    .join(', ');

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [hintSeen, setHintSeen] = useState(() => !!localStorage.getItem(STORM_HINT_KEY));

  function openTooltip() {
    localStorage.setItem(STORM_HINT_KEY, '1');
    setHintSeen(true);
    setTooltipOpen(true);
  }

  return (
    <div className="storm-banner" style={{ position: 'relative' }}>
      <span className="storm-icon-large">⚡</span>
      <div className="storm-text">
        <span className="storm-title">DIMENSION STORM ACTIVE — {storm.label}</span>
        <span className="storm-desc">
          ×{storm.boostMultiplier} production: {names}
        </span>
      </div>

      {/* First-time info button */}
      {!hintSeen && (
        <button
          className="storm-info-btn"
          aria-label="What is a Dimension Storm?"
          onClick={openTooltip}
        >
          ?
        </button>
      )}

      {/* Tooltip */}
      {tooltipOpen && (
        <div className="storm-tooltip" role="tooltip">
          <p>Every week a <strong>Dimension Storm</strong> randomly boosts selected monster species. Assign those species to your farm to gain the ×{storm.boostMultiplier} production bonus until the storm shifts next Monday.</p>
          <button className="storm-tooltip-close" onClick={() => setTooltipOpen(false)} aria-label="Close">✕</button>
        </div>
      )}
    </div>
  );
}
