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
    title: 'Your Monsters',
    body: 'Tap any monster card to inspect its stats and upgrade it. Your starter monster is already hard at work!',
    highlight: '.monster-card',
    position: 'bottom',
  },
  {
    id: 3,
    title: 'Breed New Species',
    body: 'Cross two monsters to discover entirely new species with unique abilities.',
    highlight: '[data-tab="breeding"]',
    position: 'bottom',
  },
  {
    id: 4,
    title: 'OmniDex',
    body: 'Track your growing collection here. How many species can you discover?',
    highlight: '[data-tab="catalog"]',
    position: 'bottom',
  },
];

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

  // Which tab to show for each step index
  const STEP_TABS: Record<number, string> = {
    0: 'farm',
    1: 'farm',
    2: 'breeding',
    3: 'catalog',
  };

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
      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          pointerEvents: 'auto',
        }}
        onClick={dismiss}
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
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
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
