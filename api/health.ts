import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODEL } from '../src/config/geminiConfig.ts';
import { loadKnowledgeChunks } from '../src/server/knowledgeRag.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    geminiStatus = {
      status: 'missing_key',
      message: 'Gemini key missing: add GEMINI_API_KEY in Vercel and redeploy.',
    };
  } else {
    try {
      const testAi = new GoogleGenAI({
        apiKey,
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
      const errStr = typeof err === 'string' ? err : err?.message || JSON.stringify(err);
      let code = err?.status || err?.code || err?.statusCode;
      if (!code) {
        const codeMatch = errStr.match(/\b(400|401|403|404|429|500|503)\b/);
        if (codeMatch) code = parseInt(codeMatch[1], 10);
      }

      if (code === 401 || code === 403 || errStr.includes('API_KEY_INVALID') || errStr.includes('PERMISSION_DENIED')) {
        geminiStatus = {
          status: 'auth_failed',
          code: code || 401,
          message: 'Gemini key rejected: check the key.',
        };
      } else if (code === 429 || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('quota') || errStr.includes('rate-limit')) {
        geminiStatus = {
          status: 'rate_limited',
          code: 429,
          message: 'Rate limit reached: wait a minute and try again.',
        };
      } else if (code === 400 || errStr.includes('INVALID_ARGUMENT') || errStr.includes('models/')) {
        geminiStatus = {
          status: 'model_error',
          code: 400,
          message: `Invalid request or model name: ${err?.message || 'Error'}`,
        };
      } else {
        geminiStatus = {
          status: 'service_error',
          code,
          message: 'Gemini test call failed',
        };
      }
    }
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

  return res.status(200).json({
    footballData: footballDataStatus,
    sportsDb: sportsDbStatus,
    gemini: geminiStatus,
    knowledgeBase: knowledgeBaseStatus,
    timestamp: new Date().toISOString(),
  });
}
