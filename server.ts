/**
 * FanFlow Backend Express Server
 * Handles football-data.org v4 proxy with sequential fetching & 10-min caching
 * Handles TheSportsDB v1 lookup with 7-day caching
 * Handles /api/health check with real Gemini test call & knowledgeBase count
 * Handles /api/assistant RAG route using GEMINI_MODEL with auto-retry and specific error handling
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { retrieveTopChunks, loadKnowledgeChunks } from './src/server/knowledgeRag.ts';
import { FALLBACK_FIXTURES, FALLBACK_STANDINGS } from './src/data/fallbackFixtures.ts';
import { GEMINI_MODEL } from './src/config/geminiConfig.ts';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// In-memory caches
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const fixtureCache = new Map<string, CacheEntry<any>>();
const FIXTURE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const teamCache = new Map<string, CacheEntry<any>>();
const TEAM_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// Cache for tiny Gemini health check ping to avoid burning rate limits
let cachedGeminiHealth: CacheEntry<any> | null = null;
const HEALTH_CACHE_TTL = 30 * 1000; // 30 seconds

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Parses Gemini SDK and API errors into user-friendly status and message
 * Never exposes the API key or raw credentials.
 */
function parseGeminiError(err: any): {
  status: 'online' | 'missing_key' | 'auth_failed' | 'rate_limited' | 'model_error' | 'service_error';
  code?: number;
  message: string;
} {
  const errStr = typeof err === 'string' ? err : err?.message || JSON.stringify(err);

  // Extract HTTP status code if present
  let code = err?.status || err?.code || err?.statusCode;
  if (!code) {
    const codeMatch = errStr.match(/\b(400|401|403|404|429|500|503)\b/);
    if (codeMatch) code = parseInt(codeMatch[1], 10);
  }

  // 1. Auth failed (401 or 403)
  if (
    code === 401 ||
    code === 403 ||
    errStr.includes('API_KEY_INVALID') ||
    errStr.includes('PERMISSION_DENIED') ||
    errStr.includes('unauthorized')
  ) {
    return {
      status: 'auth_failed',
      code: code || 401,
      message: 'Gemini key rejected: check the key.',
    };
  }

  // 2. Rate limit / Quota exceeded (429)
  if (
    code === 429 ||
    errStr.includes('RESOURCE_EXHAUSTED') ||
    errStr.includes('quota') ||
    errStr.includes('rate-limit') ||
    errStr.includes('rate limit')
  ) {
    return {
      status: 'rate_limited',
      code: 429,
      message: 'Rate limit reached: wait a minute and try again.',
    };
  }

  // 3. Bad request / Invalid model (400)
  if (code === 400 || errStr.includes('INVALID_ARGUMENT') || errStr.includes('models/')) {
    let cleanMsg = err?.message || 'Invalid request';
    try {
      const parsed = JSON.parse(err.message);
      if (parsed?.error?.message) cleanMsg = parsed.error.message;
    } catch {}
    cleanMsg = cleanMsg.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED]');
    return {
      status: 'model_error',
      code: 400,
      message: `Invalid request or model name: ${cleanMsg}`,
    };
  }

  // 4. General fallback
  const safeMessage = err?.message
    ? err.message.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED]')
    : 'Gemini service error';

  return {
    status: 'service_error',
    code,
    message: safeMessage,
  };
}

