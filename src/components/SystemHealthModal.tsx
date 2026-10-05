import React from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, RefreshCw, ShieldCheck } from 'lucide-react';

interface SystemHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  healthData: any;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const SystemHealthModal: React.FC<SystemHealthModalProps> = ({
  isOpen,
  onClose,
  healthData,
  onRefresh,
  isRefreshing,
}) => {
  if (!isOpen) return null;

  const fb = healthData?.footballData;
  const sdb = healthData?.sportsDb;
  const gemini = healthData?.gemini;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">System & API Health Check</h2>
            <p className="text-xs text-slate-400">Status reported via secure server endpoint <code className="text-emerald-400">/api/health</code></p>
          </div>
        </div>

        <div className="space-y-3.5 mb-6">
          {/* football-data.org */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-sm text-slate-200">football-data.org v4</span>
              {fb?.status === 'online' ? (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Online
                </span>
              ) : fb?.status === 'auth_failed' ? (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <XCircle className="w-3.5 h-3.5" /> Auth Failed (403)
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <AlertTriangle className="w-3.5 h-3.5" /> Simulated Fallback
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{fb?.message}</p>
            <div className="mt-2 text-[11px] text-slate-500 bg-slate-900/60 p-2 rounded border border-slate-800">
              📌 <strong>Important notice:</strong> Scores on the free plan are delayed, so FanFlow plans ahead and never labels scores as live. 403 status indicates missing or invalid token, not a paywall.
            </div>
          </div>

          {/* TheSportsDB */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-sm text-slate-200">TheSportsDB v1</span>
              {sdb?.status === 'online' ? (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <XCircle className="w-3.5 h-3.5" /> Error
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{sdb?.message}</p>
            <p className="mt-1 text-[11px] text-slate-500">Free key 123 in URL path. Team badges and details cached for 7 days.</p>
          </div>

          {/* Gemini API */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-sm text-slate-200">Gemini AI (Bonus RAG)</span>
              {gemini?.status === 'configured' ? (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Configured
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 border border-slate-600">
                  <AlertTriangle className="w-3.5 h-3.5" /> Missing
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{gemini?.message}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Recheck APIs
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
