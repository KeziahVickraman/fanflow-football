/**
 * FanFlow - Singapore Football Screening Planner
 * Main Application Component
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Image as ImageIcon,
  Building2,
  Bot,
  AlertCircle,
  RefreshCw,
  Smartphone,
} from 'lucide-react';
import { Header } from './components/Header.tsx';
import { PlannerTab } from './components/PlannerTab.tsx';
import { PostersTab } from './components/PostersTab.tsx';
import { VenueDataTab } from './components/VenueDataTab.tsx';
import { AssistantTab } from './components/AssistantTab.tsx';
import { MatchDetailModal } from './components/MatchDetailModal.tsx';
import { SystemHealthModal } from './components/SystemHealthModal.tsx';
import { Footer } from './components/Footer.tsx';
import { DB_02_VENUES, type Venue } from './data/simulatedDb.ts';
import type { MatchFixture, MatchDecision } from './shared/scoringEngine.ts';
import { FALLBACK_FIXTURES } from './data/fallbackFixtures.ts';

export default function App() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'planner' | 'posters' | 'venue-data' | 'assistant'>('planner');

  // Web / Mobile view toggle (shared state, no refetching)
  const [isMobileView, setIsMobileView] = useState<boolean>(false);

  // Selected Venue (defaults to V-001 The Red Corner Pub)
  const [selectedVenue, setSelectedVenue] = useState<Venue>(DB_02_VENUES[0]);

  // Selected competitions (default: Premier League and Champions League)
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>(['PL', 'CL']);

  // Match Fixtures
  const [fixtures, setFixtures] = useState<MatchFixture[]>(FALLBACK_FIXTURES);
  const [isLoadingFixtures, setIsLoadingFixtures] = useState<boolean>(false);
  const [fixturesError, setFixturesError] = useState<string | null>(null);
  const [authWarning, setAuthWarning] = useState<string | undefined>(undefined);

  // Selected fixture for detail modal or poster
  const [inspectingFixture, setInspectingFixture] = useState<{ fixture: MatchFixture; decision: MatchDecision } | null>(null);
  const [posterFixture, setPosterFixture] = useState<MatchFixture | null>(null);

  // System Health
  const [isHealthOpen, setIsHealthOpen] = useState<boolean>(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(false);

  // Fetch API Health
  const checkHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (err) {
      console.error('Failed to fetch /api/health:', err);
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  // Fetch fixtures from server
  const fetchFixtures = useCallback(async () => {
    setIsLoadingFixtures(true);
    setFixturesError(null);
    try {
      const compsParam = selectedCompetitions.join(',');
      const res = await fetch(`/api/football/fixtures?competitions=${encodeURIComponent(compsParam)}`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data.matches) && data.matches.length > 0) {
        setFixtures(data.matches);
      }
      if (data.authWarning) {
        setAuthWarning(data.authWarning);
      } else {
        setAuthWarning(undefined);
      }
    } catch (err: any) {
      console.error('Error fetching fixtures:', err);
      setFixturesError('Could not load live fixtures. Using offline fallback dataset.');
      // Keep fallback fixtures intact
    } finally {
      setIsLoadingFixtures(false);
    }
  }, [selectedCompetitions]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    fetchFixtures();
  }, [fetchFixtures]);

  // Handle switching to Posters tab with a preselected match
  const handleSelectForPoster = (fixture: MatchFixture) => {
    setPosterFixture(fixture);
    setActiveTab('posters');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileView={isMobileView}
        setIsMobileView={setIsMobileView}
        onOpenHealth={() => setIsHealthOpen(true)}
        apiHealth={healthData}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Mobile View Container Simulation */}
        {isMobileView ? (
          <div className="max-w-md mx-auto bg-white border-2 border-slate-300 rounded-3xl overflow-hidden shadow-2xl pb-20 relative min-h-[780px]">
            {/* Mobile Top Bar */}
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                FanFlow Mobile
              </span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                SGT UTC+8
              </span>
            </div>

            {/* Mobile Tab Content */}
            <div className="p-3.5 space-y-4">
              {activeTab === 'planner' && (
                <PlannerTab
                  fixtures={fixtures}
                  selectedVenue={selectedVenue}
                  setSelectedVenue={setSelectedVenue}
                  selectedCompetitions={selectedCompetitions}
                  setSelectedCompetitions={setSelectedCompetitions}
                  onOpenMatchDetail={(fixture, decision) => setInspectingFixture({ fixture, decision })}
                  onSelectForPoster={handleSelectForPoster}
                  isLoading={isLoadingFixtures}
                  onRefresh={fetchFixtures}
                  authWarning={authWarning}
                />
              )}

              {activeTab === 'posters' && (
                <PostersTab
                  fixtures={fixtures}
                  selectedFixture={posterFixture}
                  setSelectedFixture={setPosterFixture}
                  selectedVenue={selectedVenue}
                />
              )}

              {activeTab === 'venue-data' && (
                <VenueDataTab
                  selectedVenue={selectedVenue}
                  onSelectVenue={(v) => {
                    setSelectedVenue(v);
                    setActiveTab('planner');
                  }}
                />
              )}

              {activeTab === 'assistant' && (
                <AssistantTab
                  selectedVenue={selectedVenue}
                  fixtures={fixtures}
                />
              )}
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-2 flex items-center justify-around z-30 shadow-lg">
              <button
                onClick={() => setActiveTab('planner')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold transition-colors ${
                  activeTab === 'planner' ? 'text-blue-700 bg-blue-50 border border-blue-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Planner</span>
              </button>

              <button
                onClick={() => setActiveTab('posters')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold transition-colors ${
                  activeTab === 'posters' ? 'text-red-700 bg-red-50 border border-red-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-red-600" />
                <span>Posters</span>
              </button>

              <button
                onClick={() => setActiveTab('venue-data')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold transition-colors ${
                  activeTab === 'venue-data' ? 'text-amber-700 bg-amber-50 border border-amber-300' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>Venues</span>
              </button>

              <button
                onClick={() => setActiveTab('assistant')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold transition-colors ${
                  activeTab === 'assistant' ? 'text-blue-700 bg-blue-50 border border-blue-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Bot className="w-4 h-4 text-blue-600" />
                <span>Assistant</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard Full Web View */
          <div>
            {activeTab === 'planner' && (
              <PlannerTab
                fixtures={fixtures}
                selectedVenue={selectedVenue}
                setSelectedVenue={setSelectedVenue}
                selectedCompetitions={selectedCompetitions}
                setSelectedCompetitions={setSelectedCompetitions}
                onOpenMatchDetail={(fixture, decision) => setInspectingFixture({ fixture, decision })}
                onSelectForPoster={handleSelectForPoster}
                isLoading={isLoadingFixtures}
                onRefresh={fetchFixtures}
                authWarning={authWarning}
              />
            )}

            {activeTab === 'posters' && (
              <PostersTab
                fixtures={fixtures}
                selectedFixture={posterFixture}
                setSelectedFixture={setPosterFixture}
                selectedVenue={selectedVenue}
              />
            )}

            {activeTab === 'venue-data' && (
              <VenueDataTab
                selectedVenue={selectedVenue}
                onSelectVenue={(v) => {
                  setSelectedVenue(v);
                  setActiveTab('planner');
                }}
              />
            )}

            {activeTab === 'assistant' && (
              <AssistantTab
                selectedVenue={selectedVenue}
                fixtures={fixtures}
              />
            )}
          </div>
        )}
      </main>

      {/* Match Detail Inspection Modal */}
      <MatchDetailModal
        isOpen={Boolean(inspectingFixture)}
        onClose={() => setInspectingFixture(null)}
        fixture={inspectingFixture?.fixture || null}
        decision={inspectingFixture?.decision || null}
        venue={selectedVenue}
        onSelectForPoster={handleSelectForPoster}
      />

      {/* API Health Check Modal */}
      <SystemHealthModal
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
        healthData={healthData}
        onRefresh={checkHealth}
        isRefreshing={isCheckingHealth}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
