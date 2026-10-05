import React from 'react';
import { X, Users, Package, Award, Sparkles, AlertCircle, Clock, Shield, Image as ImageIcon } from 'lucide-react';
import type { MatchFixture, MatchDecision } from '../shared/scoringEngine.ts';
import type { Venue } from '../data/simulatedDb.ts';

interface MatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixture: MatchFixture | null;
  decision: MatchDecision | null;
  venue: Venue;
  onSelectForPoster: (fixture: MatchFixture) => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  isOpen,
  onClose,
  fixture,
  decision,
  venue,
  onSelectForPoster,
}) => {
  if (!isOpen || !fixture || !decision) return null;

  const { breakdown, staffPlan, stockPlan, kickoffSGT } = decision;

  const getDecisionBadge = () => {
    if (decision.decision === 'Screen') {
      return {
        label: 'SCREEN',
        bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-2 ring-emerald-500/20',
        dot: 'bg-emerald-400 animate-pulse',
      };
    }
    if (decision.decision === 'Maybe') {
      return {
        label: 'MAYBE',
        bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-2 ring-amber-500/20',
        dot: 'bg-amber-400',
      };
    }
    return {
      label: 'SKIP',
      bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40 ring-2 ring-rose-500/20',
      dot: 'bg-rose-400',
    };
  };

  const badgeStyle = getDecisionBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header: Match & Competition */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {fixture.competition.name} ({fixture.competition.code})
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {kickoffSGT.fullFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 mt-3">
            {/* Home Team */}
            <div className="flex items-center gap-3 flex-1">
              <img
                src={fixture.homeTeam.badgeUrl || fixture.homeTeam.crest || '/favicon.ico'}
                alt={fixture.homeTeam.name}
                className="w-12 h-12 object-contain filter drop-shadow-md"
                onError={(e) => {
                  if (fixture.homeTeam.crest && e.currentTarget.src !== fixture.homeTeam.crest) {
                    e.currentTarget.src = fixture.homeTeam.crest;
                  }
                }}
              />
              <div>
                <h3 className="font-bold text-base text-white">{fixture.homeTeam.name}</h3>
                <span className="text-xs text-slate-400">
                  {fixture.homeTeam.position ? `League Rank #${fixture.homeTeam.position}` : 'Participant'}
                </span>
              </div>
            </div>

            <div className="text-center px-3">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">VS</span>
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-3 flex-1 justify-end text-right">
              <div>
                <h3 className="font-bold text-base text-white">{fixture.awayTeam.name}</h3>
                <span className="text-xs text-slate-400">
                  {fixture.awayTeam.position ? `League Rank #${fixture.awayTeam.position}` : 'Participant'}
                </span>
              </div>
              <img
                src={fixture.awayTeam.badgeUrl || fixture.awayTeam.crest || '/favicon.ico'}
                alt={fixture.awayTeam.name}
                className="w-12 h-12 object-contain filter drop-shadow-md"
                onError={(e) => {
                  if (fixture.awayTeam.crest && e.currentTarget.src !== fixture.awayTeam.crest) {
                    e.currentTarget.src = fixture.awayTeam.crest;
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Decision & Score Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Decision Pill Card */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Screening Recommendation</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider border ${badgeStyle.bg}`}>
                <span className={`w-2 h-2 rounded-full ${badgeStyle.dot}`}></span>
                {badgeStyle.label}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              For <strong>{venue.venue}</strong> ({venue.area} · {venue.seats} seats)
            </p>
            {decision.forcedLateNightSkip && (
              <div className="mt-2.5 p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{decision.skipReason}</span>
              </div>
            )}
            {!decision.forcedLateNightSkip && decision.skipReason && (
              <p className="mt-1.5 text-xs text-slate-400">{decision.skipReason}</p>
            )}
          </div>

          {/* Importance Score Card */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Importance Score</span>
              <span className="text-2xl font-black text-emerald-400">
                {decision.score} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  decision.score >= 75 ? 'bg-emerald-500' : decision.score >= 55 ? 'bg-amber-500' : 'bg-slate-500'
                }`}
                style={{ width: `${Math.min(100, decision.score)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              Calculated using FanFlow RULE-01 (Competition, Table Stakes, Gap, Rivalry, Fan Match).
            </p>
          </div>
        </div>

        {/* RULE-01 Breakdown Table */}
        <div className="mb-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
          <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            RULE-01 Match Importance Score Breakdown
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-800/80 border border-slate-700/40">
              <div>
                <span className="font-semibold text-slate-200">1. Competition Weight</span>
                <span className="text-slate-400 block text-[11px]">{breakdown.competitionWeight.label}</span>
              </div>
              <span className="font-bold text-emerald-400 text-sm">+{breakdown.competitionWeight.points} pts</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-800/80 border border-slate-700/40">
              <div>
                <span className="font-semibold text-slate-200">2. Table Stakes</span>
                <span className="text-slate-400 block text-[11px]">{breakdown.tableStakes.label}</span>
              </div>
              <span className="font-bold text-emerald-400 text-sm">+{breakdown.tableStakes.points} pts</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-800/80 border border-slate-700/40">
              <div>
                <span className="font-semibold text-slate-200">3. Position Gap</span>
                <span className="text-slate-400 block text-[11px]">{breakdown.positionGap.label}</span>
              </div>
              <span className="font-bold text-emerald-400 text-sm">+{breakdown.positionGap.points} pts</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-800/80 border border-slate-700/40">
              <div>
                <span className="font-semibold text-slate-200">4. Rivalry / City Derby</span>
                <span className="text-slate-400 block text-[11px]">{breakdown.rivalry.label}</span>
              </div>
              <span className="font-bold text-emerald-400 text-sm">+{breakdown.rivalry.points} pts</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-800/80 border border-slate-700/40">
              <div>
                <span className="font-semibold text-slate-200">5. Venue Fan Match</span>
                <span className="text-slate-400 block text-[11px]">{breakdown.fanMatch.label}</span>
              </div>
              <span className="font-bold text-emerald-400 text-sm">+{breakdown.fanMatch.points} pts</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-700 font-bold text-sm">
              <span className="text-slate-300">Total Score (capped at 100):</span>
              <span className="text-emerald-400 text-base">{decision.score} / 100</span>
            </div>
          </div>
        </div>

        {/* RULE-03 & RULE-04 Staff & Stock Operations Playbook */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Staff Plan */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-400" />
              RULE-03 Staff Plan
            </h4>
            <div className="mb-2">
              <div className="text-2xl font-black text-white">
                {staffPlan.staffCount} <span className="text-sm font-semibold text-slate-400">staff needed</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Expected Crowd: <strong>{staffPlan.expectedCrowd}</strong> fans ({(staffPlan.occupancyRate * 100)}% occupancy of {venue.seats} seats)
              </p>
            </div>
            <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800">
              {staffPlan.formulaExplanation}
            </p>
          </div>

          {/* Stock Plan */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-400" />
              RULE-04 Stock Plan
            </h4>
            <div className="mb-2">
              <div className="text-xl font-bold text-amber-300">
                {stockPlan.level}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {stockPlan.recommendation}
              </p>
            </div>
            <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800">
              Based on score threshold: &ge;85 high (150%), 75-84 normal+25%, 55-74 normal.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            Close
          </button>

          {decision.decision === 'Screen' && (
            <button
              onClick={() => {
                onSelectForPoster(fixture);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-lg shadow-emerald-600/30"
            >
              <ImageIcon className="w-4 h-4" />
              Generate Promo Poster
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
