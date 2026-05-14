import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ms_onboarding_complete';

type Step = {
  id: number;
  title: string;
  body: string;
  highlight: string; // CSS selector to highlight
  position: 'bottom' | 'center';
};

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Your Farm',
    body: 'Your monsters generate energy automatically — even when you\'re away. Keep collecting to power up!',
    highlight: '[data-tab="farm"]',
    position: 'bottom',
  },
  {
    id: 2,
    title: 'Instability Particles',
    body: 'The ⚡ bar tracks Instability Particles (IP). Higher-class monsters need IP to stay stable — if it empties, they start consuming your weaker monsters!',
    highlight: '.ip-meter',
    position: 'bottom',
  },
  {
    id: 3,
    title: 'Gacha Capsules',
    body: 'Spend energy here to draw rare monsters you can\'t breed or buy. Every 10 pulls guarantees a Rare or better — keep rolling to fill your collection!',
    highlight: '[data-tab="gacha"]',
    position: 'bottom',
  },
  {
    id: 4,
    title: 'Breed New Species',
    body: 'Cross two monsters to discover entirely new species. Rarer parents produce higher-class offspring with stronger bonuses.',
    highlight: '[data-tab="breeding"]',
    position: 'bottom',
  },
  {
    id: 5,
    title: 'OmniDex',
    body: 'Track your full collection here. Discover new species to unlock permanent production multipliers.',
    highlight: '[data-tab="catalog"]',
    position: 'bottom',
  },
  {
    id: 6,
    title: 'Research',
    body: 'Spend Instability Particles to unlock permanent upgrades — faster breeding, better containment, and global multipliers.',
    highlight: '[data-tab="research"]',
    position: 'bottom',
  },
  {
    id: 7,
    title: 'Your Team',
    body: 'Hire staff to automate tasks. Team members work in the background so you can focus on strategy.',
    highlight: '[data-tab="staff"]',
    position: 'bottom',
  },
];

const STEP_TABS: Record<number, string> = {
  0: 'farm',
  1: 'farm',
  2: 'gacha',
  3: 'breeding',
  4: 'catalog',
  5: 'research',
  6: 'staff',
};

interface Props {
  onNavigate: (tab: string) => void;
}

export function OnboardingTutorial({ onNavigate }: Props) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
  }, []);

  if (!visible) return null;

  const current = STEPS[step];

  function next() {
    const nextIdx = step + 1;
    if (nextIdx >= STEPS.length) {
      dismiss();
      return;
    }
    const tab = STEP_TABS[nextIdx];
    if (tab) onNavigate(tab);
    setStep(nextIdx);
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      {/* Dark overlay — intentionally not clickable to avoid accidental tutorial dismissal */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          pointerEvents: 'auto',
        }}
      />

      {/* Tutorial card */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(90vw, 360px)',
          background: '#1a1a2e',
          border: '2px solid #7c3aed',
          borderRadius: '12px',
          padding: '20px',
          pointerEvents: 'auto',
          boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
        }}
      >
        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                height: '4px',
                flex: 1,
                borderRadius: '2px',
                background: i <= step ? '#7c3aed' : '#374151',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Step counter */}
        <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '6px', letterSpacing: '0.08em' }}>
          STEP {step + 1} OF {STEPS.length}
        </div>

        <h3
          style={{
            margin: '0 0 8px',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#a78bfa',
          }}
        >
          {current.title}
        </h3>
        <p
          style={{
            margin: '0 0 16px',
            fontSize: '0.875rem',
            color: '#d1d5db',
            lineHeight: 1.5,
          }}
        >
          {current.body}
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={dismiss}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #374151',
              background: 'transparent',
              color: '#9ca3af',
              cursor: 'pointer',
              fontSize: '0.8rem',
              minWidth: '44px',
              minHeight: '44px',
            }}
          >
            Skip
          </button>
          <button
            onClick={next}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: '#7c3aed',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              minWidth: '44px',
              minHeight: '44px',
            }}
          >
            {step === STEPS.length - 1 ? "Let's go!" : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
