import React, { useState } from 'react';
import { Send, Bot, User, ChevronDown, ChevronUp, Sparkles, BookOpen, AlertCircle, HelpCircle } from 'lucide-react';
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
  geminiOffline?: boolean;
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
      text: 'Hello! I am your FanFlow RAG Assistant. I answer operational questions strictly using the FanFlow knowledge base (scoring rules RULE-01 to RULE-04, DB-01 to DB-05 simulated records, and company policies FAQ-01 to FAQ-10). Every answer cites the retrieved chunk IDs.',
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
      // Send planner context to server
      const res = await fetch('/api/chat', {
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
        geminiOffline: data.geminiOffline,
      };

      setMessages(prev => [...prev, assistantMsg]);
      if (data.sources && data.sources.length > 0) {
        // Auto-expand sources for first query
        setExpandedSources(prev => ({ ...prev, [assistantMsg.id]: true }));
      }
    } catch (err: any) {
      console.error('Error in chat request:', err);
      const errorMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: 'The assistant is currently offline or unreachable. The rest of the FanFlow planner and posters remain fully functional.',
        geminiOffline: true,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">FanFlow RAG Knowledge Assistant</h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Bonus Feature
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly grounded on <code>knowledge.md</code> chunks with ID citations [RULE-xx], [DB-xx], [FAQ-xx].
            </p>
          </div>
        </div>
      </div>

      {/* Preset Question Chips */}
      <div>
        <span className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Suggested Questions:
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors disabled:opacity-50 text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 min-h-[380px] max-h-[550px] overflow-y-auto space-y-4 shadow-inner">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Gemini Offline Banner */}
              {msg.geminiOffline && (
                <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Gemini AI is currently offline or unconfigured. You can check <code>GEMINI_API_KEY</code> in Settings &gt; Secrets, but the core Planner, Posters, and Venue Data work independently.
                  </span>
                </div>
              )}

              {/* Collapsible Sources Drawer */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/60">
                  <button
                    onClick={() => toggleSource(msg.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
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
                    <div className="mt-2.5 space-y-2 animate-fadeIn">
                      {msg.sources.map((chunk, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-700/60 text-xs text-slate-300"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono font-bold text-emerald-400 text-[11px]">
                              {chunk.id}
                            </span>
                            <span className="text-[10px] text-slate-400">{chunk.section}</span>
                          </div>
                          <div className="font-semibold text-white mb-1">{chunk.heading}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
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
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Retrieving knowledge chunks and consulting Gemini 3.8 Flash...
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
          className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-md"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !inputQuery.trim()}
          className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </div>
    </div>
  );
};
