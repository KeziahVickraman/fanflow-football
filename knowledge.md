# FanFlow — Business Model Canvas & Simulated Database (RAG Knowledge Base)

Oct 5, 2026 · @Keziah Vickraman

## How to use this document for RAG

Every retrievable fact sits in a chunk with a unique ID in square brackets, so the app can split on headings and cite the chunk it used. All business data here is simulated for a class prototype; live match data comes only from the two APIs.

- Split into chunks at every `##` and `###` heading. Each chunk keeps its heading as the first line.
- Chunk IDs use the pattern `[AREA-NN]`: `OVR` overview, `BMC` canvas, `DB` simulated tables, `RULE` decision logic, `FAQ` questions and policies, `API` field dictionary.
- Each table row starts with its own record ID (for example `V-003`), so a single row can be retrieved and quoted.
- Metadata to store per chunk: `chunk_id`, `section`, `last_updated` = 2026-10-05, `source` = simulated or API.
- Answers from the assistant must cite chunk IDs and must never invent prices, customers or match data not found in a chunk or an API response.

## Product and service overview

### [OVR-01] What FanFlow is

FanFlow tells sports bars and cafes in Singapore which European football matches to screen each week, and how to staff and stock for them. It combines a software product (a weekly screening planner) with a service (auto-made promo posters and a match-night playbook).

### [OVR-02] The problem

European matches kick off between 7:30 pm and 4 am Singapore time. Venues guess which late games will fill seats, so they overstaff quiet nights and understock big ones. Owners spend about 3 hours a week checking fixtures and making social posts by hand.

### [OVR-03] Product: the weekly screening planner

- Pulls the next 7 days of fixtures for the free-tier competitions and converts kickoff times to Singapore time (SGT, UTC+8).
- Scores each match for importance using league table positions, then recommends Screen, Maybe or Skip per venue.
- Suggests staff count and stock level for each screened match.

### [OVR-04] Service: promo and playbook

- Generates a promo poster for each screened match using both team badges.
- Sends a match-night playbook: kickoff time, expected crowd level, staff and stock suggestion.
- Pro and Group plans add a monthly review call with a FanFlow account manager.

### [OVR-05] Data sources

| Source | Used for | Credential | Free limit |
| --- | --- | --- | --- |
| football-data.org API v4 | Fixtures, results, standings for 12 competitions | Header `X-Auth-Token` (free key) | 10 requests per minute |
| TheSportsDB v1 | Team badges, stadium names, team descriptions | Key `123` in the URL path | 30 requests per minute; searches return 1 result |

Scores on the football-data.org free plan are delayed, so FanFlow plans ahead and never claims to show live scores.

## Business Model Canvas

FanFlow earns monthly subscriptions from venues that screen football, and keeps costs low by building on two free sports APIs.

### [BMC-01] Customer segments

- Primary: independent sports bars and pubs in Singapore with 40 to 150 seats (Clarke Quay, Boat Quay, Holland Village, Robertson Quay).
- Secondary: 24-hour cafes and prata shops that screen late matches (Tampines, Jurong, Bedok).
- Tertiary: small groups of 2 to 5 outlets under one owner.

### [BMC-02] Value propositions

- Know by Monday which matches will fill seats this week.
- Cut overstaffing on quiet nights; avoid running out of stock on big nights.
- Save about 3 hours a week of fixture checking and poster making.
- All kickoff times already in Singapore time.

### [BMC-03] Channels

- Web dashboard (desktop) for owners and managers; mobile view for floor staff.
- Weekly email and WhatsApp-style summary every Monday at 10 am SGT.
- Direct sales visits to venues; partnership with a beverage distributor.

### [BMC-04] Customer relationships

- Self-service onboarding for the Starter plan.
- Named account manager and monthly review call for Pro and Group.
- In-app assistant that answers questions from this knowledge base.

### [BMC-05] Revenue streams

- Monthly subscriptions in three tiers (see DB-01).
- One-off setup fee of SGD 99 for Group plans.
- Optional sponsored poster slots for beverage brands (planned, not live).

