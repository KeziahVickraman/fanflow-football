import React from 'react';
import { Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-xs text-slate-600 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Credits */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            FanFlow Singapore
          </span>
          <span className="hidden sm:inline text-slate-300">·</span>
          <span className="font-medium">Data: <strong className="text-blue-800 font-bold">football-data.org</strong> · Badges: <strong className="text-blue-800 font-bold">TheSportsDB</strong></span>
        </div>

        {/* Timestamps & Timezone */}
        <div className="flex items-center gap-4 text-[11px] text-slate-600 font-semibold">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            All times in SGT (Singapore Time, UTC+8)
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300 font-bold">
            Free Tier: Planning Data Only
          </span>
        </div>
      </div>
    </footer>
  );
};
