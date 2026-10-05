/**
 * Fallback fixtures & standings for European competitions
 * Used when FOOTBALL_DATA_TOKEN is not provided, is invalid (403), or offline.
 * Covers the next 7 days (October 2026) with accurate team names, standings, and badges.
 */

import type { MatchFixture } from '../shared/scoringEngine.ts';

export const FALLBACK_STANDINGS: Record<string, { position: number; teamId: number; name: string }[]> = {
  PL: [
    { position: 1, teamId: 57, name: 'Arsenal FC' },
    { position: 2, teamId: 64, name: 'Liverpool FC' },
    { position: 3, teamId: 65, name: 'Manchester City FC' },
    { position: 4, teamId: 61, name: 'Chelsea FC' },
    { position: 5, teamId: 73, name: 'Tottenham Hotspur FC' },
    { position: 6, teamId: 58, name: 'Aston Villa FC' },
    { position: 7, teamId: 67, name: 'Newcastle United FC' },
    { position: 8, teamId: 66, name: 'Manchester United FC' },
    { position: 9, teamId: 354, name: 'Crystal Palace FC' },
    { position: 10, teamId: 397, name: 'Brighton & Hove Albion FC' },
    { position: 11, teamId: 63, name: 'Fulham FC' },
    { position: 12, teamId: 402, name: 'Brentford FC' },
    { position: 13, teamId: 563, name: 'West Ham United FC' },
    { position: 14, teamId: 62, name: 'Everton FC' },
    { position: 15, teamId: 1044, name: 'AFC Bournemouth' },
    { position: 16, teamId: 351, name: 'Nottingham Forest FC' },
    { position: 17, teamId: 76, name: 'Wolverhampton Wanderers FC' },
    { position: 18, teamId: 349, name: 'Ipswich Town FC' },
    { position: 19, teamId: 338, name: 'Leicester City FC' },
    { position: 20, teamId: 340, name: 'Southampton FC' },
  ],
  CL: [
    { position: 1, teamId: 86, name: 'Real Madrid CF' },
    { position: 2, teamId: 57, name: 'Arsenal FC' },
    { position: 3, teamId: 5, name: 'FC Bayern München' },
    { position: 4, teamId: 64, name: 'Liverpool FC' },
    { position: 5, teamId: 81, name: 'FC Barcelona' },
    { position: 6, teamId: 108, name: 'FC Internazionale Milano' },
    { position: 7, teamId: 4, name: 'Borussia Dortmund' },
    { position: 8, teamId: 78, name: 'Atlético de Madrid' },
    { position: 9, teamId: 524, name: 'Paris Saint-Germain FC' },
    { position: 10, teamId: 98, name: 'AC Milan' },
    { position: 11, teamId: 109, name: 'Juventus FC' },
    { position: 12, teamId: 503, name: 'FC Porto' },
  ],
  PD: [
    { position: 1, teamId: 81, name: 'FC Barcelona' },
    { position: 2, teamId: 86, name: 'Real Madrid CF' },
    { position: 3, teamId: 78, name: 'Atlético de Madrid' },
    { position: 4, teamId: 77, name: 'Athletic Club' },
    { position: 5, teamId: 92, name: 'Real Sociedad' },
    { position: 6, teamId: 90, name: 'Real Betis Balompié' },
    { position: 7, teamId: 94, name: 'Villarreal CF' },
    { position: 8, teamId: 559, name: 'Sevilla FC' },
  ],
  BL1: [
    { position: 1, teamId: 5, name: 'FC Bayern München' },
    { position: 2, teamId: 721, name: 'RB Leipzig' },
    { position: 3, teamId: 3, name: 'Bayer 04 Leverkusen' },
    { position: 4, teamId: 4, name: 'Borussia Dortmund' },
    { position: 5, teamId: 11, name: 'VfL Wolfsburg' },
    { position: 6, teamId: 19, name: 'Eintracht Frankfurt' },
  ],
  SA: [
    { position: 1, teamId: 108, name: 'FC Internazionale Milano' },
    { position: 2, teamId: 109, name: 'Juventus FC' },
    { position: 3, teamId: 98, name: 'AC Milan' },
    { position: 4, teamId: 113, name: 'SSC Napoli' },
    { position: 5, teamId: 100, name: 'AS Roma' },
    { position: 6, teamId: 110, name: 'SS Lazio' },
  ],
};

