import React, { useState, useRef, useEffect } from 'react';
import { Download, Sparkles, Image as ImageIcon, MapPin, Clock, Calendar, Palette, Check } from 'lucide-react';
import type { MatchFixture, MatchDecision } from '../shared/scoringEngine.ts';
import type { Venue } from '../data/simulatedDb.ts';
import { calculateMatchDecision } from '../shared/scoringEngine.ts';

interface PostersTabProps {
  fixtures: MatchFixture[];
  selectedFixture: MatchFixture | null;
  setSelectedFixture: (fixture: MatchFixture) => void;
  selectedVenue: Venue;
}

const HEADLINES = [
  'SCREENING LIVE IN SINGAPORE',
  'BIG MATCH NIGHT',
  'EUROPEAN FOOTBALL SHOWDOWN',
  'DERBY CLASH · SOUND ON',
  'SATURDAY NIGHT FOOTBALL',
  'CHAMPIONS LEAGUE NIGHT',
];

const SPECIAL_OFFERS = [
  'Happy Hour on Draft Pints all night · Big HD Screens',
  'Ice Cold Beer Buckets · Table Reservations Open',
  'Full Sound On · Singapore Craft Beer on Tap',
  'Match Snacks · Guinness & Heineken on Tap',
];

const THEMES = [
  { id: 'emerald', name: 'Electric Emerald', bg: 'from-slate-950 via-emerald-950 to-slate-900', accent: '#10b981', border: 'border-emerald-500/40' },
  { id: 'blue', name: 'Champions Blue', bg: 'from-slate-950 via-blue-950 to-slate-900', accent: '#3b82f6', border: 'border-blue-500/40' },
  { id: 'gold', name: 'Stadium Gold', bg: 'from-slate-950 via-amber-950 to-slate-900', accent: '#f59e0b', border: 'border-amber-500/40' },
  { id: 'crimson', name: 'Derby Crimson', bg: 'from-slate-950 via-rose-950 to-slate-900', accent: '#f43f5e', border: 'border-rose-500/40' },
];

