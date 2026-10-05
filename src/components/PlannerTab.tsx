import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Filter,
  CheckCircle,
  HelpCircle,
  XCircle,
  Moon,
  Clock,
  ChevronRight,
  TrendingUp,
  Search,
  Building2,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { DB_02_VENUES, type Venue } from '../data/simulatedDb.ts';
import type { MatchFixture, MatchDecision } from '../shared/scoringEngine.ts';
import { calculateMatchDecision } from '../shared/scoringEngine.ts';

interface PlannerTabProps {
  fixtures: MatchFixture[];
  selectedVenue: Venue;
  setSelectedVenue: (venue: Venue) => void;
  selectedCompetitions: string[];
  setSelectedCompetitions: (comps: string[]) => void;
  onOpenMatchDetail: (fixture: MatchFixture, decision: MatchDecision) => void;
  onSelectForPoster: (fixture: MatchFixture) => void;
  isLoading: boolean;
  onRefresh: () => void;
  authWarning?: string;
}

const ALL_COMPETITIONS = [
  { code: 'PL', name: 'Premier League', region: 'England' },
  { code: 'CL', name: 'Champions League', region: 'Europe' },
  { code: 'PD', name: 'La Liga', region: 'Spain' },
  { code: 'BL1', name: 'Bundesliga', region: 'Germany' },
  { code: 'SA', name: 'Serie A', region: 'Italy' },
  { code: 'FL1', name: 'Ligue 1', region: 'France' },
  { code: 'PPL', name: 'Primeira Liga', region: 'Portugal' },
];

