import { useState } from 'react';
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
import './App.css';

type Tab = 'farm' | 'catalog' | 'breeding' | 'research' | 'auction';

const TABS: { id: Tab; label: string }[] = [
  { id: 'farm', label: 'Farm' },
  { id: 'catalog', label: 'Omni-Dex' },
  { id: 'breeding', label: 'Breed' },
  { id: 'research', label: 'Research' },
  { id: 'auction', label: 'Auction' },
];

export default function App() {
  useGameLoop();
  const [activeTab, setActiveTab] = useState<Tab>('farm');

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">MONSTER SINGULARITY</h1>
        <p className="app-subtitle">Alpha v0.2</p>
      </header>

      <ResourceDisplay />
      <DimensionStormBanner />
      <RetentionBar />

      <nav className="tab-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === 'farm' && (
          <div className="panels">
            <MonsterPanel />
          </div>
        )}
        {activeTab === 'catalog' && <CatalogPanel />}
        {activeTab === 'breeding' && <BreedingPanel />}
        {activeTab === 'research' && (
          <div className="panels">
            <UpgradePanel />
          </div>
        )}
        {activeTab === 'auction' && <AuctionPanel />}
      </main>

      <OfflineModal />
      <DebugPanel />
    </div>
  );
}
