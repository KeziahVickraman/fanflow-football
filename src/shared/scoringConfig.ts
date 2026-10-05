/**
 * FanFlow Scoring & Decision Configuration
 * Implements RULE-01 to RULE-04 exactly as specified in knowledge.md.
 * All weights, thresholds, and operational rules are centralized here.
 */

export interface ScoringConfig {
  // RULE-01: Competition weight (10 to 30)
  competitionWeights: Record<string, number>;
  defaultCompetitionWeight: number;

  // RULE-01: Table stakes (0 to 25)
  tableStakes: {
    bothTop4: number;      // 25 pts: Both teams in the top 4
    oneTop4: number;       // 15 pts: One team in the top 4
    bottom3: number;       // 10 pts: Either team in the bottom 3
    otherwise: number;     // 5 pts: Otherwise
    topRankThreshold: number; // 4
    bottomRankCount: number;  // 3
  };

  // RULE-01: Position gap (0 to 15)
  positionGap: {
    basePoints: number; // 15 minus the gap in league position, minimum 0
  };

  // RULE-01: Rivalry (0 or 15)
  rivalryPoints: number; // 15 if on rivalry list or both teams share a city

  // RULE-01: Venue fan match (0 or 15)
  venueFanMatchPoints: number; // 15 if either team is in the venue's fan base (DB-02)

  // RULE-01: Cap
  maxScore: number; // 100

  // RULE-02: Screening decision thresholds
  decisionThresholds: {
    screenMin: number; // 75 or more -> Screen
    maybeMin: number;  // 55 to 74 -> Maybe
    // below 55 -> Skip
  };

  // RULE-02: Late-night licence rule
  lateNightCutoffHourSGT: number; // 2 (after 2:00 am SGT, i.e. >= 02:00 up to < 07:00)
  lateNightEndHourSGT: number;   // 7

  // RULE-03: Staff plan
  staffConfig: {
    occupancyTier1MinScore: number; // 85 -> 90%
    occupancyTier1Rate: number;     // 0.90
    occupancyTier2MinScore: number; // 75 -> 70%
    occupancyTier2Rate: number;     // 0.70
    occupancyMaybeRate: number;     // 0.40
    occupancySkipRate: number;      // 0.00
    crowdPerStaff: number;          // Expected crowd ÷ 20, rounded up
    minStaff: number;               // minimum of 2
  };

  // RULE-04: Stock plan
  stockConfig: {
    highStockMinScore: number;      // 85 -> High stock (150% of a normal night)
    mediumStockMinScore: number;    // 75 -> Normal plus 25% (125%)
    // 55 to 74 -> Normal stock (100%)
    // below 55 -> No extra order for Skip
  };
}

export const SCORING_CONFIG: ScoringConfig = {
  competitionWeights: {
    CL: 30,  // UEFA Champions League
    PL: 25,  // Premier League
    PD: 20,  // La Liga (Primera Division)
    BL1: 20, // Bundesliga
    SA: 20,  // Serie A
    FL1: 10, // Ligue 1
    ELC: 10, // Championship
    DED: 10, // Eredivisie
    PPL: 10, // Primeira Liga
    BSA: 10, // Brasileirao
    WC: 30,  // World Cup
    EC: 30,  // European Championships
  },
  defaultCompetitionWeight: 10, // other free-tier leagues: 10

  tableStakes: {
    bothTop4: 25,
    oneTop4: 15,
    bottom3: 10,
    otherwise: 5,
    topRankThreshold: 4,
    bottomRankCount: 3,
  },

  positionGap: {
    basePoints: 15,
  },

  rivalryPoints: 15,

  venueFanMatchPoints: 15,

  maxScore: 100,

  decisionThresholds: {
    screenMin: 75,
    maybeMin: 55,
  },

  lateNightCutoffHourSGT: 2, // matches kicking off from 2:00 AM to 6:59 AM SGT
  lateNightEndHourSGT: 7,

  staffConfig: {
    occupancyTier1MinScore: 85,
    occupancyTier1Rate: 0.90,
    occupancyTier2MinScore: 75,
    occupancyTier2Rate: 0.70,
    occupancyMaybeRate: 0.40,
    occupancySkipRate: 0.00,
    crowdPerStaff: 20,
    minStaff: 2,
  },

  stockConfig: {
    highStockMinScore: 85,
    mediumStockMinScore: 75,
  },
};

/**
 * Common European football rivalries & city derbies for RULE-01
 */
export const KNOWN_RIVALRIES: [string, string][] = [
  // Premier League & England
  ['Arsenal', 'Tottenham Hotspur'],
  ['Arsenal', 'Chelsea'],
  ['Manchester United', 'Liverpool'],
  ['Manchester United', 'Manchester City'],
  ['Liverpool', 'Everton'],
  ['Newcastle United', 'Sunderland'],
  // Spain
  ['Real Madrid', 'FC Barcelona'],
  ['Real Madrid', 'Atlético de Madrid'],
  ['Real Betis', 'Sevilla FC'],
  // Germany
  ['FC Bayern München', 'Borussia Dortmund'],
  ['Borussia Dortmund', 'FC Schalke 04'],
  // Italy
  ['FC Internazionale Milano', 'AC Milan'],
  ['Juventus FC', 'FC Internazionale Milano'],
  ['AS Roma', 'SS Lazio'],
  // Champions League & Historic European clashes
  ['Real Madrid', 'FC Bayern München'],
  ['Liverpool', 'Real Madrid'],
  ['FC Barcelona', 'Paris Saint-Germain FC'],
  ['Chelsea', 'FC Barcelona'],
];

/**
 * Shared city clubs for city derby detection
 */
export const CITY_CLUBS: Record<string, string[]> = {
  London: ['Arsenal', 'Chelsea', 'Tottenham Hotspur', 'West Ham United', 'Fulham', 'Crystal Palace', 'Brentford'],
  Manchester: ['Manchester City', 'Manchester United'],
  Liverpool: ['Liverpool', 'Everton'],
  Madrid: ['Real Madrid', 'Atlético de Madrid', 'Rayo Vallecano', 'Getafe'],
  Milan: ['AC Milan', 'FC Internazionale Milano'],
  Rome: ['AS Roma', 'SS Lazio'],
  Barcelona: ['FC Barcelona', 'RCD Espanyol'],
  Turin: ['Juventus FC', 'Torino FC'],
  Munich: ['FC Bayern München', 'TSV 1860 München'],
  Seville: ['Sevilla FC', 'Real Betis'],
  Lisbon: ['SL Benfica', 'Sporting CP'],
  Porto: ['FC Porto', 'Boavista FC'],
};
