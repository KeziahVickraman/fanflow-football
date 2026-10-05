import { FALLBACK_FIXTURES, FALLBACK_STANDINGS } from '../../src/data/fallbackFixtures.ts';

const fixtureCache = new Map<string, { data: any; timestamp: number }>();
const FIXTURE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  const token = process.env.FOOTBALL_DATA_TOKEN;
  const competitionsParam = (req.query.competitions as string) || 'PL,CL';
  const compList = competitionsParam.split(',').map(c => c.trim().toUpperCase()).filter(Boolean);

  const now = new Date();
  const dateFrom = now.toISOString().split('T')[0];
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dateTo = next7Days.toISOString().split('T')[0];

  const cacheKey = `${compList.sort().join('_')}_${dateFrom}_${dateTo}`;
  const cached = fixtureCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < FIXTURE_CACHE_TTL)) {
    return res.status(200).json({ ...cached.data, cached: true });
  }

  if (!token) {
    const filteredFallback = FALLBACK_FIXTURES.filter(f =>
      compList.includes(f.competition.code.toUpperCase())
    );

    const result = {
      source: 'simulated_fallback',
      message: 'FOOTBALL_DATA_TOKEN is not configured. Displaying simulated fixtures for Singapore sports bars.',
      authWarning: 'Token missing. Add FOOTBALL_DATA_TOKEN in secrets for live API data.',
      dateFrom,
      dateTo,
      matches: filteredFallback.length > 0 ? filteredFallback : FALLBACK_FIXTURES,
      standings: FALLBACK_STANDINGS,
    };

    fixtureCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return res.status(200).json(result);
  }

  try {
    const allMatches: any[] = [];
    const allStandings: Record<string, any[]> = {};
    let authFailed = false;
    let authMessage = '';

    for (let i = 0; i < compList.length; i++) {
      const code = compList[i];
      if (i > 0) await delay(700);

      const matchesUrl = `https://api.football-data.org/v4/competitions/${code}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
      const mRes = await fetch(matchesUrl, { headers: { 'X-Auth-Token': token } });

      if (mRes.status === 403) {
        authFailed = true;
        authMessage = 'football-data.org token is missing or wrong (403). Note: 403 indicates invalid authentication, not a paywall.';
        break;
      }

      if (mRes.ok) {
        const mData = await mRes.json();
        if (Array.isArray(mData.matches)) {
          allMatches.push(...mData.matches);
        }
      }

      await delay(700);

      const standingsUrl = `https://api.football-data.org/v4/competitions/${code}/standings`;
      const sRes = await fetch(standingsUrl, { headers: { 'X-Auth-Token': token } });

      if (sRes.ok) {
        const sData = await sRes.json();
        const totalTable = sData?.standings?.find((s: any) => s.type === 'TOTAL') || sData?.standings?.[0];
        if (totalTable && Array.isArray(totalTable.table)) {
          allStandings[code] = totalTable.table.map((row: any) => ({
            position: row.position,
            teamId: row.team?.id,
            name: row.team?.name,
          }));
        }
      }
    }

    if (authFailed) {
      const filteredFallback = FALLBACK_FIXTURES.filter(f =>
        compList.includes(f.competition.code.toUpperCase())
      );
      const result = {
        source: 'simulated_fallback',
        message: authMessage,
        authWarning: authMessage,
        dateFrom,
        dateTo,
        matches: filteredFallback.length > 0 ? filteredFallback : FALLBACK_FIXTURES,
        standings: FALLBACK_STANDINGS,
      };
      fixtureCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return res.status(200).json(result);
    }

    const formattedMatches = allMatches.map(m => {
      const compCode = m.competition?.code || '';
      const leagueStandings = allStandings[compCode] || [];

      const homeRank = leagueStandings.find((s: any) => s.teamId === m.homeTeam?.id)?.position;
      const awayRank = leagueStandings.find((s: any) => s.teamId === m.awayTeam?.id)?.position;

      return {
        id: m.id,
        utcDate: m.utcDate,
        status: m.status,
        competition: {
          id: m.competition?.id,
          code: m.competition?.code,
          name: m.competition?.name,
          emblem: m.competition?.emblem,
        },
        homeTeam: {
          id: m.homeTeam?.id,
          name: m.homeTeam?.name,
          shortName: m.homeTeam?.shortName,
          crest: m.homeTeam?.crest,
          position: homeRank,
        },
        awayTeam: {
          id: m.awayTeam?.id,
          name: m.awayTeam?.name,
          shortName: m.awayTeam?.shortName,
          crest: m.awayTeam?.crest,
          position: awayRank,
        },
        venueName: m.venue,
      };
    });

    const result = {
      source: 'live_api',
      message: 'Fixtures fetched from football-data.org v4 (scores are scheduled/delayed planning data; never live)',
      dateFrom,
      dateTo,
      matches: formattedMatches.length > 0 ? formattedMatches : FALLBACK_FIXTURES,
      standings: Object.keys(allStandings).length > 0 ? allStandings : FALLBACK_STANDINGS,
    };

    fixtureCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return res.status(200).json(result);
  } catch (err: any) {
    const result = {
      source: 'simulated_fallback',
      message: `Failed to fetch live API data (${err.message}). Using simulated fixtures.`,
      authWarning: 'Live API connection error. Displaying simulated fixtures.',
      dateFrom,
      dateTo,
      matches: FALLBACK_FIXTURES,
      standings: FALLBACK_STANDINGS,
    };
    return res.status(200).json(result);
  }
}
