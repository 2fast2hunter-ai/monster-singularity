import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  getAuctionWeekSeed,
  getAuctionSpecies,
  getAuctionFloor,
  getAuctionCloseTime,
  getSimulatedBid,
  getPastAuctions,
  formatCountdown,
  AUCTION_BASE_BID,
} from '../game/auction';
import { formatNumber } from '../game/production';

const RARITY_COLOR: Record<string, string> = {
  Legendary: 'var(--amber)',
  Singularity: 'var(--accent-glow)',
};

const AUCTION_INTRO_KEY = 'ms_auction_intro_dismissed';

export function AuctionPanel() {
  const energy = useGameStore((s) => s.energy);
  const auction = useGameStore((s) => s.auction);
  const ownedSpecies = useGameStore((s) => s.ownedSpecies);
  const placeBid = useGameStore((s) => s.placeBid);
  const grantAuctionWin = useGameStore((s) => s.grantAuctionWin);

  const [now, setNow] = useState(() => Date.now());
  const [bidInput, setBidInput] = useState('');
  const [bidError, setBidError] = useState('');
  const [introDismissed, setIntroDismissed] = useState(() => !!localStorage.getItem(AUCTION_INTRO_KEY));

  function dismissIntro() {
    localStorage.setItem(AUCTION_INTRO_KEY, '1');
    setIntroDismissed(true);
  }

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const weekSeed = getAuctionWeekSeed();
  const species = getAuctionSpecies(weekSeed);
  const floor = getAuctionFloor(weekSeed);
  const closeTime = getAuctionCloseTime(weekSeed);
  const currentBid = getSimulatedBid(weekSeed, now);
  const pastAuctions = getPastAuctions(4);

  const auctionClosed = now >= closeTime;
  const hasBid = auction.weekNumber === weekSeed && auction.playerBid !== null;
  const playerBid = hasBid ? auction.playerBid! : null;

  // Determine outcome once auction closes
  const outcome: 'won' | 'lost' | null = auctionClosed && hasBid
    ? (playerBid! >= floor ? 'won' : 'lost')
    : null;

  // Grant species once on win detection
  const grantedRef = useRef(false);
  useEffect(() => {
    if (outcome === 'won' && !ownedSpecies.includes(species.id) && !grantedRef.current) {
      grantedRef.current = true;
      grantAuctionWin(species.id);
    }
  }, [outcome, species.id, ownedSpecies, grantAuctionWin]);

  const msRemaining = Math.max(0, closeTime - now);
  const weekProgress = 1 - msRemaining / (7 * 24 * 3600 * 1000);
  const suggestedBid = Math.ceil(floor * 1.05); // 5% over floor to guarantee win

  const daysUntilNext = Math.ceil(msRemaining / 86400000);

  function handleBid() {
    const amount = parseInt(bidInput, 10);
    if (isNaN(amount) || amount <= 0) {
      setBidError('Enter a valid energy amount.');
      return;
    }
    if (amount > energy) {
      setBidError('Insufficient energy.');
      return;
    }
    setBidError('');
    placeBid(amount);
    setBidInput('');
  }

  const rarityColor = RARITY_COLOR[species.rarityTier] ?? 'var(--accent-light)';

  return (
    <div className="auction-panel">
      {/* First-time intro card */}
      {!introDismissed && (
        <div className="auction-intro-card">
          <div className="auction-intro-header">
            <span>🏺 How Auctions Work</span>
            <button className="auction-intro-close" onClick={dismissIntro} aria-label="Dismiss">✕</button>
          </div>
          <ul className="auction-intro-list">
            <li>Every <strong>Monday</strong> a new Legendary or Singularity monster goes up for auction.</li>
            <li>Bid your <strong>energy</strong> — the highest bid above the hidden floor wins.</li>
            <li>You can only bid once per week, so choose your amount carefully.</li>
            <li>Winners receive the species immediately and it counts toward your OmniDex.</li>
          </ul>
        </div>
      )}

      <div className="auction-header">
        <span className="auction-icon">🏺</span>
        <div>
          <div className="auction-title">CRYPTO-ZOO AUCTION</div>
          <div className="auction-subtitle">
            {auctionClosed
              ? 'This week\'s auction has closed. Next opens Monday.'
              : `Closes in ${formatCountdown(msRemaining)}`}
          </div>
        </div>
        {!auctionClosed && (
          <div className="auction-countdown-pill">{formatCountdown(msRemaining)}</div>
        )}
      </div>

      {/* Current species card */}
      <div className="auction-card" style={{ borderColor: rarityColor }}>
        <div className="auction-card-header">
          <div>
            <div className="auction-species-name" style={{ color: rarityColor }}>
              {species.name}
            </div>
            <div className="auction-species-meta">
              {species.stabilityClass} · <span style={{ color: rarityColor }}>{species.rarityTier}</span>
            </div>
          </div>
          <div className="auction-card-stats">
            <div className="auction-stat-chip">
              ⚡ {species.baseProductionRate}/s
            </div>
            {species.specialTrait !== 'none' && (
              <div className="auction-stat-chip trait">{species.specialTrait.replace(/_/g, ' ')}</div>
            )}
          </div>
        </div>
        <div className="auction-species-desc">{species.description}</div>
        <div className="auction-gene-seq">
          GENE: {species.geneSequence.join('-')}
        </div>
      </div>

      {/* Bid state: active auction */}
      {!auctionClosed && (
        <div className="auction-bid-section">
          <div className="auction-bid-row">
            <div className="auction-bid-col">
              <div className="auction-bid-label">CURRENT BID</div>
              <div className="auction-bid-value">{formatNumber(currentBid)}</div>
              <div className="auction-bid-hint">Started at {formatNumber(AUCTION_BASE_BID)} · rising</div>
            </div>
            <div className="auction-bid-col">
              <div className="auction-bid-label">WINNING FLOOR</div>
              <div className="auction-bid-value" style={{ color: 'var(--amber)' }}>
                {auctionClosed ? formatNumber(floor) : '???'}
              </div>
              <div className="auction-bid-hint">Revealed at close</div>
            </div>
          </div>

          {/* Urgency progress bar */}
          <div className="auction-progress-track">
            <div
              className="auction-progress-fill"
              style={{ width: `${Math.min(100, weekProgress * 100).toFixed(1)}%` }}
            />
          </div>
          <div className="auction-progress-labels">
            <span>Week start</span>
            <span>Close (Monday 00:00 UTC)</span>
          </div>

          {!hasBid ? (
            <div className="auction-input-row">
              <div className="auction-input-group">
                <input
                  className="auction-input"
                  type="number"
                  min={1}
                  value={bidInput}
                  onChange={(e) => { setBidInput(e.target.value); setBidError(''); }}
                  placeholder={`Suggested: ${formatNumber(suggestedBid)}`}
                />
                <button
                  className="btn-primary auction-bid-btn"
                  onClick={handleBid}
                  disabled={!bidInput || parseInt(bidInput, 10) > energy}
                >
                  PLACE BID
                </button>
              </div>
              {bidError && <div className="auction-error">{bidError}</div>}
              <div className="auction-input-hint">
                You have {formatNumber(energy)} energy · One bid per week · Cannot be changed
              </div>
            </div>
          ) : (
            <div className="auction-locked-bid">
              <span className="auction-locked-icon">🔒</span>
              <div>
                <div className="auction-locked-label">YOUR BID IS LOCKED IN</div>
                <div className="auction-locked-value">{formatNumber(playerBid!)} energy</div>
                <div className="auction-locked-hint">
                  Outcome revealed when auction closes
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result screen: auction closed */}
      {auctionClosed && (
        <div className={`auction-result ${outcome ?? 'missed'}`}>
          {outcome === 'won' && (
            <>
              <div className="auction-result-icon">🏆</div>
              <div className="auction-result-title" style={{ color: 'var(--green)' }}>YOU WON!</div>
              <div className="auction-result-desc">
                <strong style={{ color: rarityColor }}>{species.name}</strong> has been added to your Omni-Dex.
                Your bid of <strong>{formatNumber(playerBid!)}</strong> exceeded the floor of{' '}
                <strong>{formatNumber(floor)}</strong>.
              </div>
            </>
          )}
          {outcome === 'lost' && (
            <>
              <div className="auction-result-icon">📉</div>
              <div className="auction-result-title" style={{ color: 'var(--red)' }}>OUTBID</div>
              <div className="auction-result-desc">
                Your bid of <strong>{formatNumber(playerBid!)}</strong> was below the closing floor of{' '}
                <strong>{formatNumber(floor)}</strong>.{' '}
                <strong style={{ color: rarityColor }}>{species.name}</strong> escapes you — next auction in{' '}
                <strong>{daysUntilNext}d</strong>.
              </div>
            </>
          )}
          {outcome === null && (
            <>
              <div className="auction-result-icon">🚫</div>
              <div className="auction-result-title" style={{ color: 'var(--text-dim)' }}>MISSED</div>
              <div className="auction-result-desc">
                You didn't place a bid before the auction closed.{' '}
                <strong style={{ color: rarityColor }}>{species.name}</strong> is gone until next cycle.
                Next auction opens Monday — check back then.
              </div>
            </>
          )}
        </div>
      )}

      {/* Past 4 auctions */}
      <div className="auction-history">
        <div className="auction-history-title">PAST AUCTION WINNERS</div>
        <div className="auction-history-list">
          {pastAuctions.map((past) => {
            const pastRarityColor = RARITY_COLOR[past.species.rarityTier] ?? 'var(--accent-light)';
            return (
              <div key={past.weekSeed} className="auction-history-row">
                <div className="auction-history-week">Week of {past.weekLabel}</div>
                <div className="auction-history-species" style={{ color: pastRarityColor }}>
                  {past.species.name}
                </div>
                <div className="auction-history-floor">
                  Floor: {formatNumber(past.floor)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
