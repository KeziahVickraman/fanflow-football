/**
 * Simulated Database (DB-01 to DB-05) from knowledge.md
 * Clearly labelled as simulated data for class prototype.
 */

export interface PricingPlan {
  plan_id: string;
  plan: string;
  priceSGD: number;
  outlets: string;
  competitions: string;
  postersPerWeek: number;
  accountManager: string;
}

export interface Venue {
  venue_id: string;
  venue: string;
  area: string;
  seats: number;
  type: string;
  fanBase: string; // e.g. "Arsenal, Liverpool"
  lateNightLicence: boolean; // after 2 am
}

export interface Subscription {
  sub_id: string;
  venue_id: string;
  plan_id: string;
  startDate: string;
  status: 'Active' | 'Paused' | 'Trial' | 'Cancelled';
  billingDay: string;
  notes: string;
}

export interface PastScreening {
  screen_id: string;
  venue_id: string;
  match: string;
  competition: string;
  kickoffSGT: string;
  importanceScore: number;
  decision: 'Screen' | 'Maybe' | 'Skip';
  staffPlanned: number;
  attendance: number;
}

export interface SupportTicket {
  ticket_id: string;
  venue_id: string;
  date: string;
  topic: string;
  status: 'Open' | 'Resolved' | 'Closed';
  resolution: string;
}

export const DB_01_PLANS: PricingPlan[] = [
  {
    plan_id: 'P-01',
    plan: 'Starter',
    priceSGD: 39,
    outlets: '1',
    competitions: 'Premier League, Champions League',
    postersPerWeek: 3,
    accountManager: 'No',
  },
  {
    plan_id: 'P-02',
    plan: 'Pro',
    priceSGD: 89,
    outlets: '1',
    competitions: 'All 12 free-tier competitions',
    postersPerWeek: 10,
    accountManager: 'Yes, monthly call',
  },
  {
    plan_id: 'P-03',
    plan: 'Group',
    priceSGD: 249,
    outlets: 'Up to 5',
    competitions: 'All 12 free-tier competitions',
    postersPerWeek: 30,
    accountManager: 'Yes, monthly call',
  },
];

export const DB_02_VENUES: Venue[] = [
  {
    venue_id: 'V-001',
    venue: 'The Red Corner Pub',
    area: 'Clarke Quay',
    seats: 120,
    type: 'Sports bar',
    fanBase: 'Arsenal, Liverpool',
    lateNightLicence: true,
  },
  {
    venue_id: 'V-002',
    venue: 'Kopi & Kickoff',
    area: 'Tampines',
    seats: 60,
    type: '24-hour cafe',
    fanBase: 'Manchester United',
    lateNightLicence: true,
  },
  {
    venue_id: 'V-003',
    venue: 'Boat Quay Taps',
    area: 'Boat Quay',
    seats: 90,
    type: 'Pub',
    fanBase: 'Mixed, Champions League',
    lateNightLicence: false,
  },
  {
    venue_id: 'V-004',
    venue: 'Holland Halftime',
    area: 'Holland Village',
    seats: 75,
    type: 'Sports bar',
    fanBase: 'Chelsea, Tottenham',
    lateNightLicence: false,
  },
  {
    venue_id: 'V-005',
    venue: 'Prata Pitch',
    area: 'Bedok',
    seats: 50,
    type: '24-hour cafe',
    fanBase: 'Mixed',
    lateNightLicence: true,
  },
  {
    venue_id: 'V-006',
    venue: 'Robertson Rovers Bar',
    area: 'Robertson Quay',
    seats: 140,
    type: 'Sports bar',
    fanBase: 'Liverpool, Real Madrid',
    lateNightLicence: true,
  },
  {
    venue_id: 'V-007',
    venue: 'Jurong Goal Post',
    area: 'Jurong East',
    seats: 45,
    type: 'Cafe',
    fanBase: 'Manchester City',
    lateNightLicence: false,
  },
  {
    venue_id: 'V-008',
    venue: 'The Offside Trap',
    area: 'Tanjong Pagar',
    seats: 100,
    type: 'Pub',
    fanBase: 'Barcelona, Bayern',
    lateNightLicence: true,
  },
];

