import { useGameStore } from '../store/gameStore';
import { CATALOG_BY_ID } from '../game/monster/catalog';
import { formatNumber } from '../game/production';
import type { BreedingPreview, MonsterSpecies } from '../game/monster/types';
import type { BreedingResult } from '../game/monster/breeding';

const RISK_COLORS = { Safe: '#10b981', Risky: '#f59e0b', Dangerous: '#ef4444', Critical: '#ec4899' };

function ParentSelector({ slot, label }: { slot: 'A' | 'B'; label: string }) {
  const ownedSpecies = useGameStore((s) => s.ownedSpecies);
  const parent = useGameStore((s) => slot === 'A' ? s.breedingParentA : s.breedingParentB);
  const setBreedingParent = useGameStore((s) => s.setBreedingParent);
  const computeBreedingPreview = useGameStore((s) => s.computeBreedingPreview);

  const ownedCatalog = ownedSpecies
    .map((id) => CATALOG_BY_ID[id])
    .filter(Boolean) as MonsterSpecies[];

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    const species = id ? CATALOG_BY_ID[id] ?? null : null;
    setBreedingParent(slot, species);
    if (species) computeBreedingPreview();
  }

  return (
    <div className="parent-selector">
      <label className="parent-label">{label}</label>
      <select
        className="parent-select"
        value={parent?.id ?? ''}
        onChange={handleChange}
      >
        <option value="">— select parent —</option>
        {ownedCatalog.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.stabilityClass})
          </option>
        ))}
      </select>
      {parent && (
        <div className="parent-chip">
          <span>{parent.name}</span>
          <span className="gene-seq">{parent.geneSequence.join('-')}</span>
        </div>
      )}
    </div>
  );
}

function PreviewCard({ preview }: { preview: BreedingPreview }) {
  const riskColor = RISK_COLORS[preview.riskLabel];
  return (
    <div className="breeding-preview">
      <h4 className="preview-title">Breeding Preview</h4>
      <div className="preview-stats">
        <div className="preview-stat">
          <span>Gene Sequence</span>
          <span className="gene-seq">{preview.offspringSequence.join('-')}</span>
        </div>
        <div className="preview-stat">
          <span>Predicted Stability</span>
          <span>{preview.predictedStabilityClass}</span>
        </div>
        <div className="preview-stat">
          <span>Est. Production</span>
          <span>{formatNumber(preview.estimatedProductionRate)}/s</span>
        </div>
        <div className="preview-stat">
          <span>Instability Risk</span>
          <span style={{ color: riskColor, fontWeight: 700 }}>
            {preview.riskLabel} ({Math.round(preview.instabilityRisk * 100)}%)
          </span>
        </div>
        {preview.estimatedSpecialTrait !== 'none' && (
          <div className="preview-stat">
            <span>Special Trait</span>
            <span className="special-trait">{preview.estimatedSpecialTrait.replace(/_/g, ' ')}</span>
          </div>
        )}
      </div>

      <div className="outcome-list">
        <span className="outcome-title">Possible Outcomes</span>
        {preview.potentialOutcomes.map((o, i) => (
          <div key={i} className="outcome-row">
            {o.kind === 'success' && <span className="outcome success">✓ Successful breed — new species</span>}
            {o.kind === 'instability_damage' && (
              <span className="outcome warning">
                ⚠ Instability — {o.baseDamagePercent}% base damage, -{o.productionLossPercent}% production
              </span>
            )}
            {o.kind === 'mutation' && <span className="outcome mutation">🧬 Mutation — scrambled gene sequence</span>}
            {o.kind === 'destruction' && <span className="outcome danger">💀 {o.message}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ result, onDismiss }: { result: BreedingResult; onDismiss: () => void }) {
  return (
    <div className="breeding-result">
      {result.baseDestroyed && (
        <>
          <p className="result-title danger">💀 BASE SECTOR DESTROYED</p>
          <p className="result-desc">Reality-Warping instability cascade. The sector is gone.</p>
        </>
      )}
      {!result.baseDestroyed && result.success && (
        <>
          <p className="result-title success">✓ BREEDING SUCCESSFUL</p>
          {result.mutatedSequence ? (
            <p className="result-desc">
              🧬 Mutation occurred! New gene sequence: <span className="gene-seq">{result.mutatedSequence.join('-')}</span>
            </p>
          ) : (
            <p className="result-desc">New species added to your farm and catalog.</p>
          )}
        </>
      )}
      {!result.baseDestroyed && !result.success && result.instabilityEvent && (
        <>
          <p className="result-title warning">⚠ INSTABILITY EVENT</p>
          <p className="result-desc">{result.instabilityEvent.message}</p>
          <p className="result-desc">
            Severity: {result.instabilityEvent.severity} — {result.instabilityEvent.baseDamagePercent}% base damage
          </p>
        </>
      )}
      <button className="btn-primary result-btn" onClick={onDismiss}>
        Continue
      </button>
    </div>
  );
}

export function BreedingPanel() {
  const breedingParentA = useGameStore((s) => s.breedingParentA);
  const breedingParentB = useGameStore((s) => s.breedingParentB);
  const breedingPreview = useGameStore((s) => s.breedingPreview);
  const breedingResult = useGameStore((s) => s.breedingResult);
  const computeBreedingPreview = useGameStore((s) => s.computeBreedingPreview);
  const confirmBreeding = useGameStore((s) => s.confirmBreeding);
  const dismissBreedingResult = useGameStore((s) => s.dismissBreedingResult);
  const ownedSpecies = useGameStore((s) => s.ownedSpecies);

  const canPreview = !!(breedingParentA && breedingParentB);
  const canConfirm = canPreview && !!breedingPreview;

  if (ownedSpecies.length < 2) {
    return (
      <section className="panel">
        <h3 className="panel-title">Genetic Editor</h3>
        <p className="empty-hint">Acquire at least 2 species to begin breeding.</p>
      </section>
    );
  }

  return (
    <section className="panel breeding-panel">
      <h3 className="panel-title">Genetic Editor</h3>

      {!breedingResult ? (
        <>
          <div className="parent-selectors">
            <ParentSelector slot="A" label="Parent A" />
            <span className="breed-cross">×</span>
            <ParentSelector slot="B" label="Parent B" />
          </div>

          {canPreview && !breedingPreview && (
            <button className="btn-primary" onClick={computeBreedingPreview}>
              Compute Preview
            </button>
          )}

          {breedingPreview && <PreviewCard preview={breedingPreview} />}

          {canConfirm && (
            <button className="btn-primary breed-confirm" onClick={confirmBreeding}>
              Confirm Breeding →
            </button>
          )}
        </>
      ) : (
        <ResultCard result={breedingResult} onDismiss={dismissBreedingResult} />
      )}
    </section>
  );
}
