export interface KnowledgeChunk {
  id: string;
  heading: string;
  section: string;
  content: string;
  source: "simulated" | "API";
  lastUpdated: string;
}

export const KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  {
    "id": "[SECTION-1]",
    "heading": "",
    "section": "General",
    "content": "# FanFlow — Business Model Canvas & Simulated Database (RAG Knowledge Base)\n\nOct 5, 2026 · @Keziah Vickraman",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[SECTION-2]",
    "heading": "## How to use this document for RAG",
    "section": "How to use this document for RAG",
    "content": "## How to use this document for RAG\n\nEvery retrievable fact sits in a chunk with a unique ID in square brackets, so the app can split on headings and cite the chunk it used. All business data here is simulated for a class prototype; live match data comes only from the two APIs.\n\n- Split into chunks at every `##` and `###` heading. Each chunk keeps its heading as the first line.\n- Chunk IDs use the pattern `[AREA-NN]`: `OVR` overview, `BMC` canvas, `DB` simulated tables, `RULE` decision logic, `FAQ` questions and policies, `API` field dictionary.\n- Each table row starts with its own record ID (for example `V-003`), so a single row can be retrieved and quoted.\n- Metadata to store per chunk: `chunk_id`, `section`, `last_updated` = 2026-10-05, `source` = simulated or API.\n- Answers from the assistant must cite chunk IDs and must never invent prices, customers or match data not found in a chunk or an API response.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[SECTION-3]",
    "heading": "## Product and service overview",
    "section": "Product and service overview",
    "content": "## Product and service overview",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[OVR-01]",
    "heading": "### [OVR-01] What FanFlow is",
    "section": "Product and service overview",
    "content": "### [OVR-01] What FanFlow is\n\nFanFlow tells sports bars and cafes in Singapore which European football matches to screen each week, and how to staff and stock for them. It combines a software product (a weekly screening planner) with a service (auto-made promo posters and a match-night playbook).",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[OVR-02]",
    "heading": "### [OVR-02] The problem",
    "section": "Product and service overview",
    "content": "### [OVR-02] The problem\n\nEuropean matches kick off between 7:30 pm and 4 am Singapore time. Venues guess which late games will fill seats, so they overstaff quiet nights and understock big ones. Owners spend about 3 hours a week checking fixtures and making social posts by hand.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[OVR-03]",
    "heading": "### [OVR-03] Product: the weekly screening planner",
    "section": "Product and service overview",
    "content": "### [OVR-03] Product: the weekly screening planner\n\n- Pulls the next 7 days of fixtures for the free-tier competitions and converts kickoff times to Singapore time (SGT, UTC+8).\n- Scores each match for importance using league table positions, then recommends Screen, Maybe or Skip per venue.\n- Suggests staff count and stock level for each screened match.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[OVR-04]",
    "heading": "### [OVR-04] Service: promo and playbook",
    "section": "Product and service overview",
    "content": "### [OVR-04] Service: promo and playbook\n\n- Generates a promo poster for each screened match using both team badges.\n- Sends a match-night playbook: kickoff time, expected crowd level, staff and stock suggestion.\n- Pro and Group plans add a monthly review call with a FanFlow account manager.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[OVR-05]",
    "heading": "### [OVR-05] Data sources",
    "section": "Product and service overview",
    "content": "### [OVR-05] Data sources\n\n| Source | Used for | Credential | Free limit |\n| --- | --- | --- | --- |\n| football-data.org API v4 | Fixtures, results, standings for 12 competitions | Header `X-Auth-Token` (free key) | 10 requests per minute |\n| TheSportsDB v1 | Team badges, stadium names, team descriptions | Key `123` in the URL path | 30 requests per minute; searches return 1 result |\n\nScores on the football-data.org free plan are delayed, so FanFlow plans ahead and never claims to show live scores.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[SECTION-9]",
    "heading": "## Business Model Canvas",
    "section": "Business Model Canvas",
    "content": "## Business Model Canvas\n\nFanFlow earns monthly subscriptions from venues that screen football, and keeps costs low by building on two free sports APIs.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[BMC-01]",
    "heading": "### [BMC-01] Customer segments",
    "section": "Business Model Canvas",
    "content": "### [BMC-01] Customer segments\n\n- Primary: independent sports bars and pubs in Singapore with 40 to 150 seats (Clarke Quay, Boat Quay, Holland Village, Robertson Quay).\n- Secondary: 24-hour cafes and prata shops that screen late matches (Tampines, Jurong, Bedok).\n- Tertiary: small groups of 2 to 5 outlets under one owner.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[BMC-02]",
    "heading": "### [BMC-02] Value propositions",
    "section": "Business Model Canvas",
    "content": "### [BMC-02] Value propositions\n\n- Know by Monday which matches will fill seats this week.\n- Cut overstaffing on quiet nights; avoid running out of stock on big nights.\n- Save about 3 hours a week of fixture checking and poster making.\n- All kickoff times already in Singapore time.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[BMC-03]",
    "heading": "### [BMC-03] Channels",
    "section": "Business Model Canvas",
    "content": "### [BMC-03] Channels\n\n- Web dashboard (desktop) for owners and managers; mobile view for floor staff.\n- Weekly email and WhatsApp-style summary every Monday at 10 am SGT.\n- Direct sales visits to venues; partnership with a beverage distributor.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[BMC-04]",
    "heading": "### [BMC-04] Customer relationships",
    "section": "Business Model Canvas",
    "content": "### [BMC-04] Customer relationships\n\n- Self-service onboarding for the Starter plan.\n- Named account manager and monthly review call for Pro and Group.\n- In-app assistant that answers questions from this knowledge base.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[BMC-05]",
    "heading": "### [BMC-05] Revenue streams",
    "section": "Business Model Canvas",
    "content": "### [BMC-05] Revenue streams\n\n- Monthly subscriptions in three tiers (see DB-01).\n- One-off setup fee of SGD 99 for Group plans.\n- Optional sponsored poster slots for beverage brands (planned, not live).",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[BMC-06]",
    "heading": "### [BMC-06] Key resources",
    "section": "Business Model Canvas",
    "content": "### [BMC-06] Key resources\n\n- Match importance scoring rules (RULE-01 to RULE-04).\n- Data from football-data.org and TheSportsDB.\n- Venue history: past screenings with actual attendance.\n- Poster templates and brand design system.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[BMC-07]",
    "heading": "### [BMC-07] Key activities",
    "section": "Business Model Canvas",
    "content": "### [BMC-07] Key activities\n\n- Fetch fixtures and standings daily; refresh badges weekly.\n- Score matches and publish weekly plans.\n- Generate posters and playbooks; run account reviews.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[BMC-08]",
    "heading": "### [BMC-08] Key partners",
    "section": "Business Model Canvas",
    "content": "### [BMC-08] Key partners\n\n- football-data.org and TheSportsDB as data providers.\n- A beverage distributor for venue introductions.\n- Venue associations and F&B business networks in Singapore.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[BMC-09]",
    "heading": "### [BMC-09] Cost structure",
    "section": "Business Model Canvas",
    "content": "### [BMC-09] Cost structure\n\n| Cost item | Monthly cost (SGD) |\n| --- | --- |\n| Hosting on Vercel | 0 to 30 |\n| Gemini API usage | 20 to 60 |\n| Sports data APIs (free tiers) | 0 |\n| Account manager (part-time) | 1,800 |\n| Sales and marketing | 600 |\n\nBreak-even is about 30 Pro-plan venues at simulated costs.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[SECTION-19]",
    "heading": "## Simulated database",
    "section": "Simulated database",
    "content": "## Simulated database\n\nThese five tables stand in for a real database; every record is fictional and exists only to test the app and its assistant.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[DB-01]",
    "heading": "### [DB-01] Pricing plans",
    "section": "Simulated database",
    "content": "### [DB-01] Pricing plans\n\n| plan_id | Plan | Price (SGD per month) | Outlets | Competitions | Posters per week | Account manager |\n| --- | --- | --- | --- | --- | --- | --- |\n| P-01 | Starter | 39 | 1 | Premier League, Champions League | 3 | No |\n| P-02 | Pro | 89 | 1 | All 12 free-tier competitions | 10 | Yes, monthly call |\n| P-03 | Group | 249 | Up to 5 | All 12 free-tier competitions | 30 | Yes, monthly call |",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[DB-02]",
    "heading": "### [DB-02] Venues",
    "section": "Simulated database",
    "content": "### [DB-02] Venues\n\n| venue_id | Venue | Area | Seats | Type | Fan base | Late-night licence (after 2 am) |\n| --- | --- | --- | --- | --- | --- | --- |\n| V-001 | The Red Corner Pub | Clarke Quay | 120 | Sports bar | Arsenal, Liverpool | Yes |\n| V-002 | Kopi & Kickoff | Tampines | 60 | 24-hour cafe | Manchester United | Yes |\n| V-003 | Boat Quay Taps | Boat Quay | 90 | Pub | Mixed, Champions League | No |\n| V-004 | Holland Halftime | Holland Village | 75 | Sports bar | Chelsea, Tottenham | No |\n| V-005 | Prata Pitch | Bedok | 50 | 24-hour cafe | Mixed | Yes |\n| V-006 | Robertson Rovers Bar | Robertson Quay | 140 | Sports bar | Liverpool, Real Madrid | Yes |\n| V-007 | Jurong Goal Post | Jurong East | 45 | Cafe | Manchester City | No |\n| V-008 | The Offside Trap | Tanjong Pagar | 100 | Pub | Barcelona, Bayern | Yes |",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[DB-03]",
    "heading": "### [DB-03] Subscriptions",
    "section": "Simulated database",
    "content": "### [DB-03] Subscriptions\n\n| sub_id | venue_id | plan_id | Start date | Status | Billing day | Notes |\n| --- | --- | --- | --- | --- | --- | --- |\n| S-101 | V-001 | P-02 | 2026-03-01 | Active | 1st | Renewed twice |\n| S-102 | V-002 | P-01 | 2026-06-15 | Active | 15th | Asked about Pro upgrade |\n| S-103 | V-003 | P-02 | 2026-01-10 | Paused | 10th | Paused for renovation until 2026-11-01 |\n| S-104 | V-004 | P-01 | 2026-08-01 | Trial | 1st | 14-day trial ends 2026-08-15, converted |\n| S-105 | V-005 | P-01 | 2026-05-20 | Cancelled | 20th | Cancelled 2026-09-20, too few late matches |\n| S-106 | V-006 | P-03 | 2025-11-01 | Active | 1st | Group of 3 outlets |\n| S-107 | V-007 | P-01 | 2026-09-01 | Active | 1st | New customer |\n| S-108 | V-008 | P-02 | 2026-02-14 | Active | 14th | Wants Bundesliga focus |",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[DB-04]",
    "heading": "### [DB-04] Past screening decisions",
    "section": "Simulated database",
    "content": "### [DB-04] Past screening decisions\n\nSample weekend of 2026-09-26 to 2026-09-28; teams and attendance are simulated.\n\n| screen_id | venue_id | Match | Competition | Kickoff (SGT) | Importance score | Decision | Staff planned | Attendance |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| D-501 | V-001 | Arsenal vs Liverpool | Premier League | Sat 11:30 pm | 88 | Screen | 6 | 112 |\n| D-502 | V-002 | Manchester United vs Everton | Premier League | Sat 10:00 pm | 61 | Screen | 3 | 41 |\n| D-503 | V-004 | Chelsea vs Tottenham | Premier League | Sun 11:30 pm | 79 | Screen | 4 | 70 |\n| D-504 | V-006 | Real Madrid vs Atletico Madrid | La Liga | Sun 3:00 am | 84 | Screen | 5 | 96 |\n| D-505 | V-007 | Manchester City vs Brentford | Premier League | Sat 10:00 pm | 52 | Maybe | 2 | 18 |\n| D-506 | V-008 | Bayern Munich vs Dortmund | Bundesliga | Sun 12:30 am | 86 | Screen | 5 | 88 |\n| D-507 | V-003 | Porto vs Benfica | Primeira Liga | Mon 3:15 am | 70 | Skip | 0 | 0 |",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[DB-05]",
    "heading": "### [DB-05] Support tickets",
    "section": "Simulated database",
    "content": "### [DB-05] Support tickets\n\n| ticket_id | venue_id | Date | Topic | Status | Resolution |\n| --- | --- | --- | --- | --- | --- |\n| T-901 | V-008 | 2026-10-02 | Kickoff time shown in UK time, not SGT | Resolved | Fixed; app now converts the API's UTC time to SGT |\n| T-902 | V-002 | 2026-09-28 | How to upgrade to Pro | Open | Waiting for owner to confirm billing day |\n| T-903 | V-005 | 2026-09-19 | Cancel subscription | Closed | Cancelled at end of billing cycle, no refund due |\n| T-904 | V-001 | 2026-09-12 | Poster badge missing for promoted team | Resolved | Badge fetched from TheSportsDB by team ID |",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[SECTION-25]",
    "heading": "## Decision rules",
    "section": "Decision rules",
    "content": "## Decision rules\n\nEach match gets an importance score from 0 to 100, which becomes a Screen, Maybe or Skip decision per venue, then a staff and stock plan.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[RULE-01]",
    "heading": "### [RULE-01] Match importance score",
    "section": "Decision rules",
    "content": "### [RULE-01] Match importance score\n\nThe score adds five parts, capped at 100.\n\n| Part | Points | How it is calculated |\n| --- | --- | --- |\n| Competition weight | 10 to 30 | Champions League 30; Premier League 25; La Liga, Bundesliga, Serie A 20; other free-tier leagues 10 |\n| Table stakes | 0 to 25 | Both teams in the top 4: 25; one team in the top 4: 15; either team in the bottom 3: 10; otherwise 5 |\n| Position gap | 0 to 15 | 15 minus the gap in league position, minimum 0 (closer teams score higher) |\n| Rivalry | 0 or 15 | 15 if the fixture is on the venue's rivalry list or both teams share a city |\n| Venue fan match | 0 or 15 | 15 if either team is in the venue's fan base (DB-02) |",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[RULE-02]",
    "heading": "### [RULE-02] Screening decision",
    "section": "Decision rules",
    "content": "### [RULE-02] Screening decision\n\n- Screen if the score is 75 or more.\n- Maybe if the score is 55 to 74.\n- Skip if the score is below 55.\n- Always Skip if kickoff is after 2:00 am SGT and the venue has no late-night licence (DB-02), whatever the score.\n- Never claim a live score; free-plan scores are delayed.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[RULE-03]",
    "heading": "### [RULE-03] Staff plan",
    "section": "Decision rules",
    "content": "### [RULE-03] Staff plan\n\nExpected crowd = seats × occupancy, where occupancy is 90% for scores 85 and above, 70% for 75 to 84, and 40% for Maybe. Staff = expected crowd ÷ 20, rounded up, with a minimum of 2.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[RULE-04]",
    "heading": "### [RULE-04] Stock plan",
    "section": "Decision rules",
    "content": "### [RULE-04] Stock plan\n\n- High stock (150% of a normal night) for scores 85 and above.\n- Normal plus 25% for scores 75 to 84.\n- Normal stock for Maybe; no extra order for Skip.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[RULE-05]",
    "heading": "### [RULE-05] Worked example",
    "section": "Decision rules",
    "content": "### [RULE-05] Worked example\n\nA hypothetical Liverpool vs Chelsea at V-006: Premier League 25, both top 4 = 25, position gap of 1 = 14, no rivalry = 0, fan match = 15. Score = 79, so Screen. Expected crowd = 140 × 70% = 98, so staff = 5. Stock = normal plus 25%.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[SECTION-31]",
    "heading": "## FAQs and policies",
    "section": "FAQs and policies",
    "content": "## FAQs and policies\n\nThese are the simulated company policies the assistant should quote when customers ask about billing, data or limits.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[FAQ-01]",
    "heading": "### [FAQ-01] Free trial",
    "section": "FAQs and policies",
    "content": "### [FAQ-01] Free trial\n\nStarter and Pro include a 14-day free trial with no card required. Group plans start with a 30-minute setup call instead of a trial.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[FAQ-02]",
    "heading": "### [FAQ-02] Cancellation and refunds",
    "section": "FAQs and policies",
    "content": "### [FAQ-02] Cancellation and refunds\n\nVenues can cancel any time from the dashboard. Cancellation takes effect at the end of the current billing cycle. No partial refunds are given for unused days.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[FAQ-03]",
    "heading": "### [FAQ-03] Pausing a subscription",
    "section": "FAQs and policies",
    "content": "### [FAQ-03] Pausing a subscription\n\nPro and Group venues can pause for up to 60 days a year, for example during renovation. No fee is charged while paused.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[FAQ-04]",
    "heading": "### [FAQ-04] Upgrading or downgrading",
    "section": "FAQs and policies",
    "content": "### [FAQ-04] Upgrading or downgrading\n\nUpgrades take effect immediately and are charged pro rata. Downgrades take effect at the next billing day.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[FAQ-05]",
    "heading": "### [FAQ-05] Which competitions are covered",
    "section": "FAQs and policies",
    "content": "### [FAQ-05] Which competitions are covered\n\nThe 12 football-data.org free-tier competitions: Champions League, Premier League, Championship, Bundesliga, La Liga, Serie A, Ligue 1, Eredivisie, Primeira Liga, Brasileirao Serie A, World Cup and European Championships. Starter covers only the Premier League and Champions League.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[FAQ-06]",
    "heading": "### [FAQ-06] Live scores",
    "section": "FAQs and policies",
    "content": "### [FAQ-06] Live scores\n\nFanFlow does not show live scores. The free data plan delays scores, so FanFlow is a planning tool, not a live ticker.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[FAQ-07]",
    "heading": "### [FAQ-07] Kickoff times",
    "section": "FAQs and policies",
    "content": "### [FAQ-07] Kickoff times\n\nAll times are shown in Singapore time (SGT, UTC+8). The app converts from the UTC time the API provides, so European clock changes are handled automatically.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[FAQ-08]",
    "heading": "### [FAQ-08] Data sources and attribution",
    "section": "FAQs and policies",
    "content": "### [FAQ-08] Data sources and attribution\n\nFixture and standings data come from football-data.org. Team badges and stadium details come from TheSportsDB. Both are credited in the app footer.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[FAQ-09]",
    "heading": "### [FAQ-09] Data refresh limits",
    "section": "FAQs and policies",
    "content": "### [FAQ-09] Data refresh limits\n\nFixtures and standings refresh once a day at 6 am SGT and on demand at most once every 10 minutes, to stay within the free API limit of 10 requests per minute.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[FAQ-10]",
    "heading": "### [FAQ-10] Customer data privacy",
    "section": "FAQs and policies",
    "content": "### [FAQ-10] Customer data privacy\n\nFanFlow stores venue name, contact email, seats and fan base only. No payment card details are stored in the app; billing is handled by a payment provider.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[SECTION-42]",
    "heading": "## API data dictionary",
    "section": "API data dictionary",
    "content": "## API data dictionary\n\nThe app reads only the fields below; verify field names against a live response before relying on them.",
    "source": "simulated",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[API-01]",
    "heading": "### [API-01] football-data.org v4 endpoints",
    "section": "API data dictionary",
    "content": "### [API-01] football-data.org v4 endpoints\n\nBase URL `https://api.football-data.org/v4`, header `X-Auth-Token: <FOOTBALL_DATA_TOKEN>`. A missing token returns 403, which looks like a paywall but is not.\n\n| Endpoint | Purpose |\n| --- | --- |\n| `/competitions/{code}/matches?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD` | Fixtures for the next 7 days |\n| `/competitions/{code}/standings` | League table for the importance score |\n\nCompetition codes: PL Premier League, CL Champions League, ELC Championship, BL1 Bundesliga, PD La Liga, SA Serie A, FL1 Ligue 1, DED Eredivisie, PPL Primeira Liga, BSA Brasileirao, WC World Cup, EC European Championships.",
    "source": "API",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[API-02]",
    "heading": "### [API-02] football-data.org fields used",
    "section": "API data dictionary",
    "content": "### [API-02] football-data.org fields used\n\n| Field | Meaning | Used in |\n| --- | --- | --- |\n| `matches[].utcDate` | Kickoff in UTC | Converted to SGT (FAQ-07) |\n| `matches[].status` | SCHEDULED, TIMED, FINISHED and others | Show only upcoming matches |\n| `matches[].homeTeam.id` / `awayTeam.id` | Team IDs | Join to standings |\n| `matches[].homeTeam.name` / `awayTeam.name` | Team names | Display, TheSportsDB lookup |\n| `matches[].homeTeam.crest` | Badge image URL | Poster fallback |\n| `standings[0].table[].position` | League position | RULE-01 table stakes and gap |\n| `standings[0].table[].team.id` | Team ID | Join to matches |",
    "source": "API",
    "lastUpdated": "2026-10-05"
  },
  {
    "id": "[API-03]",
    "heading": "### [API-03] TheSportsDB v1 endpoints and fields",
    "section": "API data dictionary",
    "content": "### [API-03] TheSportsDB v1 endpoints and fields\n\nBase URL `https://www.thesportsdb.com/api/v1/json/123`; the free key `123` sits in the path. Searches return only 1 result, so search by exact team name and cache the team ID.\n\n| Endpoint or field | Meaning | Used in |\n| --- | --- | --- |\n| `/searchteams.php?t={team name}` | Find a team once | Get and cache `idTeam` |\n| `/lookupteam.php?id={idTeam}` | Team details by ID | Weekly badge refresh |\n| `teams[].strBadge` | Badge image URL (older responses may use `strTeamBadge`) | Promo posters |\n| `teams[].strStadium` | Stadium name | Playbook text |\n| `teams[].strDescriptionEN` | Team description | Assistant answers |",
    "source": "API",
    "lastUpdated": "2026-10-05"
  }
];
