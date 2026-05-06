import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { SEED_CATALOG } from '../game/monster/catalog';
import type { MonsterSpecies } from '../game/monster/types';
import { formatNumber } from '../game/production';
import { getCurrentDimensionStorm } from '../game/dimensionStorm';


const STABILITY_COLORS: Record<string, string> = {
  Stable: '#10b981',
  Volatile: '#f59e0b',
  Chaotic: '#ef4444',
  Aberrant: '#a855f7',
  'Reality-Warping': '#ec4899',
};

const RARITY_COLORS: Record<string, string> = {
  Common: '#6b7280',
  Uncommon: '#10b981',
  Rare: '#3b82f6',
  Legendary: '#f59e0b',
  Singularity: '#ec4899',
};

export function CatalogPanel() {
  const ownedSpecies = useGameStore((s) => s.ownedSpecies);
  const [filter, setFilter] = useState<string>('All');
  const [selected, setSelected] = useState<MonsterSpecies | null>(null);

  const storm = getCurrentDimensionStorm();

  const stabilities = ['All', 'Stable', 'Volatile', 'Chaotic', 'Aberrant', 'Reality-Warping'];

  const visible = filter === 'All'
    ? SEED_CATALOG
    : SEED_CATALOG.filter((s) => s.stabilityClass === filter);

  return (
    <section className="panel catalog-panel">
      <h3 className="panel-title">Omni-Dex Catalog — {SEED_CATALOG.length} Species</h3>

      <div className="catalog-filters">
        {stabilities.map((s) => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="catalog-list">
        {visible.map((species) => {
          const owned = ownedSpecies.includes(species.id);
          const stormBoosted = storm.boostedSpeciesIds.includes(species.id);

          return (
            <div
              key={species.id}
              className={`catalog-row ${owned ? 'owned' : ''} ${stormBoosted ? 'storm-boosted' : ''}`}
              onClick={() => setSelected(species)}
            >
              <div className="catalog-row-main">
                <span
                  className="catalog-slot"
                  style={{ color: RARITY_COLORS[species.rarityTier] }}
                >
                  #{species.omniDexSlot}
                </span>
                <div className="catalog-info">
                  <span className="catalog-name">
                    {species.name}
                    {stormBoosted && <span className="storm-icon" title={`Dimension Storm: ×${storm.boostMultiplier} this week`}> ⚡</span>}
                  </span>
                  <span
                    className="catalog-stability"
                    style={{ color: STABILITY_COLORS[species.stabilityClass] }}
                  >
                    {species.stabilityClass}
                  </span>
                </div>
                <div className="catalog-stats">
                  <span className="catalog-prod">
                    {stormBoosted
                      ? formatNumber(species.baseProductionRate * storm.boostMultiplier)
                      : formatNumber(species.baseProductionRate)}/s
                  </span>
                  {species.instabilityParticleCost > 0 && (
                    <span className="catalog-cost-chip">⚠ {species.instabilityParticleCost}/s</span>
                  )}
                </div>
              </div>

              {owned && <span className="owned-badge">✓ Owned</span>}
              {!owned && <span className="catalog-gacha-hint">Pull via Gacha</span>}
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="catalog-detail-backdrop" onClick={() => setSelected(null)}>
          <div className="catalog-detail" onClick={(e) => e.stopPropagation()}>
            <div className="catalog-detail-header">
              <span style={{ color: RARITY_COLORS[selected.rarityTier] }}>
                [{selected.rarityTier}]
              </span>
              <h4>{selected.name}</h4>
              <button className="detail-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <p className="catalog-detail-desc">{selected.description}</p>
            <div className="catalog-detail-stats">
              <div className="detail-stat">
                <span>Stability</span>
                <span style={{ color: STABILITY_COLORS[selected.stabilityClass] }}>{selected.stabilityClass}</span>
              </div>
              <div className="detail-stat">
                <span>Production</span>
                <span>{formatNumber(selected.baseProductionRate)}/s</span>
              </div>
              <div className="detail-stat">
                <span>Gene Sequence</span>
                <span className="gene-seq">{selected.geneSequence.join('-')}</span>
              </div>
              {selected.specialTrait !== 'none' && (
                <div className="detail-stat">
                  <span>Special Trait</span>
                  <span className="special-trait">{selected.specialTrait.replace(/_/g, ' ')}</span>
                </div>
              )}
              {selected.unlockCondition && (
                <div className="detail-stat">
                  <span>Unlock via</span>
                  <span className="unlock-cond">{selected.unlockCondition}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