### [BMC-06] Key resources

- Match importance scoring rules (RULE-01 to RULE-04).
- Data from football-data.org and TheSportsDB.
- Venue history: past screenings with actual attendance.
- Poster templates and brand design system.

### [BMC-07] Key activities

- Fetch fixtures and standings daily; refresh badges weekly.
- Score matches and publish weekly plans.
- Generate posters and playbooks; run account reviews.

### [BMC-08] Key partners

- football-data.org and TheSportsDB as data providers.
- A beverage distributor for venue introductions.
- Venue associations and F&B business networks in Singapore.

### [BMC-09] Cost structure

| Cost item | Monthly cost (SGD) |
| --- | --- |
| Hosting on Vercel | 0 to 30 |
| Gemini API usage | 20 to 60 |
| Sports data APIs (free tiers) | 0 |
| Account manager (part-time) | 1,800 |
| Sales and marketing | 600 |

Break-even is about 30 Pro-plan venues at simulated costs.

## Simulated database

These five tables stand in for a real database; every record is fictional and exists only to test the app and its assistant.

### [DB-01] Pricing plans

| plan_id | Plan | Price (SGD per month) | Outlets | Competitions | Posters per week | Account manager |
| --- | --- | --- | --- | --- | --- | --- |
| P-01 | Starter | 39 | 1 | Premier League, Champions League | 3 | No |
| P-02 | Pro | 89 | 1 | All 12 free-tier competitions | 10 | Yes, monthly call |
| P-03 | Group | 249 | Up to 5 | All 12 free-tier competitions | 30 | Yes, monthly call |

### [DB-02] Venues

| venue_id | Venue | Area | Seats | Type | Fan base | Late-night licence (after 2 am) |
| --- | --- | --- | --- | --- | --- | --- |
| V-001 | The Red Corner Pub | Clarke Quay | 120 | Sports bar | Arsenal, Liverpool | Yes |
| V-002 | Kopi & Kickoff | Tampines | 60 | 24-hour cafe | Manchester United | Yes |
| V-003 | Boat Quay Taps | Boat Quay | 90 | Pub | Mixed, Champions League | No |
| V-004 | Holland Halftime | Holland Village | 75 | Sports bar | Chelsea, Tottenham | No |
| V-005 | Prata Pitch | Bedok | 50 | 24-hour cafe | Mixed | Yes |
| V-006 | Robertson Rovers Bar | Robertson Quay | 140 | Sports bar | Liverpool, Real Madrid | Yes |
| V-007 | Jurong Goal Post | Jurong East | 45 | Cafe | Manchester City | No |
| V-008 | The Offside Trap | Tanjong Pagar | 100 | Pub | Barcelona, Bayern | Yes |

### [DB-03] Subscriptions

| sub_id | venue_id | plan_id | Start date | Status | Billing day | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| S-101 | V-001 | P-02 | 2026-03-01 | Active | 1st | Renewed twice |
| S-102 | V-002 | P-01 | 2026-06-15 | Active | 15th | Asked about Pro upgrade |
| S-103 | V-003 | P-02 | 2026-01-10 | Paused | 10th | Paused for renovation until 2026-11-01 |
| S-104 | V-004 | P-01 | 2026-08-01 | Trial | 1st | 14-day trial ends 2026-08-15, converted |
| S-105 | V-005 | P-01 | 2026-05-20 | Cancelled | 20th | Cancelled 2026-09-20, too few late matches |
| S-106 | V-006 | P-03 | 2025-11-01 | Active | 1st | Group of 3 outlets |
| S-107 | V-007 | P-01 | 2026-09-01 | Active | 1st | New customer |
| S-108 | V-008 | P-02 | 2026-02-14 | Active | 14th | Wants Bundesliga focus |

### [DB-04] Past screening decisions

Sample weekend of 2026-09-26 to 2026-09-28; teams and attendance are simulated.