export const PlannerTab: React.FC<PlannerTabProps> = ({
  fixtures,
  selectedVenue,
  setSelectedVenue,
  selectedCompetitions,
  setSelectedCompetitions,
  onOpenMatchDetail,
  onSelectForPoster,
  isLoading,
  onRefresh,
  authWarning,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<'All' | 'Screen' | 'Maybe' | 'Skip'>('All');

  // Compute decisions for all fixtures against currently selected venue
  const matchDecisions = useMemo(() => {
    return fixtures.map(fixture => ({
      fixture,
      decision: calculateMatchDecision(fixture, selectedVenue),
    }));
  }, [fixtures, selectedVenue]);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return matchDecisions.filter(({ fixture, decision }) => {
      // 1. Competition filter
      const compCode = fixture.competition.code?.toUpperCase();
      if (selectedCompetitions.length > 0 && !selectedCompetitions.includes(compCode)) {
        return false;
      }

      // 2. Decision filter
      if (decisionFilter !== 'All' && decision.decision !== decisionFilter) {
        return false;
      }

      // 3. Search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const home = fixture.homeTeam.name.toLowerCase();
        const away = fixture.awayTeam.name.toLowerCase();
        const comp = fixture.competition.name.toLowerCase();
        if (!home.includes(query) && !away.includes(query) && !comp.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [matchDecisions, selectedCompetitions, decisionFilter, searchTerm]);

  // "This week at a glance" statistics
  const weeklySummary = useMemo(() => {
    let screenCount = 0;
    let maybeCount = 0;
    let skipCount = 0;

    // Group screened matches by night / day to find busiest night
    const dayStats: Record<string, { count: number; crowd: number; dayName: string; dateFormatted: string }> = {};

    matchDecisions.forEach(({ decision }) => {
      if (decision.decision === 'Screen') screenCount++;
      else if (decision.decision === 'Maybe') maybeCount++;
      else skipCount++;

      const dateKey = decision.kickoffSGT.dateKey;
      if (!dayStats[dateKey]) {
        dayStats[dateKey] = {
          count: 0,
          crowd: 0,
          dayName: decision.kickoffSGT.dayName,
          dateFormatted: decision.kickoffSGT.formattedDate,
        };
      }

      if (decision.decision === 'Screen') {
        dayStats[dateKey].count += 1;
        dayStats[dateKey].crowd += decision.staffPlan.expectedCrowd;
      }
    });

    // Determine busiest night
    let busiestDay = { dayName: 'Saturday', dateFormatted: 'This Weekend', count: 0, crowd: 0 };
    Object.values(dayStats).forEach(day => {
      if (day.crowd > busiestDay.crowd || (day.crowd === busiestDay.crowd && day.count > busiestDay.count)) {
        busiestDay = day;
      }
    });

    return {
      screenCount,
      maybeCount,
      skipCount,
      busiestDay,
      totalMatches: matchDecisions.length,
    };
  }, [matchDecisions]);

  const toggleCompetition = (code: string) => {
    if (selectedCompetitions.includes(code)) {
      if (selectedCompetitions.length > 1) {
        setSelectedCompetitions(selectedCompetitions.filter(c => c !== code));
      }
    } else {
      setSelectedCompetitions([...selectedCompetitions, code]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Fallback / Auth Banner if live token is missing or 403 */}
      {authWarning && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 flex items-start gap-3 text-amber-200 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block text-amber-300">football-data.org Notice</span>
            <span>{authWarning}</span>
          </div>
          <button
            onClick={onRefresh}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top Section: Venue Picker & Status */}
      <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Venue Selector */}
          <div className="flex-1">
            <label className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              Active Venue (DB-02 Simulated Singapore Venues)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedVenue.venue_id}
                onChange={(e) => {
                  const found = DB_02_VENUES.find(v => v.venue_id === e.target.value);
                  if (found) setSelectedVenue(found);
                }}
                className="bg-slate-900 border border-slate-700 text-white text-sm font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
              >
                {DB_02_VENUES.map(v => (
                  <option key={v.venue_id} value={v.venue_id}>
                    {v.venue} ({v.area}) — {v.seats} seats
                  </option>
                ))}
              </select>

              {/* Venue Quick Chips */}
              <div className="hidden lg:flex items-center gap-1.5">
                {DB_02_VENUES.slice(0, 4).map(v => (
                  <button
                    key={v.venue_id}
                    onClick={() => setSelectedVenue(v)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedVenue.venue_id === v.venue_id
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {v.venue.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Venue Snapshot Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80">
              <span className="text-slate-400 block text-[10px]">Type & Area</span>
              <span className="font-semibold text-white">{selectedVenue.type} · {selectedVenue.area}</span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80">
              <span className="text-slate-400 block text-[10px]">Fan Base</span>
              <span className="font-semibold text-emerald-400">{selectedVenue.fanBase}</span>
            </div>

            <div className={`px-3 py-1.5 rounded-lg border ${
              selectedVenue.lateNightLicence
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <span className="block text-[10px] uppercase font-bold">Late-Night Licence (&gt;2 AM)</span>
              <span className="font-bold flex items-center gap-1">
                <Moon className="w-3 h-3" />
                {selectedVenue.lateNightLicence ? 'Permitted (Yes)' : 'No License (Auto-Skip)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* "This week at a glance" Summary Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Screen Count */}
        <div
          onClick={() => setDecisionFilter(decisionFilter === 'Screen' ? 'All' : 'Screen')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            decisionFilter === 'Screen'
              ? 'bg-emerald-500/15 border-emerald-500 shadow-md ring-1 ring-emerald-500'
              : 'bg-slate-800/80 border-slate-700 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Screen Recommendations</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-emerald-400">
            {weeklySummary.screenCount}
          </div>
          <span className="text-[11px] text-slate-400">Score &ge; 75 · Ready to screen</span>
        </div>

        {/* Maybe Count */}
        <div
          onClick={() => setDecisionFilter(decisionFilter === 'Maybe' ? 'All' : 'Maybe')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            decisionFilter === 'Maybe'
              ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500'
              : 'bg-slate-800/80 border-slate-700 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Maybe (Optional)</span>
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-amber-400">
            {weeklySummary.maybeCount}
          </div>
          <span className="text-[11px] text-slate-400">Score 55 to 74 · 40% occupancy</span>
        </div>

        {/* Skip Count */}
        <div
          onClick={() => setDecisionFilter(decisionFilter === 'Skip' ? 'All' : 'Skip')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            decisionFilter === 'Skip'
              ? 'bg-rose-500/15 border-rose-500 shadow-md ring-1 ring-rose-500'
              : 'bg-slate-800/80 border-slate-700 hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Skip Matches</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-slate-300">
            {weeklySummary.skipCount}
          </div>
          <span className="text-[11px] text-slate-400">&lt;55 or after 2am w/o licence</span>
        </div>

        {/* Busiest Night */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/90 to-emerald-950/40 border border-emerald-500/30 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Busiest Night
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Peak
            </span>
          </div>
          <div className="mt-1.5 text-lg font-black text-white">
            {weeklySummary.busiestDay.dateFormatted}
          </div>
          <p className="text-xs text-slate-300 mt-1">
            <strong>{weeklySummary.busiestDay.count} Screened matches</strong> · ~{weeklySummary.busiestDay.crowd} expected fans
          </p>
        </div>
      </div>

      {/* Competition Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/60">
        {/* Competition Pills (Default PL & CL) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Competitions:
          </span>
          {ALL_COMPETITIONS.map(comp => {
            const isSelected = selectedCompetitions.includes(comp.code);
            return (
              <button
                key={comp.code}
                onClick={() => toggleCompetition(comp.code)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {comp.code}
              </button>
            );
          })}
        </div>

        {/* Search input & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search team or league..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Refresh fixtures"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Match List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Upcoming Fixtures ({filteredMatches.length} matches in next 7 days)</span>
          <span className="text-[11px] text-slate-500">Tap match to inspect score breakdown & operational plan</span>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm font-medium">No matches match your active filters.</p>
            <button
              onClick={() => {
                setSelectedCompetitions(['PL', 'CL']);
                setDecisionFilter('All');
                setSearchTerm('');
              }}
              className="mt-3 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredMatches.map(({ fixture, decision }) => {
            const isScreen = decision.decision === 'Screen';
            const isMaybe = decision.decision === 'Maybe';
            const isSkip = decision.decision === 'Skip';

            return (
              <div
                key={fixture.id}
                onClick={() => onOpenMatchDetail(fixture, decision)}
                className={`group rounded-xl p-4 transition-all duration-200 border cursor-pointer ${
                  isScreen
                    ? 'bg-slate-800/90 hover:bg-slate-800 border-slate-700/80 hover:border-emerald-500/60 shadow-sm'
                    : isMaybe
                    ? 'bg-slate-800/60 hover:bg-slate-800/80 border-slate-800 hover:border-amber-500/40'
                    : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800/60 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Competition & Kickoff Time */}
                  <div className="w-full md:w-56 shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {fixture.competition.code}
                      </span>
                      <span className="text-xs text-slate-400 font-medium truncate">
                        {fixture.competition.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-white mt-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{decision.kickoffSGT.fullFormatted}</span>
                    </div>

                    {decision.kickoffSGT.isLateNightAfter2am && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded mt-1.5 bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                        <Moon className="w-2.5 h-2.5" /> Late Night (&gt;2 AM SGT)
                      </span>
                    )}
                  </div>

                  {/* Center: Teams & Badges */}
                  <div className="flex-1 flex items-center justify-between sm:justify-start gap-4 sm:gap-6">
                    {/* Home Team */}
                    <div className="flex items-center gap-2.5 flex-1 justify-end text-right">
                      <div>
                        <span className="font-bold text-sm text-white block group-hover:text-emerald-300 transition-colors">
                          {fixture.homeTeam.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {fixture.homeTeam.position ? `#${fixture.homeTeam.position} Table` : ''}
                        </span>
                      </div>
                      <img
                        src={fixture.homeTeam.badgeUrl || fixture.homeTeam.crest || '/favicon.ico'}
                        alt={fixture.homeTeam.name}
                        className="w-9 h-9 object-contain shrink-0 filter drop-shadow"
                        onError={(e) => {
                          if (fixture.homeTeam.crest && e.currentTarget.src !== fixture.homeTeam.crest) {
                            e.currentTarget.src = fixture.homeTeam.crest;
                          }
                        }}
                      />
                    </div>

                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                      VS
                    </span>

                    {/* Away Team */}
                    <div className="flex items-center gap-2.5 flex-1 justify-start text-left">
                      <img
                        src={fixture.awayTeam.badgeUrl || fixture.awayTeam.crest || '/favicon.ico'}
                        alt={fixture.awayTeam.name}
                        className="w-9 h-9 object-contain shrink-0 filter drop-shadow"
                        onError={(e) => {
                          if (fixture.awayTeam.crest && e.currentTarget.src !== fixture.awayTeam.crest) {
                            e.currentTarget.src = fixture.awayTeam.crest;
                          }
                        }}
                      />
                      <div>
                        <span className="font-bold text-sm text-white block group-hover:text-emerald-300 transition-colors">
                          {fixture.awayTeam.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {fixture.awayTeam.position ? `#${fixture.awayTeam.position} Table` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score, Decision & Operations Quick Pills */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    {/* Importance Score */}
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Score</div>
                      <div className="text-base font-black text-white flex items-center justify-end gap-1">
                        <span>{decision.score}</span>
                        <span className="text-[10px] text-slate-500 font-normal">/100</span>
                      </div>
                    </div>

                    {/* Decision Badge */}
                    <div className="flex items-center gap-2">
                      {isScreen ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          SCREEN
                        </span>
                      ) : isMaybe ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          MAYBE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-slate-800 text-slate-400 border border-slate-700">
                          SKIP
                        </span>
                      )}

                      {/* Poster Button Shortcut if Screen */}
                      {isScreen && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectForPoster(fixture);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 transition-colors"
                          title="Generate promo poster for this match"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>

                {/* Operations Footnote on Card */}
                {isScreen && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-3">
                      <span>👥 Expected: <strong>~{decision.staffPlan.expectedCrowd} fans</strong></span>
                      <span>👨‍🍳 Staff: <strong>{decision.staffPlan.staffCount} floor</strong></span>
                      <span>📦 Stock: <strong>{decision.stockPlan.level}</strong></span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold group-hover:underline">
                      View score breakdown &rarr;
                    </span>
                  </div>
                )}

                {decision.forcedLateNightSkip && (
                  <div className="mt-2.5 text-[11px] text-rose-300 bg-rose-950/30 px-2.5 py-1 rounded border border-rose-800/40">
                    ⚠️ {decision.skipReason}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
