import React, { useState } from 'react';
import { Database, Search, Building2, CreditCard, History, HelpCircle, Tag, Check, CheckCircle2, XCircle } from 'lucide-react';
import {
  DB_01_PLANS,
  DB_02_VENUES,
  DB_03_SUBSCRIPTIONS,
  DB_04_PAST_SCREENINGS,
  DB_05_SUPPORT_TICKETS,
  type Venue,
} from '../data/simulatedDb.ts';

interface VenueDataTabProps {
  selectedVenue: Venue;
  onSelectVenue: (venue: Venue) => void;
}

export const VenueDataTab: React.FC<VenueDataTabProps> = ({
  selectedVenue,
  onSelectVenue,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'DB-02' | 'DB-01' | 'DB-03' | 'DB-04' | 'DB-05'>('DB-02');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Prominent Simulated Data Notice */}
      <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-amber-200 uppercase tracking-wide">
                Simulated Database Records
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Simulated Data
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tables DB-01 through DB-05 from <code>knowledge.md</code>. All venue and subscription data are fictional for testing FanFlow operations.
            </p>
          </div>
        </div>
      </div>

      {/* Sub-table navigation pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('DB-02')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'DB-02'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          DB-02 Venues (8 Outlets)
        </button>

        <button
          onClick={() => setActiveSubTab('DB-01')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'DB-01'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          DB-01 Pricing Plans (3 Tiers)
        </button>

        <button
          onClick={() => setActiveSubTab('DB-03')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'DB-03'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          DB-03 Subscriptions (8 Venues)
        </button>

        <button
          onClick={() => setActiveSubTab('DB-04')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'DB-04'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          DB-04 Past Screening Decisions
        </button>

        <button
          onClick={() => setActiveSubTab('DB-05')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'DB-05'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          DB-05 Support Tickets
        </button>
      </div>

      {/* DB-02: Venues Table */}
      {activeSubTab === 'DB-02' && (
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>[DB-02] Venues</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  Simulated data
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click "Set Active in Planner" to analyze match decisions for any venue.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-3">venue_id</th>
                  <th className="p-3">Venue</th>
                  <th className="p-3">Area</th>
                  <th className="p-3">Seats</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Fan Base</th>
                  <th className="p-3">Late-Night Licence (&gt;2 AM)</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {DB_02_VENUES.map(v => {
                  const isSelected = selectedVenue.venue_id === v.venue_id;
                  return (
                    <tr
                      key={v.venue_id}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-emerald-500/10' : ''
                      }`}
                    >
                      <td className="p-3 font-mono text-emerald-400 font-bold">{v.venue_id}</td>
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        {v.venue}
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-black">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="p-3">{v.area}</td>
                      <td className="p-3 font-semibold text-white">{v.seats}</td>
                      <td className="p-3">{v.type}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-300 border border-slate-700">
                          {v.fanBase}
                        </span>
                      </td>
                      <td className="p-3">
                        {v.lateNightLicence ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                            <XCircle className="w-3.5 h-3.5" /> No (Skip &gt;2am)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onSelectVenue(v)}
                          disabled={isSelected}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                              : 'bg-slate-700 hover:bg-emerald-600 text-white'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Set Active'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DB-01: Pricing Plans */}
      {activeSubTab === 'DB-01' && (
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>[DB-01] Pricing Plans</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                Simulated data
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Monthly subscription plans in SGD. Starter covers PL & CL; Pro & Group cover all 12 free-tier competitions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-3">plan_id</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Price (SGD/mo)</th>
                  <th className="p-3">Outlets</th>
                  <th className="p-3">Competitions</th>
                  <th className="p-3">Posters/wk</th>
                  <th className="p-3">Account Manager</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {DB_01_PLANS.map(p => (
                  <tr key={p.plan_id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-mono text-emerald-400 font-bold">{p.plan_id}</td>
                    <td className="p-3 font-bold text-white">{p.plan}</td>
                    <td className="p-3 text-emerald-400 font-bold text-sm">SGD {p.priceSGD}</td>
                    <td className="p-3">{p.outlets}</td>
                    <td className="p-3 text-slate-200">{p.competitions}</td>
                    <td className="p-3 font-semibold">{p.postersPerWeek}</td>
                    <td className="p-3">{p.accountManager}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DB-03: Subscriptions */}
      {activeSubTab === 'DB-03' && (
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>[DB-03] Subscriptions</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                Simulated data
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Active, paused, trial and cancelled subscriptions mapped to simulated venues.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-3">sub_id</th>
                  <th className="p-3">venue_id</th>
                  <th className="p-3">plan_id</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Billing Day</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {DB_03_SUBSCRIPTIONS.map(s => (
                  <tr key={s.sub_id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-mono text-emerald-400 font-bold">{s.sub_id}</td>
                    <td className="p-3 font-mono">{s.venue_id}</td>
                    <td className="p-3 font-mono font-bold text-white">{s.plan_id}</td>
                    <td className="p-3">{s.startDate}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        s.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : s.status === 'Paused'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : s.status === 'Trial'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3">{s.billingDay}</td>
                    <td className="p-3 text-slate-400">{s.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DB-04: Past Screenings */}
      {activeSubTab === 'DB-04' && (
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>[DB-04] Past Screening Decisions</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                Simulated data
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical sample weekend of 2026-09-26 to 2026-09-28 with actual attendance.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-3">screen_id</th>
                  <th className="p-3">venue_id</th>
                  <th className="p-3">Match</th>
                  <th className="p-3">Competition</th>
                  <th className="p-3">Kickoff (SGT)</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Decision</th>
                  <th className="p-3">Staff Planned</th>
                  <th className="p-3">Actual Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {DB_04_PAST_SCREENINGS.map(d => (
                  <tr key={d.screen_id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-mono text-emerald-400 font-bold">{d.screen_id}</td>
                    <td className="p-3 font-mono">{d.venue_id}</td>
                    <td className="p-3 font-bold text-white">{d.match}</td>
                    <td className="p-3">{d.competition}</td>
                    <td className="p-3 font-mono">{d.kickoffSGT}</td>
                    <td className="p-3 font-black text-emerald-400">{d.importanceScore}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        d.decision === 'Screen'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : d.decision === 'Maybe'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {d.decision}
                      </span>
                    </td>
                    <td className="p-3 font-semibold">{d.staffPlanned}</td>
                    <td className="p-3 font-bold text-white">{d.attendance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DB-05: Support Tickets */}
      {activeSubTab === 'DB-05' && (
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>[DB-05] Support Tickets</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                Simulated data
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical tickets handled by customer support and technical fixes.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-3">ticket_id</th>
                  <th className="p-3">venue_id</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Topic</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {DB_05_SUPPORT_TICKETS.map(t => (
                  <tr key={t.ticket_id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-mono text-emerald-400 font-bold">{t.ticket_id}</td>
                    <td className="p-3 font-mono">{t.venue_id}</td>
                    <td className="p-3">{t.date}</td>
                    <td className="p-3 font-semibold text-white">{t.topic}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        t.status === 'Resolved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : t.status === 'Open'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{t.resolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
