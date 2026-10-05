/**
 * FanFlow Backend Express Server
 * Handles football-data.org v4 proxy with sequential fetching & 10-min caching
 * Handles TheSportsDB v1 lookup with 7-day caching
 * Handles /api/health check without exposing secrets
 * Handles Gemini RAG assistant via @google/genai using knowledge.md chunks
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { retrieveTopChunks } from './src/server/knowledgeRag.ts';
import { FALLBACK_FIXTURES, FALLBACK_STANDINGS } from './src/data/fallbackFixtures.ts';

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

// Helper for delay in sequential fetching
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// 1. Health check endpoint: /api/health
// ==========================================
app.get('/api/health', async (_req, res) => {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  let footballDataStatus: { status: 'online' | 'auth_failed' | 'missing_token' | 'error'; code?: number; message: string };

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
          message: 'Token is missing or wrong (403). Note: 403 indicates invalid authentication, not a paywall.',
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

  // Check Gemini
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
  const geminiStatus = {
    status: geminiConfigured ? 'configured' : 'missing',
    message: geminiConfigured
      ? 'Gemini API key configured for RAG assistant'
      : 'GEMINI_API_KEY missing from secrets. Assistant tab will show friendly offline banner.',
  };

  res.json({
    footballData: footballDataStatus,
    sportsDb: sportsDbStatus,
    gemini: geminiStatus,
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
    // 1. Search by exact team name to obtain idTeam
    const searchUrl = `https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${encodeURIComponent(teamName)}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      return res.status(searchRes.status).json({ error: 'TheSportsDB search failed' });
    }
    const searchData = await searchRes.json();
    const team = searchData?.teams?.[0];

    if (!team || !team.idTeam) {
      // Fallback empty result cached for 1 hour
      const fallbackData = { teamName, badgeUrl: null, stadium: null, description: null };
      teamCache.set(cacheKey, { data: fallbackData, timestamp: Date.now() });
      return res.json(fallbackData);
    }

    // 2. Fetch team details by idTeam (lookupteam.php?id={idTeam})
    const lookupUrl = `https://www.thesportsdb.com/api/v1/json/123/lookupteam.php?id=${team.idTeam}`;
    const lookupRes = await fetch(lookupUrl);
    let details = team;
    if (lookupRes.ok) {
      const lookupData = await lookupRes.json();
      if (lookupData?.teams?.[0]) {
        details = lookupData.teams[0];
      }
    }

    // Badge priority: strBadge, fallback strTeamBadge
    const badgeUrl = details.strBadge || details.strTeamBadge || null;
    const result = {
      teamName,
      idTeam: details.idTeam,
      badgeUrl,
      stadium: details.strStadium || null,
      description: details.strDescriptionEN || null,
    };

    // Cache for 7 days
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

  // Compute 7 days window (from today)
  const now = new Date();
  const dateFrom = now.toISOString().split('T')[0];
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dateTo = next7Days.toISOString().split('T')[0];

  const cacheKey = `${compList.sort().join('_')}_${dateFrom}_${dateTo}`;
  const cached = fixtureCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < FIXTURE_CACHE_TTL)) {
    return res.json({ ...cached.data, cached: true });
  }

  // If no token, return fallback data cleanly with helpful message
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

  // Fetch competitions SEQUENTIALLY to respect free tier limit (10 requests/minute)
  try {
    const allMatches: any[] = [];
    const allStandings: Record<string, any[]> = {};
    let authFailed = false;
    let authMessage = '';

    for (let i = 0; i < compList.length; i++) {
      const code = compList[i];

      // Delay between sequential requests (e.g. 700ms) to ensure < 10 req/min
      if (i > 0) {
        await delay(700);
      }

      // 1. Fetch fixtures
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

      // Delay before standings request
      await delay(700);

      // 2. Fetch standings
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
      // Clean fallback on 403
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

    // Merge standings ranks into matches
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
    // Return fallback on any error
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
// 4. Bonus RAG Assistant: /api/chat
// ==========================================
app.post('/api/chat', async (req, res) => {
  const { question, currentVenue, plannerContext } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question is required' });
  }

  // Retrieve top 4 chunks from knowledge.md
  const retrievedChunks = retrieveTopChunks(question, 4);

  // If Gemini API Key is missing, return friendly response
  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      answer: "I don't have that information directly right now because the Gemini API key is not configured in Settings > Secrets. However, you can explore the relevant knowledge base sections below.",
      sources: retrievedChunks,
      geminiOffline: true,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Format retrieved chunks with their IDs
    const chunksText = retrievedChunks
      .map(c => `[CHUNK: ${c.id}]\nHeading: ${c.heading}\nSection: ${c.section}\nContent:\n${c.content}`)
      .join('\n\n---\n\n');

    const systemInstruction = `You are FanFlow Assistant, an intelligent operational advisor for sports bars and cafes in Singapore.
Your goal is to answer questions about European football screening decisions, importance scores, staff planning, stock planning, pricing plans, and venue policies.

CRITICAL RULES:
1. Answers MUST come ONLY from the retrieved knowledge chunks and the live planner context provided below.
2. You MUST cite the specific chunk IDs (e.g. [RULE-01], [RULE-03], [DB-02], [FAQ-05], [BMC-01]) for every fact or rule you use.
3. If the answer cannot be found in the retrieved chunks or API context, you MUST strictly say: "I don't have that information in my knowledge base." Never invent prices, customers, matches, or policies.
4. Keep answers concise, professional, and practical for bar and cafe operators in Singapore. Kickoff times must always be referred to in Singapore Time (SGT, UTC+8).
5. Never label match scores as "live" (scores are delayed planning data).`;

    const promptContent = `Retrieved Knowledge Chunks:
${chunksText}

Live Planner Context:
${plannerContext ? JSON.stringify(plannerContext, null, 2) : 'No specific match selected'}
Current Selected Venue: ${currentVenue ? JSON.stringify(currentVenue) : 'Not specified'}

User Question:
"${question}"

Answer the question strictly based on the retrieved chunks above, citing the chunk IDs. If information is missing, state "I don't have that information".`;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContent,
      config: {
        systemInstruction,
        temperature: 0.2, // low temperature for high fidelity to chunks
      },
    });

    const answer = geminiResponse.text || "I don't have that information.";

    res.json({
      answer,
      sources: retrievedChunks,
      geminiOffline: false,
    });
  } catch (err: any) {
    console.error('Error generating Gemini response:', err);

    let fallbackAnswer = '';
    if (retrievedChunks.length > 0) {
      const primaryChunk = retrievedChunks[0];
      const cleanContent = primaryChunk.content.replace(/^###?\s+.*?\n+/, '').trim();
      fallbackAnswer = `Based on ${primaryChunk.id} (${primaryChunk.heading}):\n\n${cleanContent}\n\n[Notice: Gemini AI is currently rate-limited; answer extracted directly from knowledge base source ${primaryChunk.id}.]`;
    } else {
      fallbackAnswer = "I don't have that information in my knowledge base.";
    }

    res.json({
      answer: fallbackAnswer,
      sources: retrievedChunks,
      geminiOffline: true,
      errorDetails: err.message,
    });
  }
});

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