export const DB_03_SUBSCRIPTIONS: Subscription[] = [
  {
    sub_id: 'S-101',
    venue_id: 'V-001',
    plan_id: 'P-02',
    startDate: '2026-03-01',
    status: 'Active',
    billingDay: '1st',
    notes: 'Renewed twice',
  },
  {
    sub_id: 'S-102',
    venue_id: 'V-002',
    plan_id: 'P-01',
    startDate: '2026-06-15',
    status: 'Active',
    billingDay: '15th',
    notes: 'Asked about Pro upgrade',
  },
  {
    sub_id: 'S-103',
    venue_id: 'V-003',
    plan_id: 'P-02',
    startDate: '2026-01-10',
    status: 'Paused',
    billingDay: '10th',
    notes: 'Paused for renovation until 2026-11-01',
  },
  {
    sub_id: 'S-104',
    venue_id: 'V-004',
    plan_id: 'P-01',
    startDate: '2026-08-01',
    status: 'Trial',
    billingDay: '1st',
    notes: '14-day trial ends 2026-08-15, converted',
  },
  {
    sub_id: 'S-105',
    venue_id: 'V-005',
    plan_id: 'P-01',
    startDate: '2026-05-20',
    status: 'Cancelled',
    billingDay: '20th',
    notes: 'Cancelled 2026-09-20, too few late matches',
  },
  {
    sub_id: 'S-106',
    venue_id: 'V-006',
    plan_id: 'P-03',
    startDate: '2025-11-01',
    status: 'Active',
    billingDay: '1st',
    notes: 'Group of 3 outlets',
  },
  {
    sub_id: 'S-107',
    venue_id: 'V-007',
    plan_id: 'P-01',
    startDate: '2026-09-01',
    status: 'Active',
    billingDay: '1st',
    notes: 'New customer',
  },
  {
    sub_id: 'S-108',
    venue_id: 'V-008',
    plan_id: 'P-02',
    startDate: '2026-02-14',
    status: 'Active',
    billingDay: '14th',
    notes: 'Wants Bundesliga focus',
  },
];

export const DB_04_PAST_SCREENINGS: PastScreening[] = [
  {
    screen_id: 'D-501',
    venue_id: 'V-001',
    match: 'Arsenal vs Liverpool',
    competition: 'Premier League',
    kickoffSGT: 'Sat 11:30 pm',
    importanceScore: 88,
    decision: 'Screen',
    staffPlanned: 6,
    attendance: 112,
  },
  {
    screen_id: 'D-502',
    venue_id: 'V-002',
    match: 'Manchester United vs Everton',
    competition: 'Premier League',
    kickoffSGT: 'Sat 10:00 pm',
    importanceScore: 61,
    decision: 'Screen',
    staffPlanned: 3,
    attendance: 41,
  },
  {
    screen_id: 'D-503',
    venue_id: 'V-004',
    match: 'Chelsea vs Tottenham',
    competition: 'Premier League',
    kickoffSGT: 'Sun 11:30 pm',
    importanceScore: 79,
    decision: 'Screen',
    staffPlanned: 4,
    attendance: 70,
  },
  {
    screen_id: 'D-504',
    venue_id: 'V-006',
    match: 'Real Madrid vs Atletico Madrid',
    competition: 'La Liga',
    kickoffSGT: 'Sun 3:00 am',
    importanceScore: 84,
    decision: 'Screen',
    staffPlanned: 5,
    attendance: 96,
  },
  {
    screen_id: 'D-505',
    venue_id: 'V-007',
    match: 'Manchester City vs Brentford',
    competition: 'Premier League',
    kickoffSGT: 'Sat 10:00 pm',
    importanceScore: 52,
    decision: 'Maybe',
    staffPlanned: 2,
    attendance: 18,
  },
  {
    screen_id: 'D-506',
    venue_id: 'V-008',
    match: 'Bayern Munich vs Dortmund',
    competition: 'Bundesliga',
    kickoffSGT: 'Sun 12:30 am',
    importanceScore: 86,
    decision: 'Screen',
    staffPlanned: 5,
    attendance: 88,
  },
  {
    screen_id: 'D-507',
    venue_id: 'V-003',
    match: 'Porto vs Benfica',
    competition: 'Primeira Liga',
    kickoffSGT: 'Mon 3:15 am',
    importanceScore: 70,
    decision: 'Skip',
    staffPlanned: 0,
    attendance: 0,
  },
];

export const DB_05_SUPPORT_TICKETS: SupportTicket[] = [
  {
    ticket_id: 'T-901',
    venue_id: 'V-008',
    date: '2026-10-02',
    topic: 'Kickoff time shown in UK time, not SGT',
    status: 'Resolved',
    resolution: 'Fixed; app now converts the API\'s UTC time to SGT',
  },
  {
    ticket_id: 'T-902',
    venue_id: 'V-002',
    date: '2026-09-28',
    topic: 'How to upgrade to Pro',
    status: 'Open',
    resolution: 'Waiting for owner to confirm billing day',
  },
  {
    ticket_id: 'T-903',
    venue_id: 'V-005',
    date: '2026-09-19',
    topic: 'Cancel subscription',
    status: 'Closed',
    resolution: 'Cancelled at end of billing cycle, no refund due',
  },
  {
    ticket_id: 'T-904',
    venue_id: 'V-001',
    date: '2026-09-12',
    topic: 'Poster badge missing for promoted team',
    status: 'Resolved',
    resolution: 'Badge fetched from TheSportsDB by team ID',
  },
];
