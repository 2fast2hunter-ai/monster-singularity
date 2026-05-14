import { useState, useEffect } from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { ResourceDisplay } from './components/ResourceDisplay';
import { MonsterPanel } from './components/MonsterPanel';
import { UpgradePanel } from './components/UpgradePanel';
import { OfflineModal } from './components/OfflineModal';
import { DebugPanel } from './components/DebugPanel';
import { CatalogPanel } from './components/CatalogPanel';
import { BreedingPanel } from './components/BreedingPanel';
import { RetentionBar } from './components/RetentionBar';
import { DimensionStormBanner } from './components/DimensionStormBanner';
import { AuctionPanel } from './components/AuctionPanel';
import { GachaPanel } from './components/GachaPanel';
import { StaffPanel } from './components/StaffPanel';
import { ResearchToast } from './components/ResearchToast';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { AutomationPanel } from './components/AutomationPanel';
import './App.css';

type Tab = 'farm' | 'catalog' | 'breeding' | 'research' | 'auction' | 'gacha' | 'staff';

const TABS: { id: Tab; label: string }[] = [
  { id: 'farm', label: 'Farm' },
  { id: 'gacha', label: 'Gacha' },
  { id: 'catalog', label: 'Omni-Dex' },
  { id: 'breeding', label: 'Breed' },
  { id: 'research', label: 'Research' },
  { id: 'auction', label: 'Auction' },
  { id: 'staff', label: 'Team' },
];

const SEEN_TABS_KEY = 'ms_seen_tabs';

function getSeenTabs(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_TABS_KEY) || '["farm"]')); }
  catch { return new Set(['farm']); }
}

function markTabSeen(tab: string) {
  const seen = getSeenTabs();
  seen.add(tab);
  localStorage.setItem(SEEN_TABS_KEY, JSON.stringify([...seen]));
}

export default function App() {
  useGameLoop();
  const [activeTab, setActiveTab] = useState<Tab>('farm');
  const [seenTabs, setSeenTabs] = useState<Set<string>>(getSeenTabs);

  useEffect(() => {
    markTabSeen(activeTab);
    setSeenTabs(getSeenTabs());
  }, [activeTab]);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">MONSTER SINGULARITY</h1>
        <p className="app-subtitle">Alpha v0.2</p>
        <a
          className="feedback-link"
          href="https://github.com/2fast2hunter-ai/monster-singularity/issues/new?labels=alpha-feedback&title=%5BAlpha+Feedback%5D+&body=**What+did+you+enjoy%3F**%0A%0A**What+was+confusing+or+broken%3F**%0A%0A**Bugs+you+hit%3F**%0A%0A**Overall+rating+(1%E2%80%935)%3A**%0A"
          target="_blank"
          rel="noopener noreferrer"
        >
          Send Feedback
        </a>
      </header>

      <ResourceDisplay />
      <DimensionStormBanner />
      <RetentionBar />

      <nav className="tab-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            data-tab={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
            aria-label={t.label}
          >
            {t.label}
            {!seenTabs.has(t.id) && <span className="tab-new-dot" aria-hidden="true" />}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === 'farm' && (
          <div className="panels">
            <MonsterPanel />
            <AutomationPanel />
          </div>
        )}
        {activeTab === 'gacha' && <GachaPanel />}
        {activeTab === 'catalog' && <CatalogPanel />}
        {activeTab === 'breeding' && <BreedingPanel />}
        {activeTab === 'research' && (
          <div className="panels">
            <UpgradePanel />
          </div>
        )}
        {activeTab === 'auction' && <AuctionPanel />}
        {activeTab === 'staff' && <StaffPanel />}
      </main>

      <OfflineModal />
      <DebugPanel />
      <ResearchToast />
      <OnboardingTutorial onNavigate={(tab) => setActiveTab(tab as Tab)} />
    </div>
  );
}
