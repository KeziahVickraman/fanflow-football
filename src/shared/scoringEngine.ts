/**
 * FanFlow Scoring Engine
 * Implements RULE-01 through RULE-05 using SCORING_CONFIG.
 */

import { SCORING_CONFIG, KNOWN_RIVALRIES, CITY_CLUBS } from './scoringConfig.ts';
import type { Venue } from '../data/simulatedDb.ts';

export interface MatchTeam {
  id: number | string;
  name: string;
  shortName?: string;
  crest?: string;
  badgeUrl?: string; // from TheSportsDB
  position?: number; // league rank
}

export interface MatchFixture {
  id: string | number;
  utcDate: string; // ISO 8601 UTC date string
  status: string;  // SCHEDULED, TIMED, etc.
  competition: {
    id?: number;
    code: string; // PL, CL, etc.
    name: string;
    emblem?: string;
  };
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  venueName?: string;
}

export interface ScoreBreakdown {
  competitionWeight: { points: number; label: string; max: 30 };
  tableStakes: { points: number; label: string; max: 25 };
  positionGap: { points: number; gap: number; label: string; max: 15 };
  rivalry: { points: number; isRivalry: boolean; label: string; max: 15 };
  fanMatch: { points: number; matchedTeam?: string; label: string; max: 15 };
  rawTotal: number;
  cappedScore: number;
}

export interface MatchDecision {
  score: number;
  breakdown: ScoreBreakdown;
  decision: 'Screen' | 'Maybe' | 'Skip';
  forcedLateNightSkip: boolean;
  skipReason?: string;
  kickoffSGT: {
    utcDate: string;
    sgtDate: Date;
    formattedDate: string; // "Sat, 10 Oct"
    formattedTime: string; // "11:30 PM SGT"
    fullFormatted: string; // "Sat, 10 Oct · 11:30 PM SGT"
    dayName: string;       // "Saturday"
    dateKey: string;       // "2026-10-10"
    hourSGT: number;
    minuteSGT: number;
    isLateNightAfter2am: boolean;
  };
  staffPlan: {
    expectedCrowd: number;
    occupancyRate: number; // e.g. 0.70
    staffCount: number;
    formulaExplanation: string;
  };
  stockPlan: {
    level: string; // "High stock (150% of a normal night)"
    percentage: number; // 150, 125, 100, 0
    recommendation: string;
  };
}

/**
 * Converts UTC timestamp to SGT (Singapore Time, UTC+8)
 */
export function convertUtcToSGT(utcDateStr: string) {
  const d = new Date(utcDateStr);
  // SGT is UTC + 8 hours
  const sgtTimestamp = d.getTime() + (8 * 60 * 60 * 1000);
  const sgtDate = new Date(sgtTimestamp);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // UTC methods on sgtDate reflect SGT local time because we added 8h offset
  const dayName = fullDays[sgtDate.getUTCDay()];
  const shortDay = days[sgtDate.getUTCDay()];
  const dateNum = sgtDate.getUTCDate();
  const monthName = months[sgtDate.getUTCMonth()];
  const year = sgtDate.getUTCFullYear();
  const hour = sgtDate.getUTCHours();
  const minute = sgtDate.getUTCMinutes();

  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateKey = `${year}-${pad(sgtDate.getUTCMonth() + 1)}-${pad(dateNum)}`;

  // 12-hour format with AM/PM
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const timeFormatted = `${hour12}:${pad(minute)} ${period} SGT`;
  const formattedDate = `${shortDay}, ${dateNum} ${monthName}`;
  const fullFormatted = `${formattedDate} · ${timeFormatted}`;

  // After 2:00 am SGT (e.g. 02:00 up to 06:59)
  const isLateNightAfter2am = hour >= SCORING_CONFIG.lateNightCutoffHourSGT && hour < SCORING_CONFIG.lateNightEndHourSGT;

  return {
    utcDate: utcDateStr,
    sgtDate,
    formattedDate,
    formattedTime: timeFormatted,
    fullFormatted,
    dayName,
    dateKey,
    hourSGT: hour,
    minuteSGT: minute,
    isLateNightAfter2am,
  };
}

/**
 * Check if two teams are known rivals or share a city
 */
export function checkRivalryOrCityDerby(homeTeamName: string, awayTeamName: string): { isRivalry: boolean; label: string } {
  const norm = (s: string) => s.toLowerCase().trim();
  const h = norm(homeTeamName);
  const a = norm(awayTeamName);

  // Check direct rivalry pairs
  for (const [teamA, teamB] of KNOWN_RIVALRIES) {
    const nA = norm(teamA);
    const nB = norm(teamB);
    if ((h.includes(nA) || nA.includes(h)) && (a.includes(nB) || nB.includes(a))) {
      return { isRivalry: true, label: `Historic Rivalry: ${teamA} vs ${teamB}` };
    }
    if ((h.includes(nB) || nB.includes(h)) && (a.includes(nA) || nA.includes(a))) {
      return { isRivalry: true, label: `Historic Rivalry: ${teamB} vs ${teamA}` };
    }
  }

  // Check shared city
  for (const [city, teams] of Object.entries(CITY_CLUBS)) {
    const homeMatchesCity = teams.some(t => h.includes(norm(t)) || norm(t).includes(h));
    const awayMatchesCity = teams.some(t => a.includes(norm(t)) || norm(t).includes(a));
    if (homeMatchesCity && awayMatchesCity) {
      return { isRivalry: true, label: `${city} City Derby` };
    }
  }

  return { isRivalry: false, label: 'No historic rivalry detected' };
}

