const ONBOARDING_KEY = 'ms_onboarding_complete';

const TAB_INTRO_CONFIG: Record<string, { storageKey: string; title: string; body: string }> = {
  research: {
    storageKey: 'ms_tab_intro_research',
    title: 'Upgrade Your Horde',
    body: 'Spend Energy to unlock permanent upgrades — faster production, bigger harvests, new abilities.',
  },
  gacha: {
    storageKey: 'ms_tab_intro_gacha',
    title: 'Monster Gacha',
    body: 'Spend Singularity Shards to pull rare monsters you cannot breed. Banners rotate weekly.',
  },
  auction: {
    storageKey: 'ms_tab_intro_auction',
    title: 'Weekly Auction',
    body: 'Legendary monsters go up for auction each week. Bid with Shards — highest bid at close wins.',
  },
};

export function shouldShowTabIntro(tab: string): boolean {
  if (!localStorage.getItem(ONBOARDING_KEY)) return false;
  const config = TAB_INTRO_CONFIG[tab];
  if (!config) return false;
  return !localStorage.getItem(config.storageKey);
}

export function dismissTabIntro(tab: string): void {
  const config = TAB_INTRO_CONFIG[tab];
  if (config) localStorage.setItem(config.storageKey, '1');
}

interface Props {
  tab: string;
  onDismiss: () => void;
}

export function TabIntroCard({ tab, onDismiss }: Props) {
  const config = TAB_INTRO_CONFIG[tab];
  if (!config) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          pointerEvents: 'auto',
        }}
      />
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
        <h3
          style={{
            margin: '0 0 8px',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#a78bfa',
          }}
        >
          {config.title}
        </h3>
        <p
          style={{
            margin: '0 0 16px',
            fontSize: '0.875rem',
            color: '#d1d5db',
            lineHeight: 1.5,
          }}
        >
          {config.body}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onDismiss}
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
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
