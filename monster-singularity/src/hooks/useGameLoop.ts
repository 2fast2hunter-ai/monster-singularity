import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

// Cap delta to 1s to prevent giant jumps on tab visibility changes
const MAX_DELTA_SECONDS = 1;

export function useGameLoop() {
  const tick = useGameStore((s) => s.tick);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function loop(timestamp: number) {
      if (lastTimeRef.current !== null) {
        const raw = (timestamp - lastTimeRef.current) / 1000;
        const delta = Math.min(raw, MAX_DELTA_SECONDS);
        tick(delta);
      }
      lastTimeRef.current = timestamp;
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);
}
