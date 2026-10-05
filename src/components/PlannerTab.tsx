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
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-start gap-3 text-amber-950 text-xs shadow-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-amber-900">football-data.org Notice</span>
            <span>{authWarning}</span>
          </div>
          <button
            onClick={onRefresh}
            className="px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-200 text-amber-900 border border-amber-400 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top Section: Venue Picker & Status */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Venue Selector */}
          <div className="flex-1">
            <label className="text-xs uppercase font-extrabold tracking-wider text-blue-900 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Active Venue (DB-02 Simulated Singapore Venues)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedVenue.venue_id}
                onChange={(e) => {
                  const found = DB_02_VENUES.find(v => v.venue_id === e.target.value);
                  if (found) setSelectedVenue(found);
                }}
                className="bg-slate-50 border border-slate-300 text-slate-900 text-sm font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-auto shadow-2xs"
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
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedVenue.venue_id === v.venue_id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
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
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Type & Area</span>
              <span className="font-bold text-slate-900">{selectedVenue.type} · {selectedVenue.area}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-blue-700 block text-[10px] font-bold uppercase">Fan Base</span>
              <span className="font-extrabold text-blue-900">{selectedVenue.fanBase}</span>
            </div>

            <div className={`px-3 py-1.5 rounded-xl border ${
              selectedVenue.lateNightLicence
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              <span className="block text-[10px] uppercase font-extrabold">Late-Night Licence (&gt;2 AM)</span>
              <span className="font-bold flex items-center gap-1">
                <Moon className="w-3 h-3 text-amber-600" />
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
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            decisionFilter === 'Screen'
              ? 'bg-blue-600 text-white shadow-md border-blue-700 ring-2 ring-blue-400'
              : 'bg-white border-slate-200 hover:border-blue-400 text-slate-900 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-extrabold tracking-wider ${decisionFilter === 'Screen' ? 'text-blue-100' : 'text-slate-500'}`}>
              Screen Recommendation
            </span>
            <CheckCircle className={`w-4 h-4 ${decisionFilter === 'Screen' ? 'text-amber-300' : 'text-blue-600'}`} />
          </div>
          <div className={`mt-2 text-3xl font-black ${decisionFilter === 'Screen' ? 'text-white' : 'text-blue-700'}`}>
            {weeklySummary.screenCount}
          </div>
          <span className={`text-[11px] ${decisionFilter === 'Screen' ? 'text-blue-100' : 'text-slate-500'}`}>
            Score &ge; 75 · Ready to screen
          </span>
        </div>

        {/* Maybe Count */}
        <div
          onClick={() => setDecisionFilter(decisionFilter === 'Maybe' ? 'All' : 'Maybe')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            decisionFilter === 'Maybe'
              ? 'bg-amber-400 text-slate-950 shadow-md border-amber-500 ring-2 ring-amber-300'
              : 'bg-amber-50/70 border-amber-200 hover:border-amber-400 text-amber-950 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-900">
              Maybe (Optional)
            </span>
            <HelpCircle className="w-4 h-4 text-amber-700" />
          </div>
          <div className="mt-2 text-3xl font-black text-amber-900">
            {weeklySummary.maybeCount}
          </div>
          <span className="text-[11px] text-amber-800">Score 55 to 74 · 40% occupancy</span>
        </div>

        {/* Skip Count */}
        <div
          onClick={() => setDecisionFilter(decisionFilter === 'Skip' ? 'All' : 'Skip')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            decisionFilter === 'Skip'
              ? 'bg-red-600 text-white shadow-md border-red-700 ring-2 ring-red-400'
              : 'bg-red-50/60 border-red-200 hover:border-red-400 text-red-950 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-extrabold tracking-wider ${decisionFilter === 'Skip' ? 'text-red-100' : 'text-red-800'}`}>
              Skip Matches
            </span>
            <XCircle className={`w-4 h-4 ${decisionFilter === 'Skip' ? 'text-white' : 'text-red-600'}`} />
          </div>
          <div className={`mt-2 text-3xl font-black ${decisionFilter === 'Skip' ? 'text-white' : 'text-red-600'}`}>
            {weeklySummary.skipCount}
          </div>
          <span className={`text-[11px] ${decisionFilter === 'Skip' ? 'text-red-100' : 'text-red-800'}`}>
            &lt;55 or after 2am w/o licence
          </span>
        </div>

        {/* Busiest Night */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 text-white border border-blue-800 shadow-md col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Busiest Night
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
              PEAK
            </span>
          </div>
          <div className="mt-1.5 text-lg font-black text-white">
            {weeklySummary.busiestDay.dateFormatted}
          </div>
          <p className="text-xs text-blue-100 mt-1">
            <strong className="text-white">{weeklySummary.busiestDay.count} Screened matches</strong> · ~{weeklySummary.busiestDay.crowd} expected fans
          </p>
        </div>
      </div>

      {/* Competition Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Competition Pills (Default PL & CL) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-blue-600" /> Leagues:
          </span>
          {ALL_COMPETITIONS.map(comp => {
            const isSelected = selectedCompetitions.includes(comp.code);
            return (
              <button
                key={comp.code}
                onClick={() => toggleCompetition(comp.code)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
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
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-colors"
            title="Refresh fixtures"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Match List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
          <span>Upcoming Fixtures ({filteredMatches.length} matches in next 7 days)</span>
          <span className="text-[11px] text-slate-400">Tap match to inspect score breakdown & operational plan</span>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-slate-500 text-sm font-semibold">No matches match your active filters.</p>
            <button
              onClick={() => {
                setSelectedCompetitions(['PL', 'CL']);
                setDecisionFilter('All');
                setSearchTerm('');
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors"
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
                className={`group rounded-2xl p-4 transition-all duration-200 border cursor-pointer ${
                  isScreen
                    ? 'bg-white hover:bg-blue-50/30 border-blue-200 hover:border-blue-500 shadow-xs'
                    : isMaybe
                    ? 'bg-white hover:bg-amber-50/30 border-amber-200 hover:border-amber-400 shadow-2xs'
                    : 'bg-white/80 hover:bg-slate-50 border-slate-200 opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Competition & Kickoff Time */}
                  <div className="w-full md:w-56 shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                        {fixture.competition.code}
                      </span>
                      <span className="text-xs text-slate-600 font-bold truncate">
                        {fixture.competition.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 mt-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{decision.kickoffSGT.fullFormatted}</span>
                    </div>

                    {decision.kickoffSGT.isLateNightAfter2am && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 bg-amber-100 text-amber-900 border border-amber-300">
                        <Moon className="w-2.5 h-2.5 text-amber-700" /> Late Night (&gt;2 AM SGT)
                      </span>
                    )}
                  </div>

                  {/* Center: Teams & Badges */}
                  <div className="flex-1 flex items-center justify-between sm:justify-start gap-4 sm:gap-6">
                    {/* Home Team */}
                    <div className="flex items-center gap-2.5 flex-1 justify-end text-right">
                      <div>
                        <span className="font-extrabold text-sm text-slate-900 block group-hover:text-blue-700 transition-colors">
                          {fixture.homeTeam.name}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {fixture.homeTeam.position ? `#${fixture.homeTeam.position} Table` : ''}
                        </span>
                      </div>
                      <img
                        src={fixture.homeTeam.badgeUrl || fixture.homeTeam.crest || '/favicon.ico'}
                        alt={fixture.homeTeam.name}
                        className="w-10 h-10 object-contain shrink-0 filter drop-shadow-xs"
                        onError={(e) => {
                          if (fixture.homeTeam.crest && e.currentTarget.src !== fixture.homeTeam.crest) {
                            e.currentTarget.src = fixture.homeTeam.crest;
                          }
                        }}
                      />
                    </div>

                    <span className="text-xs font-black text-red-600 uppercase tracking-widest px-2 py-1 rounded bg-red-50 border border-red-200">
                      VS
                    </span>

                    {/* Away Team */}
                    <div className="flex items-center gap-2.5 flex-1 justify-start text-left">
                      <img
                        src={fixture.awayTeam.badgeUrl || fixture.awayTeam.crest || '/favicon.ico'}
                        alt={fixture.awayTeam.name}
                        className="w-10 h-10 object-contain shrink-0 filter drop-shadow-xs"
                        onError={(e) => {
                          if (fixture.awayTeam.crest && e.currentTarget.src !== fixture.awayTeam.crest) {
                            e.currentTarget.src = fixture.awayTeam.crest;
                          }
                        }}
                      />
                      <div>
                        <span className="font-extrabold text-sm text-slate-900 block group-hover:text-blue-700 transition-colors">
                          {fixture.awayTeam.name}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {fixture.awayTeam.position ? `#${fixture.awayTeam.position} Table` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score, Decision & Operations Quick Pills */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {/* Importance Score */}
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-500">Score</div>
                      <div className="text-base font-black text-slate-900 flex items-center justify-end gap-1">
                        <span className="text-blue-700">{decision.score}</span>
                        <span className="text-[10px] text-slate-400 font-normal">/100</span>
                      </div>
                    </div>

                    {/* Decision Badge */}
                    <div className="flex items-center gap-2">
                      {isScreen ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-blue-600 text-white shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse"></span>
                          SCREEN
                        </span>
                      ) : isMaybe ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-amber-100 text-amber-900 border border-amber-300">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          MAYBE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-red-100 text-red-800 border border-red-200">
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
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 transition-colors shadow-2xs"
                          title="Generate promo poster for this match"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>

                {/* Operations Footnote on Card */}
                {isScreen && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
                    <div className="flex items-center gap-3">
                      <span>👥 Expected: <strong className="text-blue-900">~{decision.staffPlan.expectedCrowd} fans</strong></span>
                      <span>👨‍🍳 Staff: <strong className="text-blue-900">{decision.staffPlan.staffCount} floor</strong></span>
                      <span>📦 Stock: <strong className="text-amber-800">{decision.stockPlan.level}</strong></span>
                    </div>
                    <span className="text-[11px] text-blue-700 font-bold group-hover:underline">
                      View score breakdown &rarr;
                    </span>
                  </div>
                )}

                {decision.forcedLateNightSkip && (
                  <div className="mt-2.5 text-[11px] text-red-900 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 font-medium">
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
