import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import './RosterFullModal.css';

export function RosterFullModal() {
  const rosterFullPending = useGameStore((s) => s.rosterFullPending);
  const rosterPacksPurchased = useGameStore((s) => s.rosterPacksPurchased);
  const rosterSlots = useGameStore((s) => s.rosterSlots);
  const dismiss = useGameStore((s) => s.dismissRosterFull);
  const expandRosterIAP = useGameStore((s) => s.expandRosterIAP);

  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  if (!rosterFullPending) return null;

  const atCap = rosterPacksPurchased >= 15 || rosterSlots >= 60;

  async function handleBuyPack() {
    setPurchasing(true);
    setPurchaseError(null);
    // Simulate IAP flow — in production, trigger platform IAP and pass receipt to server
    await new Promise((r) => setTimeout(r, 300));
    const result = expandRosterIAP();
    setPurchasing(false);
    if (result === 'ok') {
      dismiss();
    } else if (result === 'at_cap') {
      setPurchaseError('You have reached the maximum roster size.');
    } else {
      setPurchaseError('Purchase failed. Please try again.');
    }
  }

  return (
    <div className="roster-modal-backdrop" onClick={dismiss}>
      <div className="roster-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="roster-modal-headline">Your roster is full.</h2>
        <p className="roster-modal-body">
          Free up a slot by releasing a monster, or add 3 more for just $0.99.
        </p>
        <p className="roster-modal-slots">
          Current slots: {rosterSlots} / 60
        </p>
        {purchaseError && (
          <p className="roster-modal-error">{purchaseError}</p>
        )}
        <div className="roster-modal-actions">
          <button className="roster-btn-secondary" onClick={dismiss}>
            Release a Monster
          </button>
          <button
            className="roster-btn-primary"
            onClick={handleBuyPack}
            disabled={purchasing || atCap}
          >
            {atCap ? 'Roster Full (60/60)' : purchasing ? 'Processing…' : 'Get Roster Pack — $0.99'}
          </button>
        </div>
      </div>
    </div>
  );
}
