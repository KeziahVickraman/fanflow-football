import React from 'react';
import { X, Users, Package, Award, Clock, AlertCircle, Image as ImageIcon } from 'lucide-react';
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
        bg: 'bg-blue-600 text-white border-blue-700 shadow-xs',
        dot: 'bg-amber-300 animate-pulse',
      };
    }
    if (decision.decision === 'Maybe') {
      return {
        label: 'MAYBE',
        bg: 'bg-amber-100 text-amber-900 border-amber-300',
        dot: 'bg-amber-500',
      };
    }
    return {
      label: 'SKIP',
      bg: 'bg-red-100 text-red-900 border-red-200',
      dot: 'bg-red-500',
    };
  };

  const badgeStyle = getDecisionBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header: Match & Competition */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              {fixture.competition.name} ({fixture.competition.code})
            </span>
            <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              {kickoffSGT.fullFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mt-3 shadow-2xs">
            {/* Home Team */}
            <div className="flex items-center gap-3 flex-1">
              <img
                src={fixture.homeTeam.badgeUrl || fixture.homeTeam.crest || '/favicon.ico'}
                alt={fixture.homeTeam.name}
                className="w-12 h-12 object-contain filter drop-shadow-xs"
                onError={(e) => {
                  if (fixture.homeTeam.crest && e.currentTarget.src !== fixture.homeTeam.crest) {
                    e.currentTarget.src = fixture.homeTeam.crest;
                  }
                }}
              />
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{fixture.homeTeam.name}</h3>
                <span className="text-xs font-semibold text-slate-500">
                  {fixture.homeTeam.position ? `League Rank #${fixture.homeTeam.position}` : 'Participant'}
                </span>
              </div>
            </div>

            <div className="text-center px-3">
              <span className="text-xs font-black text-red-600 uppercase tracking-widest px-2 py-1 rounded bg-red-100/60 border border-red-200">
                VS
              </span>
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-3 flex-1 justify-end text-right">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{fixture.awayTeam.name}</h3>
                <span className="text-xs font-semibold text-slate-500">
                  {fixture.awayTeam.position ? `League Rank #${fixture.awayTeam.position}` : 'Participant'}
                </span>
              </div>
              <img
                src={fixture.awayTeam.badgeUrl || fixture.awayTeam.crest || '/favicon.ico'}
                alt={fixture.awayTeam.name}
                className="w-12 h-12 object-contain filter drop-shadow-xs"
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
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Screening Recommendation</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider border ${badgeStyle.bg}`}>
                <span className={`w-2 h-2 rounded-full ${badgeStyle.dot}`}></span>
                {badgeStyle.label}
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium">
              For <strong>{venue.venue}</strong> ({venue.area} · {venue.seats} seats)
            </p>
            {decision.forcedLateNightSkip && (
              <div className="mt-2.5 p-2 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{decision.skipReason}</span>
              </div>
            )}
            {!decision.forcedLateNightSkip && decision.skipReason && (
              <p className="mt-1.5 text-xs text-slate-600">{decision.skipReason}</p>
            )}
          </div>

          {/* Importance Score Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Importance Score</span>
              <span className="text-2xl font-black text-blue-700">
                {decision.score} <span className="text-xs font-normal text-slate-500">/ 100</span>
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  decision.score >= 75 ? 'bg-blue-600' : decision.score >= 55 ? 'bg-amber-400' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, decision.score)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Calculated using FanFlow RULE-01 (Competition, Table Stakes, Gap, Rivalry, Fan Match).
            </p>
          </div>
        </div>

        {/* RULE-01 Breakdown Table */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h4 className="text-xs uppercase font-black tracking-wider text-blue-900 mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            RULE-01 Match Importance Score Breakdown
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900">1. Competition Weight</span>
                <span className="text-slate-500 block text-[11px]">{breakdown.competitionWeight.label}</span>
              </div>
              <span className="font-black text-blue-700 text-sm">+{breakdown.competitionWeight.points} pts</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900">2. Table Stakes</span>
                <span className="text-slate-500 block text-[11px]">{breakdown.tableStakes.label}</span>
              </div>
              <span className="font-black text-blue-700 text-sm">+{breakdown.tableStakes.points} pts</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900">3. Position Gap</span>
                <span className="text-slate-500 block text-[11px]">{breakdown.positionGap.label}</span>
              </div>
              <span className="font-black text-blue-700 text-sm">+{breakdown.positionGap.points} pts</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900">4. Rivalry / City Derby</span>
                <span className="text-slate-500 block text-[11px]">{breakdown.rivalry.label}</span>
              </div>
              <span className="font-black text-blue-700 text-sm">+{breakdown.rivalry.points} pts</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900">5. Venue Fan Match</span>
                <span className="text-slate-500 block text-[11px]">{breakdown.fanMatch.label}</span>
              </div>
              <span className="font-black text-blue-700 text-sm">+{breakdown.fanMatch.points} pts</span>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 font-extrabold text-sm">
              <span className="text-slate-700">Total Score (capped at 100):</span>
              <span className="text-blue-700 text-base font-black">{decision.score} / 100</span>
            </div>
          </div>
        </div>

        {/* RULE-03 & RULE-04 Staff & Stock Operations Playbook */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Staff Plan */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-2xs">
            <h4 className="text-xs uppercase font-black tracking-wider text-blue-900 mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              RULE-03 Staff Plan
            </h4>
            <div className="mb-2">
              <div className="text-2xl font-black text-blue-950">
                {staffPlan.staffCount} <span className="text-sm font-bold text-blue-700">staff needed</span>
              </div>
              <p className="text-xs text-slate-700 font-medium mt-1">
                Expected Crowd: <strong>{staffPlan.expectedCrowd}</strong> fans ({(staffPlan.occupancyRate * 100)}% occupancy of {venue.seats} seats)
              </p>
            </div>
            <p className="text-[11px] text-blue-900 bg-white p-2.5 rounded-xl border border-blue-200 font-semibold">
              {staffPlan.formulaExplanation}
            </p>
          </div>

          {/* Stock Plan */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 shadow-2xs">
            <h4 className="text-xs uppercase font-black tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-600" />
              RULE-04 Stock Plan
            </h4>
            <div className="mb-2">
              <div className="text-xl font-black text-amber-900">
                {stockPlan.level}
              </div>
              <p className="text-xs text-slate-700 font-medium mt-1">
                {stockPlan.recommendation}
              </p>
            </div>
            <p className="text-[11px] text-amber-950 bg-white p-2.5 rounded-xl border border-amber-200 font-semibold">
              Based on score threshold: &ge;85 high (150%), 75-84 normal+25%, 55-74 normal.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
          >
            Close
          </button>

          {decision.decision === 'Screen' && (
            <button
              onClick={() => {
                onSelectForPoster(fixture);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-colors shadow-md shadow-red-600/20"
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
