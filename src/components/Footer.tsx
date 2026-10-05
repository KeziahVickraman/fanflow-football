import React from 'react';
import { ShieldCheck, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Credits */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <span className="font-bold text-slate-300">FanFlow Singapore</span>
          <span className="hidden sm:inline">·</span>
          <span>Data: <strong className="text-slate-400">football-data.org</strong> · Badges: <strong className="text-slate-400">TheSportsDB</strong></span>
        </div>

        {/* Timestamps & Timezone */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            All times in SGT (Singapore Time, UTC+8)
          </span>
          <span className="text-slate-600">|</span>
          <span>Free Tier: Delayed Scores Only (No Live Ticker)</span>
        </div>
      </div>
    </footer>
  );
};
