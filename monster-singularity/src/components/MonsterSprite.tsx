/**
 * SVG monster sprites — 3 shape variants per stability class (15 archetypes total).
 * Variant selected deterministically from monsterId so each species has a unique look.
 * Rarity modulates glow intensity. No external image files required.
 */

type StabilityClass = 'Stable' | 'Volatile' | 'Chaotic' | 'Aberrant' | 'Reality-Warping';
type RarityTier = 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Singularity';

interface Props {
  stabilityClass: StabilityClass;
  rarity?: RarityTier;
  monsterId?: string;
  size?: number;
  owned?: boolean;
}

const GLOW_INTENSITY: Record<string, number> = {
  Common: 2,
  Uncommon: 4,
  Rare: 6,
  Legendary: 10,
  Singularity: 16,
};

const COLORS: Record<string, { fill: string; stroke: string; glow: string }> = {
  Stable:           { fill: '#052e16', stroke: '#4ade80', glow: '#22c55e' },
  Volatile:         { fill: '#1c1400', stroke: '#fbbf24', glow: '#f59e0b' },
  Chaotic:          { fill: '#1c0404', stroke: '#f87171', glow: '#ef4444' },
  Aberrant:         { fill: '#150a2c', stroke: '#c084fc', glow: '#a855f7' },
  'Reality-Warping':{ fill: '#1c0014', stroke: '#f472b6', glow: '#ec4899' },
};

type Palette = typeof COLORS[string];
type ShapeFn = (props: { c: Palette }) => JSX.Element;

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ── STABLE variants ──────────────────────────────────────────────────────────

function SlimeBlob({ c }: { c: Palette }) {
  return (
    <g>
      <ellipse cx="16" cy="20" rx="12" ry="10" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
      <path d="M4 20 Q16 4 28 20" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
      <circle cx="12" cy="18" r="2.5" fill={c.stroke} />
      <circle cx="20" cy="18" r="2.5" fill={c.stroke} />
      <circle cx="12.8" cy="17.3" r="0.9" fill="#fff" />
      <circle cx="20.8" cy="17.3" r="0.9" fill="#fff" />
      <circle cx="7"  cy="18" r="1.5" fill={c.fill} stroke={c.stroke} strokeWidth="1" />
      <circle cx="25" cy="18" r="1.5" fill={c.fill} stroke={c.stroke} strokeWidth="1" />
    </g>
  );
}

function ToadBrute({ c }: { c: Palette }) {
  return (
    <g>
      <ellipse cx="16" cy="22" rx="13" ry="8"  fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
      <ellipse cx="16" cy="14" rx="9"  ry="7"  fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
      {/* eye stalks */}
      <line x1="11" y1="8" x2="10" y2="5" stroke={c.stroke} strokeWidth="1.2" />
      <circle cx="10" cy="4.5" r="2.5" fill={c.fill} stroke={c.stroke} strokeWidth="1.2" />
      <circle cx="10" cy="4.5" r="1.3" fill={c.stroke} />
      <circle cx="10.5" cy="4" r="0.5" fill="#fff" />
      <line x1="21" y1="8" x2="22" y2="5" stroke={c.stroke} strokeWidth="1.2" />
      <circle cx="22" cy="4.5" r="2.5" fill={c.fill} stroke={c.stroke} strokeWidth="1.2" />
      <circle cx="22" cy="4.5" r="1.3" fill={c.stroke} />
      <circle cx="22.5" cy="4" r="0.5" fill="#fff" />
      <path d="M10 17 Q16 20 22 17" fill="none" stroke={c.stroke} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8"  cy="21" r="1.3" fill={c.fill} stroke={c.stroke} strokeWidth="0.8" />
      <circle cx="16" cy="26" r="1.5" fill={c.fill} stroke={c.stroke} strokeWidth="0.8" />
      <circle cx="24" cy="21" r="1.3" fill={c.fill} stroke={c.stroke} strokeWidth="0.8" />
    </g>
  );
}