| screen_id | venue_id | Match | Competition | Kickoff (SGT) | Importance score | Decision | Staff planned | Attendance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-501 | V-001 | Arsenal vs Liverpool | Premier League | Sat 11:30 pm | 88 | Screen | 6 | 112 |
| D-502 | V-002 | Manchester United vs Everton | Premier League | Sat 10:00 pm | 61 | Screen | 3 | 41 |
| D-503 | V-004 | Chelsea vs Tottenham | Premier League | Sun 11:30 pm | 79 | Screen | 4 | 70 |
| D-504 | V-006 | Real Madrid vs Atletico Madrid | La Liga | Sun 3:00 am | 84 | Screen | 5 | 96 |
| D-505 | V-007 | Manchester City vs Brentford | Premier League | Sat 10:00 pm | 52 | Maybe | 2 | 18 |
| D-506 | V-008 | Bayern Munich vs Dortmund | Bundesliga | Sun 12:30 am | 86 | Screen | 5 | 88 |
| D-507 | V-003 | Porto vs Benfica | Primeira Liga | Mon 3:15 am | 70 | Skip | 0 | 0 |

### [DB-05] Support tickets

| ticket_id | venue_id | Date | Topic | Status | Resolution |
| --- | --- | --- | --- | --- | --- |
| T-901 | V-008 | 2026-10-02 | Kickoff time shown in UK time, not SGT | Resolved | Fixed; app now converts the API's UTC time to SGT |
| T-902 | V-002 | 2026-09-28 | How to upgrade to Pro | Open | Waiting for owner to confirm billing day |
| T-903 | V-005 | 2026-09-19 | Cancel subscription | Closed | Cancelled at end of billing cycle, no refund due |
| T-904 | V-001 | 2026-09-12 | Poster badge missing for promoted team | Resolved | Badge fetched from TheSportsDB by team ID |

## Decision rules

Each match gets an importance score from 0 to 100, which becomes a Screen, Maybe or Skip decision per venue, then a staff and stock plan.

### [RULE-01] Match importance score

The score adds five parts, capped at 100.

| Part | Points | How it is calculated |
| --- | --- | --- |
| Competition weight | 10 to 30 | Champions League 30; Premier League 25; La Liga, Bundesliga, Serie A 20; other free-tier leagues 10 |
| Table stakes | 0 to 25 | Both teams in the top 4: 25; one team in the top 4: 15; either team in the bottom 3: 10; otherwise 5 |
| Position gap | 0 to 15 | 15 minus the gap in league position, minimum 0 (closer teams score higher) |
| Rivalry | 0 or 15 | 15 if the fixture is on the venue's rivalry list or both teams share a city |
| Venue fan match | 0 or 15 | 15 if either team is in the venue's fan base (DB-02) |

### [RULE-02] Screening decision

- Screen if the score is 75 or more.
- Maybe if the score is 55 to 74.
- Skip if the score is below 55.
- Always Skip if kickoff is after 2:00 am SGT and the venue has no late-night licence (DB-02), whatever the score.
- Never claim a live score; free-plan scores are delayed.

### [RULE-03] Staff plan

Expected crowd = seats × occupancy, where occupancy is 90% for scores 85 and above, 70% for 75 to 84, and 40% for Maybe. Staff = expected crowd ÷ 20, rounded up, with a minimum of 2.

### [RULE-04] Stock plan

- High stock (150% of a normal night) for scores 85 and above.
- Normal plus 25% for scores 75 to 84.
- Normal stock for Maybe; no extra order for Skip.

### [RULE-05] Worked example

A hypothetical Liverpool vs Chelsea at V-006: Premier League 25, both top 4 = 25, position gap of 1 = 14, no rivalry = 0, fan match = 15. Score = 79, so Screen. Expected crowd = 140 × 70% = 98, so staff = 5. Stock = normal plus 25%.

## FAQs and policies

These are the simulated company policies the assistant should quote when customers ask about billing, data or limits.

### [FAQ-01] Free trial

