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
      return { text: 'APIs Live', color: 'bg-blue-50 text-blue-700 border-blue-300' };
    }
    if (fb === 'auth_failed' || fb === 'missing_token') {
      return { text: 'Simulated Data', color: 'bg-amber-50 text-amber-800 border-amber-300' };
    }
    return { text: 'APIs Offline', color: 'bg-slate-100 text-slate-700 border-slate-300' };
  };

  const healthBadge = getHealthBadge();

  const getHeaderDot = () => {
    const fbOnline = apiHealth?.footballData?.status === 'online';
    const geminiOnline = apiHealth?.gemini?.status === 'online';

    // Green if all online, amber if only Gemini is down, red if football-data.org is down
    if (!fbOnline) {
      return {
        color: 'bg-red-600',
        ring: 'ring-red-300',
        tooltip: 'football-data.org is down (Red)',
      };
    }
    if (!geminiOnline) {
      return {
        color: 'bg-amber-500',
        ring: 'ring-amber-300',
        tooltip: 'football-data.org is online, only Gemini is down (Amber)',
      };
    }
    return {
      color: 'bg-emerald-500',
      ring: 'ring-emerald-300',
      tooltip: 'All systems online: football-data.org & Gemini (Green)',
    };
  };

  const statusDot = getHeaderDot();

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-red-600 flex items-center justify-center shadow-md ring-2 ring-amber-400">
              <span className="text-xl font-black text-amber-300 tracking-tighter drop-shadow-xs">FF</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  <span>FanFlow</span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${statusDot.color} ring-2 ${statusDot.ring} inline-block animate-pulse`}
                    title={statusDot.tooltip}
                  ></span>
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  Singapore SGT (UTC+8)
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                European Football Match Planner & Playbook for SG Bars & Cafes
              </p>
            </div>
          </div>

          {/* Right Controls: Health Status & Web/Mobile Toggle */}
          <div className="flex items-center gap-2.5">
            {/* API Health Pill */}
            <button
              onClick={onOpenHealth}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors hover:brightness-95 ${healthBadge.color}`}
              title="Click to check data source connection status"
            >
              <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span className="hidden xs:inline">{healthBadge.text}</span>
            </button>

            {/* Web / Mobile Mode Toggle */}
            <button
              onClick={() => setIsMobileView(!isMobileView)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
              title={isMobileView ? 'Switch to Full Web View' : 'Switch to Mobile App View'}
            >
              {isMobileView ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Web View</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Mobile View</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible: "Who is this for?" toggle */}
        <div className="mt-2.5 pt-2 border-t border-slate-200">
          <button
            onClick={() => setWhoIsThisForExpanded(!whoIsThisForExpanded)}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-700 transition-colors group cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-blue-600 group-hover:text-blue-700" />
            <span className="font-semibold text-slate-700">Who is this for?</span>
            {whoIsThisForExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 transition-transform text-slate-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 transition-transform text-slate-500" />
            )}
          </button>

          {whoIsThisForExpanded && (
            <div className="mt-1.5 py-2 px-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-950 font-medium animate-fadeIn">
              For sports bar and café owners in Singapore who need to know which late-night European matches to screen, and how to staff and stock for them.
            </div>
          )}
        </div>

        {/* Desktop Tab Navigation (when not in mobile container view) */}
        {!isMobileView && (
          <nav className="mt-3 flex items-center space-x-2 border-b border-slate-200 -mb-3.5">
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'planner'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/60'
                  : 'border-transparent text-slate-600 hover:text-blue-700 hover:border-slate-300'
              }`}
            >
              <span>1. Planner</span>
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 shadow-xs">
                Core
              </span>
            </button>

            <button
              onClick={() => setActiveTab('posters')}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'posters'
                  ? 'border-red-600 text-red-700 bg-red-50/60'
                  : 'border-transparent text-slate-600 hover:text-red-700 hover:border-slate-300'
              }`}
            >
              <span>2. Posters</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                Promo
              </span>
            </button>

            <button
              onClick={() => setActiveTab('venue-data')}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'venue-data'
                  ? 'border-amber-500 text-amber-900 bg-amber-50/60'
                  : 'border-transparent text-slate-600 hover:text-amber-800 hover:border-slate-300'
              }`}
            >
              <span>3. Venue Data</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 font-semibold">
                DB-01 to 05
              </span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'assistant'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/60'
                  : 'border-transparent text-slate-600 hover:text-blue-700 hover:border-slate-300'
              }`}
            >
              <span>4. Assistant</span>
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                Bonus RAG
              </span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
