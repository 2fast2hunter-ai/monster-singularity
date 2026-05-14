import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatNumber } from '../game/production';
import { STABILITY_MULTIPLIERS } from '../game/production';
import { getInstabilityParticlesPerSecond } from '../game/timeDilation';
import { MonsterSprite } from './MonsterSprite';

const IP_CAPACITY = 500;
const IP_HINT_KEY = 'ms_ip_hint_dismissed';

export function MonsterPanel() {
  const [ipHintDismissed, setIpHintDismissed] = useState(
    () => !!localStorage.getItem(IP_HINT_KEY)
  );
  const monsters = useGameStore((s) => s.monsters);
  const productionMultiplier = useGameStore((s) => s.productionMultiplier);
  const energy = useGameStore((s) => s.energy);
  const addMonster = useGameStore((s) => s.addMonster);
  const instabilityParticles = useGameStore((s) => s.instabilityParticles);
  const instabilityDepletedSince = useGameStore((s) => s.instabilityDepletedSince);

  function nextCost(baseCost: number, count: number): number {
    return Math.floor(baseCost * Math.pow(1.15, count));
  }

  const BASE_COSTS: Record<string, number> = {
    slime_basic: 10,
  };

  function calcMaxBuy(baseCost: number, owned: number, budget: number): number {
    let total = 0;
    let k = 0;
    while (true) {
      const c = nextCost(baseCost, owned + k);
      if (total + c > budget) break;
      total += c;
      k++;
      if (k > 10000) break; // safety cap
    }
    return k;
  }

  const ipPerSec = getInstabilityParticlesPerSecond(monsters);
  const ipConsumedPerSec = monsters.reduce((sum, m) => {
    const rates: Record<string, number> = { Chaotic: 0.05, Aberrant: 0.2, 'Reality-Warping': 0.8 };
    return sum + (rates[m.stabilityClass] ?? 0) * m.count;
  }, 0);
  const ipNetPerSec = ipPerSec - ipConsumedPerSec;
  const ipFill = Math.min(1, instabilityParticles / IP_CAPACITY);

  const depletedMs = instabilityDepletedSince ? Date.now() - instabilityDepletedSince : null;
  const decayWarning = depletedMs !== null && depletedMs >= 5 * 60 * 1000; // warn at 5 min

  return (
    <section className="panel">
      <h3 className="panel-title">Bio-Reactor Farm</h3>

      {/* Instability Particle Meter */}
      <div className="ip-meter">
        <div className="ip-meter-header">
          <span className="ip-label">⚡ Instability Particles</span>
          {!ipHintDismissed && (
            <button
              className="ip-hint-btn"
              aria-label="What are Instability Particles?"
              onClick={() => {
                localStorage.setItem(IP_HINT_KEY, '1');
                setIpHintDismissed(true);
              }}
            >
              ✕
            </button>
          )}
          <span className="ip-value">
            {formatNumber(instabilityParticles)} / {IP_CAPACITY}
            {ipNetPerSec !== 0 && (
              <span className={ipNetPerSec > 0 ? 'ip-gain' : 'ip-drain'}>
                {' '}({ipNetPerSec > 0 ? '+' : ''}{ipNetPerSec.toFixed(2)}/s)
              </span>
            )}
          </span>
        </div>
        <div className="ip-bar-track">
          <div
            className={`ip-bar-fill${decayWarning ? ' ip-bar-warning' : ''}`}
            style={{ width: `${ipFill * 100}%` }}
          />
        </div>
        {!ipHintDismissed && (
          <div className="ip-first-time-hint">
            IP fuels high-class monsters. Stable monsters generate it; Chaotic and above consume it.
            If it hits zero, unstable monsters start eating your weaker ones.
          </div>
        )}
        {decayWarning && (
          <div className="ip-decay-warning">
            ⚠ Particles depleted — high-class monsters will begin consuming lower-class ones!
          </div>
        )}
      </div>

      <div className="monster-list">
        {monsters.map((m) => {
          const baseCost = BASE_COSTS[m.id] ?? 10;
          const cost = nextCost(baseCost, m.count);
          const canAfford = energy >= cost;
          const maxBuy = calcMaxBuy(baseCost, m.count, energy);
          const stabilityMult = STABILITY_MULTIPLIERS[m.stabilityClass] ?? 1.0;
          const effectiveRate = m.productionRate * m.count * stabilityMult * productionMultiplier;
          return (
            <div key={m.id} className="monster-row">
              <span className="monster-icon">
                <MonsterSprite stabilityClass={m.stabilityClass as 'Stable'|'Volatile'|'Chaotic'|'Aberrant'|'Reality-Warping'} monsterId={m.id} size={40} />
              </span>
              <div className="monster-info">
                <span className="monster-name">{m.name}</span>
                <span className="monster-stability">
                  {m.stabilityClass} ({stabilityMult}×)
                </span>
                <span className="monster-count">×{m.count}</span>
                <span className="monster-rate">{formatNumber(effectiveRate)}/s</span>
              </div>
              <div className="buy-buttons">
                <button
                  className={`btn-buy ${canAfford ? '' : 'disabled'}`}
                  onClick={() => canAfford && addMonster(m.id)}
                  disabled={!canAfford}
                >
                  Buy ({formatNumber(cost)})
                </button>
                <button
                  className={`btn-buy btn-buy-max ${maxBuy > 0 ? '' : 'disabled'}`}
                  onClick={() => maxBuy > 0 && addMonster(m.id, maxBuy)}
                  disabled={maxBuy === 0}
                  title={`Buy ${maxBuy} at once`}
                >
                  Max (×{maxBuy})
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