Starter and Pro include a 14-day free trial with no card required. Group plans start with a 30-minute setup call instead of a trial.

### [FAQ-02] Cancellation and refunds

Venues can cancel any time from the dashboard. Cancellation takes effect at the end of the current billing cycle. No partial refunds are given for unused days.

### [FAQ-03] Pausing a subscription

Pro and Group venues can pause for up to 60 days a year, for example during renovation. No fee is charged while paused.

### [FAQ-04] Upgrading or downgrading

Upgrades take effect immediately and are charged pro rata. Downgrades take effect at the next billing day.

### [FAQ-05] Which competitions are covered

The 12 football-data.org free-tier competitions: Champions League, Premier League, Championship, Bundesliga, La Liga, Serie A, Ligue 1, Eredivisie, Primeira Liga, Brasileirao Serie A, World Cup and European Championships. Starter covers only the Premier League and Champions League.

### [FAQ-06] Live scores

FanFlow does not show live scores. The free data plan delays scores, so FanFlow is a planning tool, not a live ticker.

### [FAQ-07] Kickoff times

All times are shown in Singapore time (SGT, UTC+8). The app converts from the UTC time the API provides, so European clock changes are handled automatically.

### [FAQ-08] Data sources and attribution

Fixture and standings data come from football-data.org. Team badges and stadium details come from TheSportsDB. Both are credited in the app footer.

### [FAQ-09] Data refresh limits

Fixtures and standings refresh once a day at 6 am SGT and on demand at most once every 10 minutes, to stay within the free API limit of 10 requests per minute.

### [FAQ-10] Customer data privacy

FanFlow stores venue name, contact email, seats and fan base only. No payment card details are stored in the app; billing is handled by a payment provider.

## API data dictionary

The app reads only the fields below; verify field names against a live response before relying on them.

### [API-01] football-data.org v4 endpoints

Base URL `https://api.football-data.org/v4`, header `X-Auth-Token: <FOOTBALL_DATA_TOKEN>`. A missing token returns 403, which looks like a paywall but is not.

| Endpoint | Purpose |
| --- | --- |
| `/competitions/{code}/matches?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD` | Fixtures for the next 7 days |
| `/competitions/{code}/standings` | League table for the importance score |

Competition codes: PL Premier League, CL Champions League, ELC Championship, BL1 Bundesliga, PD La Liga, SA Serie A, FL1 Ligue 1, DED Eredivisie, PPL Primeira Liga, BSA Brasileirao, WC World Cup, EC European Championships.

### [API-02] football-data.org fields used

| Field | Meaning | Used in |
| --- | --- | --- |
| `matches[].utcDate` | Kickoff in UTC | Converted to SGT (FAQ-07) |
| `matches[].status` | SCHEDULED, TIMED, FINISHED and others | Show only upcoming matches |
| `matches[].homeTeam.id` / `awayTeam.id` | Team IDs | Join to standings |
| `matches[].homeTeam.name` / `awayTeam.name` | Team names | Display, TheSportsDB lookup |
| `matches[].homeTeam.crest` | Badge image URL | Poster fallback |
| `standings[0].table[].position` | League position | RULE-01 table stakes and gap |
| `standings[0].table[].team.id` | Team ID | Join to matches |

### [API-03] TheSportsDB v1 endpoints and fields

Base URL `https://www.thesportsdb.com/api/v1/json/123`; the free key `123` sits in the path. Searches return only 1 result, so search by exact team name and cache the team ID.

| Endpoint or field | Meaning | Used in |
| --- | --- | --- |
| `/searchteams.php?t={team name}` | Find a team once | Get and cache `idTeam` |
| `/lookupteam.php?id={idTeam}` | Team details by ID | Weekly badge refresh |
| `teams[].strBadge` | Badge image URL (older responses may use `strTeamBadge`) | Promo posters |
| `teams[].strStadium` | Stadium name | Playbook text |
| `teams[].strDescriptionEN` | Team description | Assistant answers |
