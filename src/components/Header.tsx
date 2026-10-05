import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Smartphone, Monitor, Info, Activity } from 'lucide-react';

interface HeaderProps {
  activeTab: 'planner' | 'posters' | 'venue-data' | 'assistant';
  setActiveTab: (tab: 'planner' | 'posters' | 'venue-data' | 'assistant') => void;
  isMobileView: boolean;
  setIsMobileView: (isMobile: boolean) => void;
  onOpenHealth: () => void;
  apiHealth: any;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isMobileView,
  setIsMobileView,
  onOpenHealth,
  apiHealth,
}) => {
  const [whoIsThisForExpanded, setWhoIsThisForExpanded] = useState(false);

  const getHealthBadge = () => {
    const fb = apiHealth?.footballData?.status;
    if (fb === 'online') {
      return { text: 'APIs Live', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    }
    if (fb === 'auth_failed' || fb === 'missing_token') {
      return { text: 'Simulated Data', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
    return { text: 'APIs Offline', color: 'bg-slate-700/60 text-slate-300 border-slate-600' };
  };

  const healthBadge = getHealthBadge();

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              <span className="text-xl font-black text-white tracking-tighter">FF</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  FanFlow
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Singapore SGT (UTC+8)
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                European Football Match Planner & Playbook for SG Bars & Cafes
              </p>
            </div>
          </div>

          {/* Right Controls: Health Status & Web/Mobile Toggle */}
          <div className="flex items-center gap-2.5">
            {/* API Health Pill */}
            <button
              onClick={onOpenHealth}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors hover:brightness-110 ${healthBadge.color}`}
              title="Click to check data source connection status"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden xs:inline">{healthBadge.text}</span>
            </button>

            {/* Web / Mobile Mode Toggle */}
            <button
              onClick={() => setIsMobileView(!isMobileView)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors shadow-sm"
              title={isMobileView ? 'Switch to Full Web View' : 'Switch to Mobile App View'}
            >
              {isMobileView ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Web View</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Mobile View</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible: "Who is this for?" toggle */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setWhoIsThisForExpanded(!whoIsThisForExpanded)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors group cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
            <span className="font-medium">Who is this for?</span>
            {whoIsThisForExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 transition-transform" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 transition-transform" />
            )}
          </button>

          {whoIsThisForExpanded && (
            <div className="mt-1.5 py-2 px-3 bg-slate-800/60 rounded-lg border border-slate-700/60 text-xs text-slate-300 animate-fadeIn">
              For sports bar and café owners in Singapore who need to know which late-night European matches to screen, and how to staff and stock for them.
            </div>
          )}
        </div>

        {/* Desktop Tab Navigation (when not in mobile container view) */}
        {!isMobileView && (
          <nav className="mt-3 flex items-center space-x-1 border-b border-slate-800 -mb-3.5">
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'planner'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              1. Planner
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Core
              </span>
            </button>

            <button
              onClick={() => setActiveTab('posters')}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'posters'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              2. Posters
            </button>

            <button
              onClick={() => setActiveTab('venue-data')}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'venue-data'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              3. Venue Data
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                DB-01 to 05
              </span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'assistant'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              4. Assistant
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Bonus RAG
              </span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