/**
 * Check if either team matches the venue's fan base
 */
export function checkFanMatch(homeTeamName: string, awayTeamName: string, venueFanBase: string): { matches: boolean; matchedTeam?: string } {
  if (!venueFanBase || venueFanBase.toLowerCase().includes('mixed')) {
    // If venue is Mixed, neutral matches don't get 15 pts unless explicitly named
  }
  const fanTeams = venueFanBase.split(',').map(s => s.trim().toLowerCase());
  const h = homeTeamName.toLowerCase();
  const a = awayTeamName.toLowerCase();

  for (const ft of fanTeams) {
    if (!ft || ft === 'mixed') continue;
    if (h.includes(ft) || ft.includes(h)) {
      return { matches: true, matchedTeam: homeTeamName };
    }
    if (a.includes(ft) || ft.includes(a)) {
      return { matches: true, matchedTeam: awayTeamName };
    }
  }

  return { matches: false };
}

/**
 * Calculates match score and operational staff/stock plan for a venue
 */
export function calculateMatchDecision(
  fixture: MatchFixture,
  venue: Venue,
  totalLeagueTeams: number = 20
): MatchDecision {
  const kickoffSGT = convertUtcToSGT(fixture.utcDate);

  // 1. Competition weight (10 to 30)
  const compCode = fixture.competition.code?.toUpperCase() || '';
  const compWeight = SCORING_CONFIG.competitionWeights[compCode] ?? SCORING_CONFIG.defaultCompetitionWeight;
  const compLabel = `${fixture.competition.name || compCode} (${compWeight} pts)`;

  // 2. Table stakes (0 to 25)
  // Both top 4: 25; one top 4: 15; bottom 3: 10; otherwise 5
  const homePos = fixture.homeTeam.position ?? 10;
  const awayPos = fixture.awayTeam.position ?? 10;
  const topThreshold = SCORING_CONFIG.tableStakes.topRankThreshold; // 4
  const bottomThreshold = totalLeagueTeams - SCORING_CONFIG.tableStakes.bottomRankCount + 1; // e.g. 18

  let tableStakesPts = SCORING_CONFIG.tableStakes.otherwise;
  let tableStakesLabel = 'Mid-table clash (5 pts)';

  const homeTop = homePos <= topThreshold;
  const awayTop = awayPos <= topThreshold;
  const homeBottom = homePos >= bottomThreshold;
  const awayBottom = awayPos >= bottomThreshold;

  if (homeTop && awayTop) {
    tableStakesPts = SCORING_CONFIG.tableStakes.bothTop4; // 25
    tableStakesLabel = `Both teams in Top 4 (#${homePos} vs #${awayPos}) (25 pts)`;
  } else if (homeTop || awayTop) {
    tableStakesPts = SCORING_CONFIG.tableStakes.oneTop4; // 15
    const topTeam = homeTop ? fixture.homeTeam.name : fixture.awayTeam.name;
    const pos = homeTop ? homePos : awayPos;
    tableStakesLabel = `Top 4 contender playing (${topTeam} #${pos}) (15 pts)`;
  } else if (homeBottom || awayBottom) {
    tableStakesPts = SCORING_CONFIG.tableStakes.bottom3; // 10
    tableStakesLabel = 'Relegation battle stakes (10 pts)';
  }

  // 3. Position gap (0 to 15)
  // 15 minus the gap in league position, minimum 0 (closer teams score higher)
  const gap = Math.abs(homePos - awayPos);
  const positionGapPts = Math.max(0, SCORING_CONFIG.positionGap.basePoints - gap);
  const positionGapLabel = `${gap} position gap (15 - ${gap} = ${positionGapPts} pts)`;

  // 4. Rivalry (0 or 15)
  const rivalryCheck = checkRivalryOrCityDerby(fixture.homeTeam.name, fixture.awayTeam.name);
  const rivalryPts = rivalryCheck.isRivalry ? SCORING_CONFIG.rivalryPoints : 0;

  // 5. Venue fan match (0 or 15)
  const fanCheck = checkFanMatch(fixture.homeTeam.name, fixture.awayTeam.name, venue.fanBase);
  const fanMatchPts = fanCheck.matches ? SCORING_CONFIG.venueFanMatchPoints : 0;
  const fanMatchLabel = fanCheck.matches
    ? `Matches venue fan base: ${venue.fanBase} (+15 pts)`
    : `No fan base match (${venue.fanBase}) (0 pts)`;

  // Calculate raw sum & cap at 100
  const rawTotal = compWeight + tableStakesPts + positionGapPts + rivalryPts + fanMatchPts;
  const cappedScore = Math.min(SCORING_CONFIG.maxScore, rawTotal);

  const breakdown: ScoreBreakdown = {
    competitionWeight: { points: compWeight, label: compLabel, max: 30 },
    tableStakes: { points: tableStakesPts, label: tableStakesLabel, max: 25 },
    positionGap: { points: positionGapPts, gap, label: positionGapLabel, max: 15 },
    rivalry: { points: rivalryPts, isRivalry: rivalryCheck.isRivalry, label: rivalryCheck.label, max: 15 },
    fanMatch: { points: fanMatchPts, matchedTeam: fanCheck.matchedTeam, label: fanMatchLabel, max: 15 },
    rawTotal,
    cappedScore,
  };

  // Screening decision (RULE-02)
  let baseDecision: 'Screen' | 'Maybe' | 'Skip';
  if (cappedScore >= SCORING_CONFIG.decisionThresholds.screenMin) {
    baseDecision = 'Screen';
  } else if (cappedScore >= SCORING_CONFIG.decisionThresholds.maybeMin) {
    baseDecision = 'Maybe';
  } else {
    baseDecision = 'Skip';
  }

  // Late-night licence rule:
  // "Always Skip if kickoff is after 2:00 am SGT and the venue has no late-night licence (DB-02), whatever the score."
  let forcedLateNightSkip = false;
  let finalDecision = baseDecision;
  let skipReason: string | undefined;

  if (kickoffSGT.isLateNightAfter2am && !venue.lateNightLicence) {
    forcedLateNightSkip = true;
    finalDecision = 'Skip';
    skipReason = `Kickoff is at ${kickoffSGT.formattedTime} (after 2:00 AM SGT). ${venue.venue} has no late-night licence.`;
  } else if (baseDecision === 'Skip') {
    skipReason = `Score of ${cappedScore} is below minimum screening threshold of 55.`;
  }

  // Staff plan (RULE-03)
  // Expected crowd = seats × occupancy, where occupancy is:
  // 90% for scores 85 and above, 70% for 75 to 84, and 40% for Maybe.
  // Staff = expected crowd ÷ 20, rounded up, with a minimum of 2.
  let occupancyRate = 0;
  if (finalDecision === 'Skip') {
    occupancyRate = 0;
  } else if (cappedScore >= SCORING_CONFIG.staffConfig.occupancyTier1MinScore) {
    occupancyRate = SCORING_CONFIG.staffConfig.occupancyTier1Rate; // 0.90
  } else if (cappedScore >= SCORING_CONFIG.staffConfig.occupancyTier2MinScore) {
    occupancyRate = SCORING_CONFIG.staffConfig.occupancyTier2Rate; // 0.70
  } else if (finalDecision === 'Maybe') {
    occupancyRate = SCORING_CONFIG.staffConfig.occupancyMaybeRate; // 0.40
  }

  const expectedCrowd = Math.round(venue.seats * occupancyRate);
  let staffCount = 0;
  let formulaExplanation = '';

  if (finalDecision === 'Skip') {
    staffCount = 0;
    formulaExplanation = 'No staff scheduled for skipped matches';
  } else {
    staffCount = Math.max(
      SCORING_CONFIG.staffConfig.minStaff,
      Math.ceil(expectedCrowd / SCORING_CONFIG.staffConfig.crowdPerStaff)
    );
    formulaExplanation = `${venue.seats} seats × ${(occupancyRate * 100)}% = ${expectedCrowd} crowd ÷ 20 (min ${SCORING_CONFIG.staffConfig.minStaff}) = ${staffCount} staff`;
  }

  // Stock plan (RULE-04)
  // High stock (150% of a normal night) for scores 85 and above.
  // Normal plus 25% for scores 75 to 84.
  // Normal stock for Maybe; no extra order for Skip.
  let stockLevel = '';
  let stockPercentage = 0;
  let stockRecommendation = '';

  if (finalDecision === 'Skip') {
    stockLevel = 'No extra order';
    stockPercentage = 0;
    stockRecommendation = 'Do not order extra stock for this match';
  } else if (cappedScore >= SCORING_CONFIG.stockConfig.highStockMinScore) {
    stockLevel = 'High stock (150%)';
    stockPercentage = 150;
    stockRecommendation = 'High stock (150% of a normal night) — heavy kegs, bottled beers and bar snacks prep';
  } else if (cappedScore >= SCORING_CONFIG.stockConfig.mediumStockMinScore) {
    stockLevel = 'Normal + 25%';
    stockPercentage = 125;
    stockRecommendation = 'Normal plus 25% buffer on top draught lines and fast food';
  } else {
    stockLevel = 'Normal stock (100%)';
    stockPercentage = 100;
    stockRecommendation = 'Normal stock — standard weekend inventory';
  }

  return {
    score: cappedScore,
    breakdown,
    decision: finalDecision,
    forcedLateNightSkip,
    skipReason,
    kickoffSGT,
    staffPlan: {
      expectedCrowd,
      occupancyRate,
      staffCount,
      formulaExplanation,
    },
    stockPlan: {
      level: stockLevel,
      percentage: stockPercentage,
      recommendation: stockRecommendation,
    },
  };
}
