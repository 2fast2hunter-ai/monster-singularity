import { useMemo, useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { CATALOG_BY_ID } from '../game/monster/catalog';
import { generateDiscoveryFeed } from '../game/leaderboard';

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DiscoveryFeed() {
  const ownedSpecies = useGameStore((s) => s.ownedSpecies);
  const [visibleIdx, setVisibleIdx] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const dateUTC = todayUTC();

  const discovered = useMemo(() => {
    return ownedSpecies
      .map((id) => CATALOG_BY_ID[id])
      .filter(Boolean)
      .map((s) => ({ id: s.id, name: s.name, rarityTier: s.rarityTier }));
  }, [ownedSpecies]);

  const entries = useMemo(
    () => generateDiscoveryFeed(dateUTC, discovered),
    [dateUTC, discovered],
  );

  useEffect(() => {
    if (entries.length === 0) return;
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setVisibleIdx((i) => (i + 1) % entries.length);
        setFadeIn(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, [entries.length]);

  if (entries.length === 0) return null;

  const entry = entries[visibleIdx];

  return (
    <div className={`discovery-feed ${fadeIn ? 'feed-visible' : 'feed-hidden'}`}>
      <span className="feed-icon">📡</span>
      <span className={`feed-text ${entry.isPlayer ? 'feed-text--player' : ''}`}>
        {entry.text}
      </span>
    </div>
  );
}
