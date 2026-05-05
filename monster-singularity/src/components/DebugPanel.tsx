import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

// Developer-only panel for testing offline catch-up without waiting
export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const resetGame = useGameStore((s) => s.resetGame);

  function simulateOffline(hours: number) {
    // Manually backdate the lastSaveTimestamp in localStorage then reload
    const raw = localStorage.getItem('monster_singularity_v1');
    if (!raw) return;
    const save = JSON.parse(raw);
    save.lastSaveTimestamp = Date.now() - hours * 3600 * 1000;
    localStorage.setItem('monster_singularity_v1', JSON.stringify(save));
    window.location.reload();
  }

  if (!open) {
    return (
      <button className="debug-toggle" onClick={() => setOpen(true)}>
        🛠 Dev
      </button>
    );
  }

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <span>Dev Tools</span>
        <button onClick={() => setOpen(false)}>✕</button>
      </div>
      <div className="debug-actions">
        <p className="debug-label">Simulate offline gap:</p>
        <button onClick={() => simulateOffline(1)}>+1h offline</button>
        <button onClick={() => simulateOffline(12)}>+12h offline</button>
        <button onClick={() => simulateOffline(48)}>+48h offline</button>
        <button onClick={() => simulateOffline(72)}>+72h (over cap)</button>
        <hr />
        <button className="danger" onClick={resetGame}>
          Reset game
        </button>
      </div>
    </div>
  );
}