function CrystalGolem({ c }: { c: Palette }) {
  return (
    <g>
      <polygon points="16,4 25,16 16,28 7,16" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
      {/* shards */}
      <polygon points="16,4 19,9 16,7"    fill={c.stroke} opacity="0.7" />
      <polygon points="25,16 29,14 28,18" fill={c.stroke} opacity="0.6" />
      <polygon points="7,16 3,14 4,18"    fill={c.stroke} opacity="0.6" />
      <polygon points="16,28 13,23 16,25" fill={c.stroke} opacity="0.5" />
      {/* facet lines */}
      <line x1="7" y1="16" x2="16" y2="4"  stroke={c.stroke} strokeWidth="0.6" opacity="0.4" />
      <line x1="7" y1="16" x2="16" y2="28" stroke={c.stroke} strokeWidth="0.6" opacity="0.4" />
      <circle cx="13" cy="15" r="2"   fill={c.stroke} />
      <circle cx="19" cy="15" r="2"   fill={c.stroke} />
      <circle cx="13.6" cy="14.5" r="0.8" fill="#fff" />
      <circle cx="19.6" cy="14.5" r="0.8" fill="#fff" />
    </g>
  );
}

// ── VOLATILE variants ─────────────────────────────────────────────────────────

function SpikyStar({ c }: { c: Palette }) {
  return (
    <g>
      <polygon
        points="16,3 19,11 28,10 22,16 25,25 16,21 7,25 10,16 4,10 13,11"
        fill={c.fill} stroke={c.stroke} strokeWidth="1.5" strokeLinejoin="round"
      />
      <circle cx="13" cy="16" r="2"   fill={c.stroke} />
      <circle cx="19" cy="16" r="2"   fill={c.stroke} />
      <circle cx="13.7" cy="15.4" r="0.7" fill="#fff" />
      <circle cx="19.7" cy="15.4" r="0.7" fill="#fff" />
      <line x1="16" y1="3" x2="14" y2="1" stroke={c.stroke} strokeWidth="1" />
      <line x1="16" y1="3" x2="18" y2="1" stroke={c.stroke} strokeWidth="1" />
    </g>
  );
}

function FlameSprite({ c }: { c: Palette }) {
  return (
    <g>
      <path d="M16,29 Q7,23 8,14 Q11,6 16,3 Q21,6 24,14 Q25,23 16,29Z"
        fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
      <path d="M16,26 Q11,21 12,14 Q14,9 16,7 Q18,9 20,14 Q21,21 16,26Z"
        fill={c.stroke} opacity="0.2" />
      {/* side wisps */}
      <path d="M8,14 Q4,9 6,5 Q8,9 10,12"   fill={c.fill} stroke={c.stroke} strokeWidth="1" />
      <path d="M24,14 Q28,9 26,5 Q24,9 22,12" fill={c.fill} stroke={c.stroke} strokeWidth="1" />
      <circle cx="13" cy="16" r="2"   fill={c.stroke} />
      <circle cx="19" cy="16" r="2"   fill={c.stroke} />
      <circle cx="13.7" cy="15.4" r="0.7" fill="#fff" />
      <circle cx="19.7" cy="15.4" r="0.7" fill="#fff" />
    </g>
  );
}

function ShockWyvern({ c }: { c: Palette }) {
  return (
    <g>
      {/* wings */}
      <path d="M10,14 Q4,8 6,3 Q9,9 12,13"   fill={c.fill} stroke={c.stroke} strokeWidth="1.2" />
      <path d="M22,14 Q28,8 26,3 Q23,9 20,13" fill={c.fill} stroke={c.stroke} strokeWidth="1.2" />
      <ellipse cx="16" cy="19" rx="7" ry="9" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
      <ellipse cx="16" cy="11" rx="5" ry="5" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
      <circle cx="14" cy="10" r="1.8" fill={c.stroke} />
      <circle cx="18" cy="10" r="1.8" fill={c.stroke} />
      <circle cx="14.6" cy="9.5" r="0.6" fill="#fff" />
      <circle cx="18.6" cy="9.5" r="0.6" fill="#fff" />
      {/* electric tail */}
      <path d="M16,28 Q20,29 22,27" fill="none" stroke={c.stroke} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="27" x2="25" y2="25" stroke={c.stroke} strokeWidth="1" />
      <line x1="22" y1="27" x2="25" y2="29" stroke={c.stroke} strokeWidth="1" />
    </g>
  );
}

// ── CHAOTIC variants ──────────────────────────────────────────────────────────

