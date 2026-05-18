import { useEffect, useRef, useState } from 'react';
import { MonsterSprite } from './MonsterSprite';
import type { StabilityClass, RarityTier } from '../game/monster/types';

const PLACEHOLDER_COLORS: Record<string, string> = {
  Stable: '#4ade80',
  Volatile: '#fbbf24',
  Chaotic: '#f87171',
  Aberrant: '#c084fc',
  'Reality-Warping': '#f472b6',
};

interface Props {
  stabilityClass: StabilityClass;
  rarity?: RarityTier;
  monsterId?: string;
  size?: number;
  owned?: boolean;
}

export function LazyMonsterSprite({ stabilityClass, rarity = 'Common', monsterId, size = 32, owned = true }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: '120px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (visible) {
    return <MonsterSprite stabilityClass={stabilityClass} rarity={rarity} monsterId={monsterId} size={size} owned={owned} />;
  }

  const color = PLACEHOLDER_COLORS[stabilityClass] ?? '#4ade80';
  return (
    <span
      ref={ref}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        background: color,
        opacity: owned ? 0.18 : 0.07,
        filter: 'blur(4px)',
      }}
      aria-hidden="true"
    />
  );
}