// ==========================================
// 1. Health check endpoint: /api/health
// ==========================================
app.get('/api/health', async (_req, res) => {
  // Check football-data.org
  const token = process.env.FOOTBALL_DATA_TOKEN;
  let footballDataStatus: {
    status: 'online' | 'auth_failed' | 'missing_token' | 'error';
    code?: number;
    message: string;
  };

  if (!token) {
    footballDataStatus = {
      status: 'missing_token',
      message: 'FOOTBALL_DATA_TOKEN is not configured in environment secrets. Using realistic simulated fixture dataset.',
    };
  } else {
    try {
      const pingRes = await fetch('https://api.football-data.org/v4/competitions/PL', {
        headers: { 'X-Auth-Token': token },
      });
      if (pingRes.ok) {
        footballDataStatus = { status: 'online', code: 200, message: 'Connected to live football-data.org API v4' };
      } else if (pingRes.status === 403) {
        footballDataStatus = {
          status: 'auth_failed',
          code: 403,
          message: 'football-data.org token is missing or wrong (403). Note: 403 indicates invalid authentication, not a paywall.',
        };
      } else {
        footballDataStatus = {
          status: 'error',
          code: pingRes.status,
          message: `football-data.org responded with HTTP ${pingRes.status}`,
        };
      }
    } catch (err: any) {
      footballDataStatus = {
        status: 'error',
        message: `Network error connecting to football-data.org: ${err.message || 'Unknown error'}`,
      };
    }
  }

  // Check TheSportsDB (Key 123)
  let sportsDbStatus: { status: 'online' | 'error'; message: string };
  try {
    const sdbRes = await fetch('https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=Arsenal');
    if (sdbRes.ok) {
      sportsDbStatus = { status: 'online', message: 'TheSportsDB API v1 connected' };
    } else {
      sportsDbStatus = { status: 'error', message: `TheSportsDB responded with HTTP ${sdbRes.status}` };
    }
  } catch (err: any) {
    sportsDbStatus = { status: 'error', message: `TheSportsDB network error: ${err.message || 'Unknown error'}` };
  }

  // Check Gemini with a tiny real test call ("Reply OK")
  let geminiStatus: {
    status: 'online' | 'missing_key' | 'auth_failed' | 'rate_limited' | 'model_error' | 'service_error';
    code?: number;
    message: string;
  };

  if (!process.env.GEMINI_API_KEY) {
    geminiStatus = {
      status: 'missing_key',
      message: 'Gemini key missing: add GEMINI_API_KEY in Vercel and redeploy.',
    };
  } else if (cachedGeminiHealth && (Date.now() - cachedGeminiHealth.timestamp < HEALTH_CACHE_TTL)) {
    geminiStatus = cachedGeminiHealth.data;
  } else {
    try {
      const testAi = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      await testAi.models.generateContent({
        model: GEMINI_MODEL,
        contents: 'Reply OK',
      });

      geminiStatus = {
        status: 'online',
        code: 200,
        message: `Gemini is online and responding (${GEMINI_MODEL}).`,
      };
    } catch (err: any) {
      geminiStatus = parseGeminiError(err);
    }
    cachedGeminiHealth = { data: geminiStatus, timestamp: Date.now() };
  }

  // Check Knowledge Base
  const allChunks = loadKnowledgeChunks();
  const knowledgeBaseStatus = {
    status: allChunks.length > 0 ? 'loaded' : 'not_loaded',
    chunkCount: allChunks.length,
    message: allChunks.length > 0
      ? `${allChunks.length} chunks loaded from knowledge.md`
      : 'Knowledge base not loaded',
  };

  res.json({
    footballData: footballDataStatus,
    sportsDb: sportsDbStatus,
    gemini: geminiStatus,
    knowledgeBase: knowledgeBaseStatus,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 2. TheSportsDB lookup endpoint: /api/sportsdb/team
// ==========================================
app.get('/api/sportsdb/team', async (req, res) => {
  const teamName = (req.query.name as string || '').trim();
  if (!teamName) {
    return res.status(400).json({ error: 'Team name is required' });
  }

  const cacheKey = teamName.toLowerCase();
  const cached = teamCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < TEAM_CACHE_TTL)) {
    return res.json(cached.data);
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
      return res.json(fallbackData);
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
    res.json(result);
  } catch (err: any) {
    console.error(`Error looking up team ${teamName}:`, err);
    res.status(500).json({ error: 'Failed to lookup team details', details: err.message });
  }
});

// ==========================================
// 3. Football data fixtures endpoint: /api/football/fixtures
// ==========================================
app.get('/api/football/fixtures', async (req, res) => {
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
    return res.json({ ...cached.data, cached: true });
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
    return res.json(result);
  }

  try {
    const allMatches: any[] = [];
    const allStandings: Record<string, any[]> = {};
    let authFailed = false;
    let authMessage = '';

    for (let i = 0; i < compList.length; i++) {
      const code = compList[i];

      if (i > 0) {
        await delay(700);
      }

      const matchesUrl = `https://api.football-data.org/v4/competitions/${code}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
      const mRes = await fetch(matchesUrl, {
        headers: { 'X-Auth-Token': token },
      });

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
      const sRes = await fetch(standingsUrl, {
        headers: { 'X-Auth-Token': token },
      });

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
      return res.json(result);
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
    res.json(result);
  } catch (err: any) {
    console.error('Error fetching football fixtures:', err);
    const result = {
      source: 'simulated_fallback',
      message: `Failed to fetch live API data (${err.message}). Using simulated fixtures.`,
      authWarning: 'Live API connection error. Displaying simulated fixtures.',
      dateFrom,
      dateTo,
      matches: FALLBACK_FIXTURES,
      standings: FALLBACK_STANDINGS,
    };
    res.json(result);
  }
});

// ==========================================
// 4. Assistant RAG Route: /api/assistant
// ==========================================
async function handleAssistantRequest(req: express.Request, res: express.Response) {
  const { question, currentVenue, plannerContext } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question is required' });
  }

  // Check Knowledge Base status
  const allChunks = loadKnowledgeChunks();
  if (allChunks.length === 0) {
    return res.json({
      answer: 'Knowledge base not loaded',
      sources: [],
      geminiOnline: false,
      kbLoaded: false,
      errorType: 'kb_not_loaded',
      errorMessage: 'knowledge.md could not be read or contains 0 chunks.',
    });
  }

  // Retrieve top 4 chunks
  const retrievedChunks = retrieveTopChunks(question, 4);
  const closestChunk = retrievedChunks[0] || allChunks[0];
  const closestText = closestChunk.content.replace(/^###?\s+.*?\n+/, '').trim();
  const directFallbackAnswer = `Direct from knowledge base (AI summary unavailable):\n\n${closestText}`;

  // Check Gemini Key
  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      answer: directFallbackAnswer,
      sources: retrievedChunks,
      geminiOnline: false,
      kbLoaded: true,
      errorType: 'missing_key',
      geminiError: 'Gemini key missing: add GEMINI_API_KEY in Vercel and redeploy.',
    });
  }

  // Prepare Gemini Prompt
  const chunksText = retrievedChunks
    .map(c => `[CHUNK: ${c.id}]\nHeading: ${c.heading}\nSection: ${c.section}\nContent:\n${c.content}`)
    .join('\n\n---\n\n');

  const systemInstruction = "Answer only from the provided chunks, cite chunk IDs like [FAQ-02], say 'I don't have that information' if the chunks don't cover it";

  const promptContent = `Retrieved Knowledge Chunks:
${chunksText}

Live Planner Context:
${plannerContext ? JSON.stringify(plannerContext, null, 2) : 'No specific match selected'}
Current Selected Venue: ${currentVenue ? JSON.stringify(currentVenue) : 'Not specified'}

User Question:
"${question}"`;

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  let geminiResponse: any = null;
  let executionError: any = null;

  try {
    geminiResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: promptContent,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });
  } catch (err: any) {
    executionError = err;
    const parsed = parseGeminiError(err);

    // Auto-retry once after 5 seconds if rate limited (429)
    if (parsed.status === 'rate_limited') {
      console.log('Gemini 429 rate limit reached. Retrying once after 5 seconds automatically...');
      await delay(5000);
      try {
        geminiResponse = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: promptContent,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });
        executionError = null; // retry succeeded!
      } catch (retryErr: any) {
        executionError = retryErr;
      }
    }
  }

  if (executionError || !geminiResponse) {
    const parsed = parseGeminiError(executionError);
    return res.json({
      answer: directFallbackAnswer,
      sources: retrievedChunks,
      geminiOnline: false,
      kbLoaded: true,
      errorType: parsed.status,
      errorCode: parsed.code,
      geminiError: parsed.message,
    });
  }

  const aiAnswer = geminiResponse.text || "I don't have that information.";

  res.json({
    answer: aiAnswer,
    sources: retrievedChunks,
    geminiOnline: true,
    kbLoaded: true,
  });
}

app.post('/api/assistant', handleAssistantRequest);
// Maintain /api/chat alias for compatibility
app.post('/api/chat', handleAssistantRequest);

// ==========================================
// 5. Mount Vite or static server
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FanFlow full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
