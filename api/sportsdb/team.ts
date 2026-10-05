const teamCache = new Map<string, { data: any; timestamp: number }>();
const TEAM_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  const teamName = (req.query.name as string || '').trim();
  if (!teamName) {
    return res.status(400).json({ error: 'Team name is required' });
  }

  const cacheKey = teamName.toLowerCase();
  const cached = teamCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < TEAM_CACHE_TTL)) {
    return res.status(200).json(cached.data);
  }

  try {
    const searchUrl = `https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${encodeURIComponent(teamName)}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      return res.status(searchRes.status).json({ error: 'TheSportsDB search failed' });
    }
    const searchData = await searchRes.json();
    const team = searchData?.teams?.[0];

    if (!team || !team.idTeam) {
      const fallbackData = { teamName, badgeUrl: null, stadium: null, description: null };
      teamCache.set(cacheKey, { data: fallbackData, timestamp: Date.now() });
      return res.status(200).json(fallbackData);
    }

    const lookupUrl = `https://www.thesportsdb.com/api/v1/json/123/lookupteam.php?id=${team.idTeam}`;
    const lookupRes = await fetch(lookupUrl);
    let details = team;
    if (lookupRes.ok) {
      const lookupData = await lookupRes.json();
      if (lookupData?.teams?.[0]) {
        details = lookupData.teams[0];
      }
    }

    const badgeUrl = details.strBadge || details.strTeamBadge || null;
    const result = {
      teamName,
      idTeam: details.idTeam,
      badgeUrl,
      stadium: details.strStadium || null,
      description: details.strDescriptionEN || null,
    };

    teamCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to lookup team details', details: err.message });
  }
}
