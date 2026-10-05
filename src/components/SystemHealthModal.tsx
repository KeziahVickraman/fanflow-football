import React from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, RefreshCw, ShieldCheck, BookOpen } from 'lucide-react';

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
  const kb = healthData?.knowledgeBase;

  const getGeminiBadge = () => {
    const status = gemini?.status;
    if (status === 'online') {
      return {
        label: 'Online',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      };
    }
    if (status === 'missing_key') {
      return {
        label: 'Missing Key',
        bg: 'bg-slate-100 text-slate-700 border-slate-300',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
      };
    }
    if (status === 'auth_failed') {
      return {
        label: `Auth Failed (${gemini?.code || 401})`,
        bg: 'bg-red-100 text-red-800 border-red-300',
        icon: <XCircle className="w-3.5 h-3.5" />,
      };
    }
    if (status === 'rate_limited') {
      return {
        label: 'Rate Limited (429)',
        bg: 'bg-amber-100 text-amber-900 border-amber-300',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
      };
    }
    if (status === 'model_error') {
      return {
        label: 'Model Error (400)',
        bg: 'bg-red-100 text-red-800 border-red-300',
        icon: <XCircle className="w-3.5 h-3.5" />,
      };
    }
    return {
      label: 'Error',
      bg: 'bg-red-100 text-red-800 border-red-300',
      icon: <XCircle className="w-3.5 h-3.5" />,
    };
  };

  const geminiBadge = getGeminiBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">System & API Health Check</h2>
            <p className="text-xs text-slate-500 font-medium">Real-time status via secure server endpoint <code className="text-blue-700 font-bold">/api/health</code></p>
          </div>
        </div>

        <div className="space-y-3.5 mb-6">
          {/* football-data.org */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm text-slate-900">football-data.org v4</span>
              {fb?.status === 'online' ? (
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Online
                </span>
              ) : fb?.status === 'auth_failed' ? (
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                  <XCircle className="w-3.5 h-3.5" /> Auth Failed ({fb?.code || 403})
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5" /> Simulated Fallback
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{fb?.message}</p>
            <div className="mt-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
              📌 <strong>Important notice:</strong> Scores on the free plan are delayed, so FanFlow plans ahead and never labels scores as live. 403 status indicates missing or invalid token, not a paywall.
            </div>
          </div>

          {/* Gemini AI */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm text-slate-900">Gemini AI (Flash Model)</span>
              <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${geminiBadge.bg}`}>
                {geminiBadge.icon} {geminiBadge.label}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{gemini?.message}</p>
          </div>

          {/* Knowledge Base */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Knowledge Base (knowledge.md)
              </span>
              {kb?.status === 'loaded' ? (
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {kb.chunkCount} Chunks
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                  <XCircle className="w-3.5 h-3.5" /> Not Loaded
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {kb?.message || 'Parsed into heading chunks for retrieval'}
            </p>
          </div>

          {/* TheSportsDB */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm text-slate-900">TheSportsDB v1</span>
              {sdb?.status === 'online' ? (
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                  <XCircle className="w-3.5 h-3.5" /> Error
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{sdb?.message}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            Recheck APIs
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-extrabold text-white transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
