import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { GACHA_BOXES, PITY_THRESHOLD } from '../game/gacha';
import { formatNumber } from '../game/production';

const RARITY_COLORS: Record<string, string> = {
  Common: '#6b7280',
  Uncommon: '#10b981',
  Rare: '#3b82f6',
  Legendary: '#f59e0b',
  Singularity: '#ec4899',
};

const RARITY_GLOW: Record<string, string> = {
  Rare: '0 0 12px rgba(59,130,246,0.7)',
  Legendary: '0 0 16px rgba(245,158,11,0.8)',
  Singularity: '0 0 24px rgba(236,72,153,0.9)',
};

export function GachaPanel() {
  const energy = useGameStore((s) => s.energy);
  const gacha = useGameStore((s) => s.gacha);
  const gachaPullResults = useGameStore((s) => s.gachaPullResults);
  const openGachaBox = useGameStore((s) => s.openGachaBox);
  const dismissGachaResults = useGameStore((s) => s.dismissGachaResults);
  const [selectedBox, setSelectedBox] = useState(GACHA_BOXES[0].id);

  const box = GACHA_BOXES.find((b) => b.id === selectedBox)!;
  const multiCost = Math.floor(box.cost * 10 * 0.9);
  const pityProgress = Math.min(gacha.pityCount, PITY_THRESHOLD);
  const pityPct = (pityProgress / PITY_THRESHOLD) * 100;

  return (
    <section className="panel gacha-panel">
      <h3 className="panel-title">Gacha Capsules</h3>
      <p className="gacha-subtitle">Draw monsters from loot capsules. Duplicates return 30% energy.</p>

      {/* Pity counter */}
      <div className="pity-bar-wrapper">
        <div className="pity-label">
          Pity: {pityProgress} / {PITY_THRESHOLD}
          {pityProgress >= PITY_THRESHOLD && <span className="pity-ready"> — Rare+ guaranteed!</span>}
        </div>
        <div className="pity-bar-track">
          <div className="pity-bar-fill" style={{ width: `${pityPct}%` }} />
        </div>
      </div>

      <div className="gacha-stats">
        <span>Total pulls: {gacha.totalPulls}</span>
      </div>

      {/* Box selector */}
      <div className="gacha-box-tabs">
        {GACHA_BOXES.map((b) => (
          <button
            key={b.id}
            className={`gacha-box-tab ${selectedBox === b.id ? 'active' : ''}`}
            onClick={() => setSelectedBox(b.id)}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Selected box info */}
      <div className="gacha-box-info">
        <p className="gacha-box-desc">{box.description}</p>
        <div className="gacha-odds">
          {Object.entries(box.weights)
            .filter(([, w]) => w > 0)
            .map(([rarity, weight]) => (
              <span
                key={rarity}
                className="gacha-odd-chip"
                style={{ color: RARITY_COLORS[rarity] }}
              >
                {rarity}: {weight}%
              </span>
            ))}
        </div>
      </div>

      {/* Pull buttons */}
      <div className="gacha-actions">
        <button
          className={`btn-gacha single ${energy >= box.cost ? '' : 'disabled'}`}
          disabled={energy < box.cost}
          onClick={() => openGachaBox(box.id, false)}
        >
          1× Pull — {formatNumber(box.cost)} E
        </button>
        <button
          className={`btn-gacha multi ${energy >= multiCost ? '' : 'disabled'}`}
          disabled={energy < multiCost}
          onClick={() => openGachaBox(box.id, true)}
        >
          10× Pull — {formatNumber(multiCost)} E <span className="discount-tag">-10%</span>
        </button>
      </div>

      {/* Results modal */}
      {gachaPullResults && (
        <div className="gacha-results-backdrop" onClick={dismissGachaResults}>
          <div className="gacha-results" onClick={(e) => e.stopPropagation()}>
            <h4 className="gacha-results-title">Pull Results</h4>
            <div className="gacha-results-list">
              {gachaPullResults.map((r, i) => (
                <div
                  key={i}
                  className={`gacha-result-card ${r.isDuplicate ? 'duplicate' : 'new'}`}
                  style={{
                    borderColor: RARITY_COLORS[r.species.rarityTier],
                    boxShadow: RARITY_GLOW[r.species.rarityTier] ?? 'none',
                  }}
                >
                  <span
                    className="gacha-result-rarity"
                    style={{ color: RARITY_COLORS[r.species.rarityTier] }}
                  >
                    {r.species.rarityTier}
                  </span>
                  <span className="gacha-result-name">{r.species.name}</span>
                  {r.isDuplicate && (
                    <span className="gacha-result-dup">
                      Duplicate +{formatNumber(r.energyRefund)} E
                    </span>
                  )}
                  {!r.isDuplicate && <span className="gacha-result-new">NEW!</span>}
                  {r.pitySaved && <span className="gacha-result-pity">Pity!</span>}
                </div>
              ))}
            </div>
            <button className="btn-gacha-close" onClick={dismissGachaResults}>
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
