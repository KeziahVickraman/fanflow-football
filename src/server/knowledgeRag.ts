/**
 * Knowledge Base chunking & keyword retrieval for RAG
 * Follows knowledge.md guidelines:
 * - Split into chunks at every ## and ### heading
 * - Each chunk keeps its heading and ID in square brackets (e.g. [FAQ-02])
 * - Retrieve top 4 chunks per question
 */

import fs from 'fs';
import path from 'path';

export interface KnowledgeChunk {
  id: string;
  heading: string;
  section: string;
  content: string;
  source: 'simulated' | 'API';
  lastUpdated: string;
}

let cachedChunks: KnowledgeChunk[] | null = null;

export function loadKnowledgeChunks(): KnowledgeChunk[] {
  if (cachedChunks) {
    return cachedChunks;
  }

  const knowledgePath = path.resolve(process.cwd(), 'knowledge.md');
  let rawText = '';
  try {
    rawText = fs.readFileSync(knowledgePath, 'utf-8');
  } catch (err) {
    console.error('Could not read knowledge.md from disk:', err);
    return [];
  }

  const lines = rawText.split('\n');
  const chunks: KnowledgeChunk[] = [];

  let currentHeading = '';
  let currentSection = 'General';
  let currentLines: string[] = [];

  const flushChunk = () => {
    if (currentLines.length === 0 && !currentHeading) return;

    const fullContent = currentLines.join('\n').trim();
    if (!fullContent && !currentHeading) return;

    // Look for [AREA-NN] in the heading or first lines
    // Pattern: [OVR-01], [BMC-02], [DB-01], [RULE-03], [FAQ-05], [API-01]
    const idMatch = currentHeading.match(/\[([A-Z]+-\d+)\]/i) || fullContent.match(/\[([A-Z]+-\d+)\]/i);
    const chunkId = idMatch ? `[${idMatch[1].toUpperCase()}]` : `[SECTION-${chunks.length + 1}]`;

    chunks.push({
      id: chunkId,
      heading: currentHeading || chunkId,
      section: currentSection,
      content: `${currentHeading}\n\n${fullContent}`.trim(),
      source: chunkId.includes('API') ? 'API' : 'simulated',
      lastUpdated: '2026-10-05',
    });

    currentLines = [];
  };

  for (const line of lines) {
    // Check for ## Section heading
    if (line.startsWith('## ')) {
      flushChunk();
      currentSection = line.replace(/^##\s+/, '').trim();
      currentHeading = line;
    } else if (line.startsWith('### ')) {
      // Check for ### Subsection chunk heading
      flushChunk();
      currentHeading = line;
    } else {
      currentLines.push(line);
    }
  }

  flushChunk();
  cachedChunks = chunks;
  return chunks;
}

/**
 * Keyword-based scoring (token overlap + BM25-style frequency weight)
 * Returns the top 4 chunks for the given question
 */
export function retrieveTopChunks(query: string, topK: number = 4): KnowledgeChunk[] {
  const chunks = loadKnowledgeChunks();
  if (chunks.length === 0) return [];

  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
    'will', 'with', 'what', 'which', 'how', 'who', 'why', 'where', 'when', 'does', 'do'
  ]);

  // Clean and extract query tokens
  const queryTokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !stopWords.has(t));

  if (queryTokens.length === 0) {
    return chunks.slice(0, topK);
  }

  // Score each chunk
  const scored = chunks.map(chunk => {
    const textToMatch = `${chunk.id} ${chunk.heading} ${chunk.content}`.toLowerCase();
    let score = 0;

    for (const token of queryTokens) {
      // Chunk ID exact match gives huge boost (e.g. searching "RULE-01" or "V-001")
      if (chunk.id.toLowerCase().includes(token)) {
        score += 30;
      }
      // Heading match gives high boost
      if (chunk.heading.toLowerCase().includes(token)) {
        score += 10;
      }

      // Occurrences in content
      const regex = new RegExp(`\\b${token}\\b`, 'g');
      const matches = textToMatch.match(regex);
      if (matches) {
        score += matches.length * 2;
      } else if (textToMatch.includes(token)) {
        score += 1;
      }
    }

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map(s => s.chunk);
}
