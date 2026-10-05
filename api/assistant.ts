import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODEL } from '../src/config/geminiConfig.ts';
import { retrieveTopChunks, loadKnowledgeChunks, type KnowledgeChunk } from '../src/server/knowledgeRag.ts';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseGeminiError(err: any): {
  errorType: 'missing_key' | 'auth_failed' | 'rate_limited' | 'model_error' | 'service_error';
  status: number;
  message: string;
} {
  const errStr = typeof err === 'string' ? err : err?.message || JSON.stringify(err);

  let code = err?.status || err?.code || err?.statusCode;
  if (!code) {
    const codeMatch = errStr.match(/\b(400|401|403|404|429|500|503)\b/);
    if (codeMatch) code = parseInt(codeMatch[1], 10);
  }

  // 401/403
  if (
    code === 401 ||
    code === 403 ||
    errStr.includes('API_KEY_INVALID') ||
    errStr.includes('PERMISSION_DENIED') ||
    errStr.includes('unauthorized')
  ) {
    return {
      errorType: 'auth_failed',
      status: code || 401,
      message: 'Gemini key rejected: check the key.',
    };
  }

  // 429
  if (
    code === 429 ||
    errStr.includes('RESOURCE_EXHAUSTED') ||
    errStr.includes('quota') ||
    errStr.includes('rate-limit') ||
    errStr.includes('rate limit')
  ) {
    return {
      errorType: 'rate_limited',
      status: 429,
      message: 'Rate limit reached: wait a minute and try again.',
    };
  }

  // 400
  if (code === 400 || errStr.includes('INVALID_ARGUMENT') || errStr.includes('models/')) {
    let cleanMsg = err?.message || 'Invalid request';
    try {
      const parsed = JSON.parse(err.message);
      if (parsed?.error?.message) cleanMsg = parsed.error.message;
    } catch {}
    cleanMsg = cleanMsg.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED]');
    return {
      errorType: 'model_error',
      status: 400,
      message: `Invalid request or model name: ${cleanMsg}`,
    };
  }

  const safeMsg = err?.message
    ? err.message.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED]')
    : 'Gemini service error';

  return {
    errorType: 'service_error',
    status: code || 500,
    message: safeMsg,
  };
}

export default async function handler(req: any, res: any) {
  // Ensure JSON response header in all cases
  res.setHeader('Content-Type', 'application/json');

  // Respond to GET with { ok: true, route: "assistant" } so it can be tested in browser
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, route: 'assistant' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      errorType: 'method_not_allowed',
      message: 'Method not allowed. Use POST or GET.',
      status: 405,
    });
  }

  const { question, chunks: providedChunks } = req.body || {};

  if (!question || typeof question !== 'string') {
    return res.status(400).json({
      ok: false,
      errorType: 'bad_request',
      message: 'Question is required.',
      status: 400,
    });
  }

  // Use provided chunks or retrieve top 4 from knowledge base
  let chunks: KnowledgeChunk[] = Array.isArray(providedChunks) && providedChunks.length > 0
    ? providedChunks
    : retrieveTopChunks(question, 4);

  // Check if chunks are available
  if (!chunks || chunks.length === 0) {
    const all = loadKnowledgeChunks();
    if (all.length === 0) {
      return res.status(500).json({
        ok: false,
        errorType: 'kb_not_loaded',
        message: 'Knowledge base not loaded',
        status: 500,
      });
    }
    chunks = all.slice(0, 4);
  }

  // Check for GEMINI_API_KEY
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      errorType: 'missing_key',
      message: 'Gemini key missing: add GEMINI_API_KEY in Vercel and redeploy.',
      status: 500,
    });
  }

  const chunksText = chunks
    .map(c => `[CHUNK: ${c.id}]\nHeading: ${c.heading}\nSection: ${c.section}\nContent:\n${c.content}`)
    .join('\n\n---\n\n');

  const systemInstruction = "Answer only from the provided chunks, cite chunk IDs like [FAQ-02], say 'I don't have that information' if the chunks don't cover it";

  const promptContent = `Retrieved Knowledge Chunks:
${chunksText}

User Question:
"${question}"`;

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  let geminiResponse: any = null;
  let lastError: any = null;

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
    lastError = err;
    const parsed = parseGeminiError(err);

    // Auto-retry once after 5 seconds if rate limited (429)
    if (parsed.errorType === 'rate_limited') {
      console.log('Gemini rate-limited (429). Retrying once after 5 seconds...');
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
        lastError = null;
      } catch (retryErr: any) {
        lastError = retryErr;
      }
    }
  }

  if (lastError || !geminiResponse) {
    const parsed = parseGeminiError(lastError);
    return res.status(parsed.status).json({
      ok: false,
      errorType: parsed.errorType,
      message: parsed.message,
      status: parsed.status,
    });
  }

  const answer = geminiResponse.text || "I don't have that information.";
  const citedIds = Array.from(new Set((answer.match(/\[[A-Z]+-\d+\]/gi) || []).map((id: string) => id.toUpperCase())));

  return res.status(200).json({
    ok: true,
    answer,
    citedIds,
  });
}
