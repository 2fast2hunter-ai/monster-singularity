import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { SEED_CATALOG } from '../game/monster/catalog';
import type { MonsterSpecies } from '../game/monster/types';
import { formatNumber } from '../game/production';
import { getCurrentDimensionStorm } from '../game/dimensionStorm';
import { MonsterSprite } from './MonsterSprite';
import type { StabilityClass } from '../game/monster/types';
import type { RarityTier } from '../game/monster/types';


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

const DIMENSION_COLORS: Record<number, string> = {
  1: '#6b7280',
  2: '#3b82f6',
  3: '#a855f7',
};

const DIMENSION_LABELS: Record<number, string> = {
  1: 'Dim 1',
  2: 'Dim 2',
  3: 'Dim 3',
};

export function CatalogPanel() {
  const ownedSpecies = useGameStore((s) => s.ownedSpecies);
  const [filter, setFilter] = useState<string>('All');
  const [dimFilter, setDimFilter] = useState<number | 'All'>('All');
  const [selected, setSelected] = useState<MonsterSpecies | null>(null);

  const storm = getCurrentDimensionStorm();

  const STABILITY_ICONS: Record<string, string> = {
    Stable: '🟢',
    Volatile: '🟡',
    Chaotic: '🟠',
    Aberrant: '🔴',
    'Reality-Warping': '💜',
  };

  const RARITY_ICONS: Record<string, string> = {
    Common: '⬜',
    Uncommon: '🟩',
    Rare: '🟦',
    Legendary: '🟨',
    Singularity: '💗',
  };

  const stabilities = ['All', 'Stable', 'Volatile', 'Chaotic', 'Aberrant', 'Reality-Warping'];

  const visible = SEED_CATALOG.filter((s) => {
    const stabilityMatch = filter === 'All' || s.stabilityClass === filter;
    const dimMatch = dimFilter === 'All' || (s.dimension ?? 1) === dimFilter;
    return stabilityMatch && dimMatch;
  });

  return (
    <section className="panel catalog-panel">
      <h3 className="panel-title">Omni-Dex Catalog — {SEED_CATALOG.length} Species</h3>

      <div className="catalog-filters" style={{ marginBottom: 4 }}>
        {([`All` as const, 1, 2, 3] as const).map((d) => (
          <button
            key={d}
            className={`filter-btn ${dimFilter === d ? 'active' : ''}`}
            style={dimFilter === d && d !== 'All' ? { borderColor: DIMENSION_COLORS[d], color: DIMENSION_COLORS[d] } : {}}
            onClick={() => setDimFilter(d)}
          >
            {d === 'All' ? 'All Dims' : `✦ ${DIMENSION_LABELS[d]}`}
          </button>
        ))}
      </div>

      <div className="catalog-filters">
        {stabilities.map((s) => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? 'active' : ''}`}
            style={filter === s && s !== 'All' ? { borderColor: STABILITY_COLORS[s], color: STABILITY_COLORS[s] } : {}}
            onClick={() => setFilter(s)}
          >
            {s !== 'All' && <span style={{ marginRight: 4 }}>{STABILITY_ICONS[s]}</span>}
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
                <MonsterSprite
                  stabilityClass={species.stabilityClass as StabilityClass}
                  rarity={species.rarityTier as RarityTier}
                  monsterId={species.id}
                  size={28}
                  owned={owned}
                />
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
                  <div className="catalog-badges">
                    <span
                      className="catalog-stability"
                      style={{ color: STABILITY_COLORS[species.stabilityClass] }}
                    >
                      {STABILITY_ICONS[species.stabilityClass]} {species.stabilityClass}
                    </span>
                    <span
                      className="rarity-badge"
                      style={{ color: RARITY_COLORS[species.rarityTier], borderColor: RARITY_COLORS[species.rarityTier] }}
                    >
                      {species.rarityTier}
                    </span>
                    {(species.dimension ?? 1) > 1 && (
                      <span
                        className="rarity-badge"
                        style={{ color: DIMENSION_COLORS[species.dimension!], borderColor: DIMENSION_COLORS[species.dimension!] }}
                      >
                        ✦ {DIMENSION_LABELS[species.dimension!]}
                      </span>
                    )}
                  </div>
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
              <MonsterSprite
                stabilityClass={selected.stabilityClass as StabilityClass}
                rarity={selected.rarityTier as RarityTier}
                monsterId={selected.id}
                size={64}
                owned={ownedSpecies.includes(selected.id)}
              />
              <div style={{ flex: 1 }}>
                <span
                  className="rarity-badge"
                  style={{ color: RARITY_COLORS[selected.rarityTier], borderColor: RARITY_COLORS[selected.rarityTier] }}
                >
                  {RARITY_ICONS[selected.rarityTier]} {selected.rarityTier}
                </span>
                <h4>{selected.name}</h4>
              </div>
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
              <div className="detail-stat">
                <span>Dimension</span>
                <span style={{ color: DIMENSION_COLORS[selected.dimension ?? 1] }}>
                  {selected.dimension ?? 1}
                </span>
              </div>
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