export const FALLBACK_FIXTURES: MatchFixture[] = [
  // 1. Champions League Super Clash (Late night 3:00 AM SGT)
  {
    id: 'CL-101',
    utcDate: '2026-10-06T19:00:00Z', // SGT: Wed 7 Oct 03:00 AM
    status: 'SCHEDULED',
    competition: {
      id: 2001,
      code: 'CL',
      name: 'UEFA Champions League',
      emblem: 'https://crests.football-data.org/CL.png',
    },
    homeTeam: {
      id: 86,
      name: 'Real Madrid CF',
      shortName: 'Real Madrid',
      crest: 'https://crests.football-data.org/86.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/8yxj8f1618765275.png',
      position: 1,
    },
    awayTeam: {
      id: 5,
      name: 'FC Bayern München',
      shortName: 'Bayern Munich',
      crest: 'https://crests.football-data.org/5.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/0j5f3k1618765363.png',
      position: 3,
    },
    venueName: 'Santiago Bernabéu',
  },

  // 2. Champions League: Arsenal vs Paris Saint-Germain (Late night 3:00 AM SGT)
  {
    id: 'CL-102',
    utcDate: '2026-10-07T19:00:00Z', // SGT: Thu 8 Oct 03:00 AM
    status: 'SCHEDULED',
    competition: {
      id: 2001,
      code: 'CL',
      name: 'UEFA Champions League',
      emblem: 'https://crests.football-data.org/CL.png',
    },
    homeTeam: {
      id: 57,
      name: 'Arsenal FC',
      shortName: 'Arsenal',
      crest: 'https://crests.football-data.org/57.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png',
      position: 2,
    },
    awayTeam: {
      id: 524,
      name: 'Paris Saint-Germain FC',
      shortName: 'PSG',
      crest: 'https://crests.football-data.org/524.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/rwqrrq1473504808.png',
      position: 9,
    },
    venueName: 'Emirates Stadium',
  },

  // 3. Premier League: Arsenal vs Liverpool (Prime Weekend Evening 11:30 PM SGT)
  {
    id: 'PL-201',
    utcDate: '2026-10-10T15:30:00Z', // SGT: Sat 10 Oct 11:30 PM
    status: 'SCHEDULED',
    competition: {
      id: 2021,
      code: 'PL',
      name: 'Premier League',
      emblem: 'https://crests.football-data.org/PL.png',
    },
    homeTeam: {
      id: 57,
      name: 'Arsenal FC',
      shortName: 'Arsenal',
      crest: 'https://crests.football-data.org/57.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png',
      position: 1,
    },
    awayTeam: {
      id: 64,
      name: 'Liverpool FC',
      shortName: 'Liverpool',
      crest: 'https://crests.football-data.org/64.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/c8hd4k1679946440.png',
      position: 2,
    },
    venueName: 'Emirates Stadium',
  },

  // 4. Premier League: Manchester United vs Everton (Prime Evening 10:00 PM SGT)
  {
    id: 'PL-202',
    utcDate: '2026-10-10T14:00:00Z', // SGT: Sat 10 Oct 10:00 PM
    status: 'SCHEDULED',
    competition: {
      id: 2021,
      code: 'PL',
      name: 'Premier League',
      emblem: 'https://crests.football-data.org/PL.png',
    },
    homeTeam: {
      id: 66,
      name: 'Manchester United FC',
      shortName: 'Man United',
      crest: 'https://crests.football-data.org/66.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/xzqwwr1421438796.png',
      position: 8,
    },
    awayTeam: {
      id: 62,
      name: 'Everton FC',
      shortName: 'Everton',
      crest: 'https://crests.football-data.org/62.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/qswuvx1473502846.png',
      position: 14,
    },
    venueName: 'Old Trafford',
  },

  // 5. Premier League: Chelsea vs Tottenham Hotspur (London Derby! Sun 11:30 PM SGT)
  {
    id: 'PL-203',
    utcDate: '2026-10-11T15:30:00Z', // SGT: Sun 11 Oct 11:30 PM
    status: 'SCHEDULED',
    competition: {
      id: 2021,
      code: 'PL',
      name: 'Premier League',
      emblem: 'https://crests.football-data.org/PL.png',
    },
    homeTeam: {
      id: 61,
      name: 'Chelsea FC',
      shortName: 'Chelsea',
      crest: 'https://crests.football-data.org/61.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/7v9wvv1618765416.png',
      position: 4,
    },
    awayTeam: {
      id: 73,
      name: 'Tottenham Hotspur FC',
      shortName: 'Tottenham',
      crest: 'https://crests.football-data.org/73.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/057fcu1522067784.png',
      position: 5,
    },
    venueName: 'Stamford Bridge',
  },

  // 6. Premier League: Manchester City vs Brentford (Sat 7:30 PM SGT early kickoff)
  {
    id: 'PL-204',
    utcDate: '2026-10-10T11:30:00Z', // SGT: Sat 10 Oct 07:30 PM
    status: 'SCHEDULED',
    competition: {
      id: 2021,
      code: 'PL',
      name: 'Premier League',
      emblem: 'https://crests.football-data.org/PL.png',
    },
    homeTeam: {
      id: 65,
      name: 'Manchester City FC',
      shortName: 'Man City',
      crest: 'https://crests.football-data.org/65.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png',
      position: 3,
    },
    awayTeam: {
      id: 402,
      name: 'Brentford FC',
      shortName: 'Brentford',
      crest: 'https://crests.football-data.org/402.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/7xecy01627993070.png',
      position: 12,
    },
    venueName: 'Etihad Stadium',
  },

  // 7. La Liga: Real Madrid vs Atlético Madrid (Madrid Derby! Sun 3:00 AM SGT)
  {
    id: 'PD-301',
    utcDate: '2026-10-11T19:00:00Z', // SGT: Mon 12 Oct 03:00 AM
    status: 'SCHEDULED',
    competition: {
      id: 2014,
      code: 'PD',
      name: 'La Liga',
      emblem: 'https://crests.football-data.org/PD.png',
    },
    homeTeam: {
      id: 86,
      name: 'Real Madrid CF',
      shortName: 'Real Madrid',
      crest: 'https://crests.football-data.org/86.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/8yxj8f1618765275.png',
      position: 2,
    },
    awayTeam: {
      id: 78,
      name: 'Atlético de Madrid',
      shortName: 'Atlético',
      crest: 'https://crests.football-data.org/78.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/s4l0j61522067784.png',
      position: 3,
    },
    venueName: 'Santiago Bernabéu',
  },

  // 8. Bundesliga: Bayern Munich vs Borussia Dortmund (Der Klassiker! Sun 12:30 AM SGT)
  {
    id: 'BL1-401',
    utcDate: '2026-10-10T16:30:00Z', // SGT: Sun 11 Oct 12:30 AM
    status: 'SCHEDULED',
    competition: {
      id: 2002,
      code: 'BL1',
      name: 'Bundesliga',
      emblem: 'https://crests.football-data.org/BL1.png',
    },
    homeTeam: {
      id: 5,
      name: 'FC Bayern München',
      shortName: 'Bayern Munich',
      crest: 'https://crests.football-data.org/5.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/0j5f3k1618765363.png',
      position: 1,
    },
    awayTeam: {
      id: 4,
      name: 'Borussia Dortmund',
      shortName: 'Dortmund',
      crest: 'https://crests.football-data.org/4.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/8f5y1n1618765416.png',
      position: 4,
    },
    venueName: 'Allianz Arena',
  },

  // 9. Primeira Liga: Porto vs Benfica (Mon 3:15 AM SGT)
  {
    id: 'PPL-501',
    utcDate: '2026-10-11T19:15:00Z', // SGT: Mon 12 Oct 03:15 AM
    status: 'SCHEDULED',
    competition: {
      id: 2017,
      code: 'PPL',
      name: 'Primeira Liga',
      emblem: 'https://crests.football-data.org/PPL.png',
    },
    homeTeam: {
      id: 503,
      name: 'FC Porto',
      shortName: 'Porto',
      crest: 'https://crests.football-data.org/503.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/xpyutv1421438796.png',
      position: 2,
    },
    awayTeam: {
      id: 1903,
      name: 'Sport Lisboa e Benfica',
      shortName: 'Benfica',
      crest: 'https://crests.football-data.org/1903.png',
      badgeUrl: 'https://www.thesportsdb.com/images/media/team/badge/t06u7b1534002678.png',
      position: 3,
    },
    venueName: 'Estádio do Dragão',
  },
];
