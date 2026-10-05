import React, { useState } from 'react';
import { Send, Bot, User, ChevronDown, ChevronUp, Sparkles, BookOpen, AlertCircle, AlertTriangle, FileQuestion } from 'lucide-react';
import type { Venue } from '../data/simulatedDb.ts';
import type { MatchFixture } from '../shared/scoringEngine.ts';

interface AssistantTabProps {
  selectedVenue: Venue;
  fixtures: MatchFixture[];
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: Array<{
    id: string;
    heading: string;
    section: string;
    content: string;
  }>;
  geminiOnline?: boolean;
  geminiError?: string;
  kbLoaded?: boolean;
}

const SAMPLE_QUESTIONS = [
  'How is the match importance score calculated?',
  'Which venues have a late-night licence after 2 AM?',
  'What is the staff and stock plan for an 85+ score?',
  'What is FanFlow\'s cancellation and refund policy?',
  'What competitions are included in the Starter plan?',
];

export const AssistantTab: React.FC<AssistantTabProps> = ({
  selectedVenue,
  fixtures,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your FanFlow Assistant. Ask me anything about match importance rules [RULE-01 to 04], simulated venues [DB-02], subscriptions [DB-01/03], or policies [FAQ-01 to 10]. Answers cite chunk IDs, and sources are always available below.',
      geminiOnline: true,
      kbLoaded: true,
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  const toggleSource = (msgId: string) => {
    setExpandedSources(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Call server route /api/assistant only
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          currentVenue: selectedVenue,
          plannerContext: {
            fixtureCount: fixtures.length,
            sampleMatches: fixtures.slice(0, 3).map(f => `${f.homeTeam.name} vs ${f.awayTeam.name}`),
          },
        }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || "I don't have that information.",
        sources: data.sources || [],
        geminiOnline: data.geminiOnline !== false,
        geminiError: data.geminiError,
        kbLoaded: data.kbLoaded !== false,
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Auto-expand sources by default so user always sees the grounding
      if (data.sources && data.sources.length > 0) {
        setExpandedSources(prev => ({ ...prev, [assistantMsg.id]: true }));
      }
    } catch (err: any) {
      console.error('Error calling /api/assistant:', err);
      const errorMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: 'Network error communicating with /api/assistant. Check server connection.',
        geminiOnline: false,
        geminiError: err.message,
        kbLoaded: true,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">FanFlow Assistant</h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Server-side /api/assistant
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Strictly grounded on <code>knowledge.md</code> chunks with ID citations. Direct knowledge retrieval always works even if Gemini is down.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Question Chips */}
      <div>
        <span className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Quick Debug & Verification Queries:
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-slate-800 font-semibold transition-colors disabled:opacity-50 text-left shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 min-h-[380px] max-h-[550px] overflow-y-auto space-y-4 shadow-inner">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 mt-0.5 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[88%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
              }`}
            >
              {/* Message text */}
              <div className="whitespace-pre-line font-normal">{msg.text}</div>

              {/* Status / Error Diagnostic Notice */}
              {msg.kbLoaded === false ? (
                // 1. Knowledge Base Failed to Load
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 font-bold">
                  <FileQuestion className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>Knowledge base not loaded</span>
                </div>
              ) : !msg.geminiOnline && msg.geminiError ? (
                // 2. Real Gemini Error Message
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-amber-900">Gemini Status Notice:</span>
                    <span>{msg.geminiError}</span>
                  </div>
                </div>
              ) : null}

              {/* Collapsible Sources Drawer */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-200">
                  <button
                    onClick={() => toggleSource(msg.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Sources ({msg.sources.length} Retrieved Chunks)</span>
                    {expandedSources[msg.id] ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {expandedSources[msg.id] && (
                    <div className="mt-2.5 space-y-2.5 animate-fadeIn">
                      {msg.sources.map((chunk, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 shadow-2xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono font-black text-blue-700 text-[11px] px-1.5 py-0.5 rounded bg-blue-100 border border-blue-200">
                              {chunk.id}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase">{chunk.section}</span>
                          </div>
                          <div className="font-bold text-slate-900 mb-1">{chunk.heading}</div>
                          <div className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">
                            {chunk.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-600 flex items-center gap-2 shadow-2xs font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              Retrieving top 4 chunks & querying Gemini...
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask a question about scoring rules, Singapore venues, staff formulas, or pricing..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
          className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs font-medium"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !inputQuery.trim()}
          className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-md transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </div>
    </div>
  );
};