export const PostersTab: React.FC<PostersTabProps> = ({
  fixtures,
  selectedFixture,
  setSelectedFixture,
  selectedVenue,
}) => {
  // Pre-calculate decision for current match
  const activeFixture = selectedFixture || fixtures[0] || null;
  const decision = activeFixture ? calculateMatchDecision(activeFixture, selectedVenue) : null;

  const [headline, setHeadline] = useState(HEADLINES[0]);
  const [customHeadline, setCustomHeadline] = useState('');
  const [offerText, setOfferText] = useState(SPECIAL_OFFERS[0]);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [aspectRatio, setAspectRatio] = useState<'story' | 'square'>('square');
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter screened matches first, then others
  const screenMatches = fixtures.filter(f => {
    const d = calculateMatchDecision(f, selectedVenue);
    return d.decision === 'Screen';
  });

  const displayHeadline = customHeadline.trim() || headline;

  // Render poster on HTML5 canvas for export
  const renderCanvas = async (): Promise<string | null> => {
    if (!activeFixture || !decision) return null;

    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = aspectRatio === 'story' ? 1920 : 1080;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    if (selectedTheme.id === 'emerald') {
      gradient.addColorStop(0, '#061712');
      gradient.addColorStop(0.5, '#042f24');
      gradient.addColorStop(1, '#020d0a');
    } else if (selectedTheme.id === 'blue') {
      gradient.addColorStop(0, '#060f24');
      gradient.addColorStop(0.5, '#0c2357');
      gradient.addColorStop(1, '#030814');
    } else if (selectedTheme.id === 'gold') {
      gradient.addColorStop(0, '#1c1304');
      gradient.addColorStop(0.5, '#3b2805');
      gradient.addColorStop(1, '#0d0801');
    } else {
      gradient.addColorStop(0, '#1f070b');
      gradient.addColorStop(0.5, '#400c15');
      gradient.addColorStop(1, '#120205');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative stadium circles and lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width * 0.4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width * 0.2, 0, Math.PI * 2);
    ctx.stroke();

    // Top Header Pill: FanFlow Screening
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    const topPillY = aspectRatio === 'story' ? 120 : 60;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 180, topPillY, 360, 44, 22);
    ctx.fill();
    ctx.strokeStyle = selectedTheme.accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = selectedTheme.accent;
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`FANFLOW · ${activeFixture.competition.name.toUpperCase()}`, width / 2, topPillY + 28);

    // Headline
    const headlineY = aspectRatio === 'story' ? 240 : 160;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 42px Inter, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText(displayHeadline.toUpperCase(), width / 2, headlineY);

    // Load and draw badges
    const loadImg = (url: string): Promise<HTMLImageElement | null> => {
      return new Promise((resolve) => {
        if (!url) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
      });
    };

    const homeBadgeUrl = activeFixture.homeTeam.badgeUrl || activeFixture.homeTeam.crest || '';
    const awayBadgeUrl = activeFixture.awayTeam.badgeUrl || activeFixture.awayTeam.crest || '';

    const [homeImg, awayImg] = await Promise.all([
      loadImg(homeBadgeUrl),
      loadImg(awayBadgeUrl),
    ]);

    const badgeSize = aspectRatio === 'story' ? 240 : 180;
    const centerY = aspectRatio === 'story' ? 680 : 420;
    const spacing = 220;

    // Home Badge
    if (homeImg) {
      try {
        ctx.drawImage(homeImg, width / 2 - spacing - badgeSize / 2, centerY - badgeSize / 2, badgeSize, badgeSize);
      } catch (err) {
        // fallback circle
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.arc(width / 2 - spacing, centerY, badgeSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // VS text
    ctx.fillStyle = selectedTheme.accent;
    ctx.font = '900 48px Inter, sans-serif';
    ctx.fillText('VS', width / 2, centerY + 16);

    // Away Badge
    if (awayImg) {
      try {
        ctx.drawImage(awayImg, width / 2 + spacing - badgeSize / 2, centerY - badgeSize / 2, badgeSize, badgeSize);
      } catch (err) {
        // fallback circle
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.arc(width / 2 + spacing, centerY, badgeSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Team Names
    const namesY = centerY + badgeSize / 2 + 60;
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 34px Inter, sans-serif';
    ctx.fillText(activeFixture.homeTeam.name, width / 2 - spacing, namesY);
    ctx.fillText(activeFixture.awayTeam.name, width / 2 + spacing, namesY);

    // Kickoff Box
    const boxY = aspectRatio === 'story' ? 1060 : 660;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 340, boxY, 680, 110, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText('SINGAPORE KICKOFF TIME (UTC+8)', width / 2, boxY + 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px Inter, sans-serif';
    ctx.fillText(decision.kickoffSGT.fullFormatted.toUpperCase(), width / 2, boxY + 84);

    // Venue Box
    const venueY = boxY + 140;
    ctx.fillStyle = selectedTheme.accent;
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText(`📍 SCREENING LIVE AT ${selectedVenue.venue.toUpperCase()}`, width / 2, venueY);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 20px Inter, sans-serif';
    ctx.fillText(`${selectedVenue.area} · ${selectedVenue.seats} Seats · Full Audio Experience`, width / 2, venueY + 34);

    // Special Offer Tag
    const offerY = venueY + 80;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 380, offerY, 760, 56, 28);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 20px Inter, sans-serif';
    ctx.fillText(`🍺 ${offerText}`, width / 2, offerY + 36);

    // Footer Watermark
    const footerY = height - 40;
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillText('POWERED BY FANFLOW · FIXTURES: FOOTBALL-DATA.ORG · BADGES: THESPORTSDB', width / 2, footerY);

    return canvas.toDataURL('image/png');
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await renderCanvas();
      if (!dataUrl) return;

      const link = document.createElement('a');
      const safeHome = activeFixture?.homeTeam.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'home';
      const safeAway = activeFixture?.awayTeam.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'away';
      link.download = `fanflow-poster-${safeHome}-vs-${safeAway}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating promo poster PNG:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!activeFixture || !decision) {
    return (
      <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-800">
        <p className="text-slate-400">No matches available to create posters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Poster Customizer Controls */}
      <div className="lg:col-span-5 space-y-5 bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-400" />
            Promo Poster Generator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pick a match to create instant promotional graphics for Instagram, WhatsApp, or table flyers.
          </p>
        </div>

        {/* Match Selector */}
        <div>
          <label className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-1.5 block">
            Select Match to Promote:
          </label>
          <select
            value={activeFixture.id}
            onChange={(e) => {
              const f = fixtures.find(item => item.id.toString() === e.target.value);
              if (f) setSelectedFixture(f);
            }}
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <optgroup label="Recommended by FanFlow (Screen)">
              {screenMatches.map(f => (
                <option key={f.id} value={f.id}>
                  ⭐ {f.homeTeam.name} vs {f.awayTeam.name} ({f.competition.code})
                </option>
              ))}
            </optgroup>
            <optgroup label="All Fixtures">
              {fixtures.map(f => (
                <option key={f.id} value={f.id}>
                  {f.homeTeam.name} vs {f.awayTeam.name} ({f.competition.code})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Headline selector */}
        <div>
          <label className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-1.5 block">
            Headline Tag:
          </label>
          <div className="space-y-2">
            <select
              value={headline}
              onChange={(e) => {
                setHeadline(e.target.value);
                setCustomHeadline('');
              }}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2"
            >
              {HEADLINES.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or type custom headline..."
              value={customHeadline}
              onChange={(e) => setCustomHeadline(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Special Offer / Perk */}
        <div>
          <label className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-1.5 block">
            Bar / Cafe Special Tag:
          </label>
          <select
            value={offerText}
            onChange={(e) => setOfferText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2"
          >
            {SPECIAL_OFFERS.map(offer => (
              <option key={offer} value={offer}>{offer}</option>
            ))}
          </select>
        </div>

        {/* Theme Palette */}
        <div>
          <label className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-1.5 block flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-emerald-400" />
            Color Theme:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  selectedTheme.id === theme.id
                    ? 'bg-slate-800 border-white text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: theme.accent }}></span>
                <span>{theme.name}</span>
                {selectedTheme.id === theme.id && <Check className="w-3.5 h-3.5 ml-auto text-emerald-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-1.5 block">
            Format:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setAspectRatio('square')}
              className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
                aspectRatio === 'square'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              Square (1:1 Feed)
            </button>
            <button
              onClick={() => setAspectRatio('story')}
              className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
                aspectRatio === 'story'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              Portrait (9:16 Story)
            </button>
          </div>
        </div>

        {/* Download Action */}
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? 'Rendering PNG...' : 'Download as PNG'}
        </button>
      </div>

      {/* Right Column: Live Poster Visual Preview */}
      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="text-xs text-slate-400 mb-2 font-medium">
          Live Poster Preview (Export Resolution: 1080px HD)
        </div>

        {/* Poster Card Mockup */}
        <div
          className={`w-full max-w-md bg-gradient-to-b ${selectedTheme.bg} border-2 ${selectedTheme.border} rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl relative overflow-hidden transition-all duration-300 ${
            aspectRatio === 'story' ? 'aspect-[9/16]' : 'aspect-square'
          } flex flex-col justify-between`}
        >
          {/* Subtle background glow */}
          <div
            className="absolute -top-24 -left-24 w-64 h-64 rounded-full filter blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: selectedTheme.accent }}
          ></div>
          <div
            className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full filter blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: selectedTheme.accent }}
          ></div>

          {/* Top Badge */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/20 text-[11px] font-bold tracking-widest text-slate-200">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              FANFLOW · {activeFixture.competition.name.toUpperCase()}
            </div>
            <h3 className="mt-3 text-lg sm:text-2xl font-black tracking-tight text-white uppercase drop-shadow-md">
              {displayHeadline}
            </h3>
          </div>

          {/* Center: Team Badges & Names */}
          <div className="my-auto py-4">
            <div className="flex items-center justify-center gap-4 sm:gap-8">
              {/* Home Team */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-black/20 p-2.5 flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg">
                  <img
                    src={activeFixture.homeTeam.badgeUrl || activeFixture.homeTeam.crest || '/favicon.ico'}
                    alt={activeFixture.homeTeam.name}
                    className="w-full h-full object-contain filter drop-shadow-xl"
                  />
                </div>
                <span className="mt-2 text-xs sm:text-sm font-extrabold line-clamp-1">
                  {activeFixture.homeTeam.name}
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-black text-slate-400 uppercase tracking-widest px-1">
                VS
              </div>

              {/* Away Team */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-black/20 p-2.5 flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg">
                  <img
                    src={activeFixture.awayTeam.badgeUrl || activeFixture.awayTeam.crest || '/favicon.ico'}
                    alt={activeFixture.awayTeam.name}
                    className="w-full h-full object-contain filter drop-shadow-xl"
                  />
                </div>
                <span className="mt-2 text-xs sm:text-sm font-extrabold line-clamp-1">
                  {activeFixture.awayTeam.name}
                </span>
              </div>
            </div>

            {/* Kickoff Box */}
            <div className="mt-6 bg-black/50 backdrop-blur-md rounded-2xl p-3 border border-white/15 shadow-inner">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Singapore Kickoff (UTC+8)
              </div>
              <div className="text-sm sm:text-base font-black text-white mt-0.5">
                {decision.kickoffSGT.fullFormatted}
              </div>
            </div>
          </div>

          {/* Bottom: Venue & Bar Details */}
          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" />
              Screening Live at {selectedVenue.venue}
            </div>
            <div className="text-[11px] text-slate-300">
              {selectedVenue.area} · {selectedVenue.seats} Seats · Sound On
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-[10px] text-slate-200 border border-white/15">
              🍺 {offerText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