function JaggedChaos({ c }: { c: Palette }) {
  return (
    <g>
      <polygon
        points="16,2 21,8 29,6 26,13 31,18 24,19 23,27 16,23 9,27 8,19 1,18 6,13 3,6 11,8"
        fill={c.fill} stroke={c.stroke} strokeWidth="1.5" strokeLinejoin="round"
      />
      <circle cx="12" cy="16" r="2.5" fill={c.stroke} />
      <circle cx="20" cy="16" r="2.5" fill={c.stroke} />
      <circle cx="12.7" cy="15.4" r="1"   fill="#fff" />
      <circle cx="20.7" cy="15.4" r="1"   fill="#fff" />
      <line x1="9.5"  y1="12.5" x2="14.5" y2="14"   stroke={c.stroke} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22.5" y1="14"   x2="17.5" y2="12.5" stroke={c.stroke} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

function SpiderDemon({ c }: { c: Palette }) {
  return (
    <g>
      <ellipse cx="16" cy="21" rx="7" ry="7" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
      <ellipse cx="16" cy="13" rx="6" ry="6" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
      {/* legs */}
      <path d="M10,11 Q5,7 2,9"   fill="none" stroke={c.stroke} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10,14 Q4,14 1,16"  fill="none" stroke={c.stroke} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10,17 Q5,20 3,23"  fill="none" stroke={c.stroke} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M22,11 Q27,7 30,9"  fill="none" stroke={c.stroke} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M22,14 Q28,14 31,16" fill="none" stroke={c.stroke} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M22,17 Q27,20 29,23" fill="none" stroke={c.stroke} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="13" cy="12" r="2"   fill={c.stroke} />
      <circle cx="19" cy="12" r="2"   fill={c.stroke} />
      <circle cx="13.6" cy="11.4" r="0.7" fill="#fff" />
      <circle cx="19.6" cy="11.4" r="0.7" fill="#fff" />
      <circle cx="16" cy="10" r="1.5" fill={c.stroke} opacity="0.8" />
      {/* fangs */}
      <line x1="14" y1="18" x2="13" y2="21" stroke={c.stroke} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="18" y1="18" x2="19" y2="21" stroke={c.stroke} strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

function SerpentWraith({ c }: { c: Palette }) {
  return (
    <g>
      {/* coiled body — thick outer + thin inner stroke */}
      <path d="M24,6 Q29,12 25,18 Q20,24 16,22 Q10,20 9,15 Q8,9 14,7 Q20,5 22,10"
        fill="none" stroke={c.stroke} strokeWidth="5" strokeLinecap="round" />
      <path d="M24,6 Q29,12 25,18 Q20,24 16,22 Q10,20 9,15 Q8,9 14,7 Q20,5 22,10"
        fill="none" stroke={c.fill} strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="24" cy="7" rx="5" ry="4" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
      {/* forked tongue */}
      <path d="M28,7 L31,6" fill="none" stroke={c.stroke} strokeWidth="0.8" strokeLinecap="round" />
      <path d="M28,7 L31,8" fill="none" stroke={c.stroke} strokeWidth="0.8" strokeLinecap="round" />
      <circle cx="23" cy="6"   r="1.5" fill={c.stroke} />
      <circle cx="23.8" cy="5.6" r="0.5" fill="#fff" />
      {/* tail tip */}
      <path d="M22,10 Q18,6 20,3" fill="none" stroke={c.stroke} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

// ── ABERRANT variants ─────────────────────────────────────────────────────────

function AberrantOvoid({ c }: { c: Palette }) {
  return (
    <g>
      <ellipse cx="16" cy="19" rx="10" ry="13" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
      <ellipse cx="12" cy="16" rx="3.5" ry="2.5" fill={c.stroke} />
      <ellipse cx="20" cy="16" rx="3.5" ry="2.5" fill={c.stroke} />
      <ellipse cx="12.8" cy="15.6" rx="1.2" ry="0.9" fill="#fff" opacity="0.9" />
      <ellipse cx="20.8" cy="15.6" rx="1.2" ry="0.9" fill="#fff" opacity="0.9" />
      <line x1="11" y1="6" x2="8"  y2="1" stroke={c.stroke} strokeWidth="1.2" />
      <circle cx="8"  cy="1" r="1.2" fill={c.stroke} />
      <line x1="21" y1="6" x2="24" y2="1" stroke={c.stroke} strokeWidth="1.2" />
      <circle cx="24" cy="1" r="1.2" fill={c.stroke} />
      <path d="M13 22 Q16 24 19 22" stroke={c.stroke} strokeWidth="1" fill="none" />
    </g>
  );
}

function BrainFloater({ c }: { c: Palette }) {
  return (
    <g>
      <path d="M7,17 Q7,6 16,6 Q25,6 25,17" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
      {/* brain folds */}
      <path d="M10,14 Q13,9 16,11 Q19,9 22,14" fill="none" stroke={c.stroke} strokeWidth="1" opacity="0.7" />
      <path d="M8,17 Q11,15 14,17"  fill="none" stroke={c.stroke} strokeWidth="0.8" opacity="0.6" />
      <path d="M18,17 Q21,15 24,17" fill="none" stroke={c.stroke} strokeWidth="0.8" opacity="0.6" />
      <ellipse cx="16" cy="18" rx="9" ry="3.5" fill={c.fill} stroke={c.stroke} strokeWidth="1.2" />
      {/* tendrils */}
      <path d="M9,19 Q7,24 8,29"   fill="none" stroke={c.stroke} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M13,21 Q12,26 13,30" fill="none" stroke={c.stroke} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M19,21 Q20,26 19,30" fill="none" stroke={c.stroke} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M23,19 Q25,24 24,29" fill="none" stroke={c.stroke} strokeWidth="1.2" strokeLinecap="round" />
      {/* central eye */}
      <circle cx="16" cy="14" r="3.5" fill={c.stroke} />
      <circle cx="16" cy="14" r="2"   fill="#000" />
      <circle cx="16.8" cy="13.2" r="0.8" fill={c.glow} />
    </g>
  );
}

function EyeHorror({ c }: { c: Palette }) {
  return (
    <g>
      <ellipse cx="16" cy="17" rx="12" ry="11" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
      {/* central eye */}
      <circle cx="16" cy="15" r="5.5" fill={c.stroke} />
      <circle cx="16" cy="15" r="3.5" fill="#000" />
      <circle cx="17.5" cy="13.5" r="1.5" fill={c.glow} opacity="0.9" />
      {/* surrounding eyes */}
      <circle cx="8"  cy="14" r="2.5" fill={c.stroke} />
      <circle cx="8"  cy="14" r="1.5" fill="#000" />
      <circle cx="24" cy="14" r="2.5" fill={c.stroke} />
      <circle cx="24" cy="14" r="1.5" fill="#000" />
      <circle cx="11" cy="22" r="2"   fill={c.stroke} />
      <circle cx="11" cy="22" r="1.2" fill="#000" />
      <circle cx="21" cy="22" r="2"   fill={c.stroke} />
      <circle cx="21" cy="22" r="1.2" fill="#000" />
      <circle cx="8.8"  cy="13.3" r="0.6" fill={c.glow} opacity="0.8" />
      <circle cx="24.8" cy="13.3" r="0.6" fill={c.glow} opacity="0.8" />
    </g>
  );
}

// ── REALITY-WARPING variants ──────────────────────────────────────────────────

function GlitchForm({ c }: { c: Palette }) {
  return (
    <g>
      <ellipse cx="16" cy="17" rx="11" ry="11" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" opacity="0.9" />
      <ellipse cx="13" cy="15" rx="7"  ry="7"  fill={c.fill} stroke={c.glow}   strokeWidth="0.8" opacity="0.6" />
      <ellipse cx="20" cy="19" rx="7"  ry="7"  fill={c.fill} stroke={c.glow}   strokeWidth="0.8" opacity="0.5" />
      <rect x="8"  y="14" width="6" height="1.5" fill={c.stroke} opacity="0.7" />
      <rect x="18" y="18" width="7" height="1.5" fill={c.stroke} opacity="0.7" />
      <rect x="10" y="20" width="4" height="1"   fill={c.glow}   opacity="0.9" />
      <circle cx="12" cy="15" r="3"   fill={c.stroke} />
      <circle cx="20" cy="15" r="3"   fill={c.stroke} />
      <circle cx="12" cy="15" r="1.5" fill="#000" />
      <circle cx="20" cy="15" r="1.5" fill="#000" />
      <circle cx="12.6" cy="14.4" r="0.6" fill={c.glow} />
      <circle cx="20.6" cy="14.4" r="0.6" fill={c.glow} />
    </g>
  );
}

function VoidTear({ c }: { c: Palette }) {
  return (
    <g>
      <circle cx="16" cy="16" r="13" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
      {/* torn star void */}
      <polygon
        points="16,7 18,12 23,10 20,15 25,17 20,19 23,24 18,22 16,27 14,22 9,24 12,19 7,17 12,15 9,10 14,12"
        fill="#000" opacity="0.92" stroke={c.glow} strokeWidth="0.5"
      />
      <circle cx="13" cy="16" r="2"   fill={c.stroke} />
      <circle cx="19" cy="16" r="2"   fill={c.stroke} />
      <circle cx="13.7" cy="15.4" r="0.8" fill={c.glow} />
      <circle cx="19.7" cy="15.4" r="0.8" fill={c.glow} />
      {/* emanation cracks */}
      <line x1="16" y1="3"  x2="15" y2="0"  stroke={c.glow} strokeWidth="0.8" opacity="0.7" />
      <line x1="29" y1="16" x2="32" y2="15" stroke={c.glow} strokeWidth="0.8" opacity="0.7" />
      <line x1="3"  y1="16" x2="0"  y2="17" stroke={c.glow} strokeWidth="0.8" opacity="0.7" />
    </g>
  );
}

function FractalCore({ c }: { c: Palette }) {
  return (
    <g>
      <polygon
        points="16,2 27,8.5 27,21.5 16,28 5,21.5 5,8.5"
        fill={c.fill} stroke={c.stroke} strokeWidth="1.5"
      />
      <polygon
        points="16,7 23.5,11 23.5,19 16,23 8.5,19 8.5,11"
        fill={c.fill} stroke={c.glow} strokeWidth="0.8" opacity="0.7"
      />
      <polygon points="16,11 21,15 16,19 11,15" fill={c.stroke} opacity="0.4" />
      <circle cx="13" cy="14" r="2.2" fill={c.stroke} />
      <circle cx="19" cy="14" r="2.2" fill={c.stroke} />
      <circle cx="13" cy="14" r="1.2" fill="#000" />
      <circle cx="19" cy="14" r="1.2" fill="#000" />
      <circle cx="13.5" cy="13.5" r="0.5" fill={c.glow} />
      <circle cx="19.5" cy="13.5" r="0.5" fill={c.glow} />
      <circle cx="16" cy="15" r="1.5" fill={c.glow} opacity="0.9" />
    </g>
  );
}

// ── Variant tables ────────────────────────────────────────────────────────────

const VARIANTS: Record<string, ShapeFn[]> = {
  Stable:           [SlimeBlob,    ToadBrute,    CrystalGolem],
  Volatile:         [SpikyStar,    FlameSprite,  ShockWyvern],
  Chaotic:          [JaggedChaos,  SpiderDemon,  SerpentWraith],
  Aberrant:         [AberrantOvoid, BrainFloater, EyeHorror],
  'Reality-Warping':[GlitchForm,   VoidTear,     FractalCore],
};

// ── Main export ───────────────────────────────────────────────────────────────

export function MonsterSprite({
  stabilityClass,
  rarity = 'Common',
  monsterId,
  size = 32,
  owned = true,
}: Props) {
  const palette = COLORS[stabilityClass] ?? COLORS['Stable'];
  const glowBlur = GLOW_INTENSITY[rarity] ?? 2;
  const filterId = `glow-${stabilityClass.replace(/[^a-z]/gi, '')}-${rarity}`;

  const variants = VARIANTS[stabilityClass] ?? VARIANTS['Stable'];
  const idx = monsterId ? simpleHash(monsterId) % variants.length : 0;
  const Shape = variants[idx];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, opacity: owned ? 1 : 0.3 }}
      aria-label={`${stabilityClass} monster`}
    >
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={glowBlur} result="blur" />
          <feFlood floodColor={palette.glow} result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <Shape c={palette} />
      </g>
    </svg>
  );
}
