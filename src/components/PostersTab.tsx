import React, { useState } from 'react';
import { Download, Sparkles, Image as ImageIcon, MapPin, Palette, Check } from 'lucide-react';
import type { MatchFixture } from '../shared/scoringEngine.ts';
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
  { id: 'royal_blue', name: 'Royal Blue & Gold', bg: 'from-blue-900 via-blue-950 to-slate-900', accent: '#f59e0b', textAccent: 'text-amber-300', border: 'border-blue-400/40' },
  { id: 'match_red', name: 'Matchday Red & White', bg: 'from-red-900 via-red-950 to-slate-950', accent: '#ffffff', textAccent: 'text-white', border: 'border-red-400/40' },
  { id: 'golden_glory', name: 'Golden Champion', bg: 'from-amber-900 via-yellow-950 to-slate-950', accent: '#fbbf24', textAccent: 'text-amber-300', border: 'border-amber-400/40' },
  { id: 'singapore_derby', name: 'Lion City Blue-Red', bg: 'from-blue-900 via-slate-950 to-red-950', accent: '#ef4444', textAccent: 'text-red-400', border: 'border-blue-500/40' },
];

export const PostersTab: React.FC<PostersTabProps> = ({
  fixtures,
  selectedFixture,
  setSelectedFixture,
  selectedVenue,
}) => {
  const activeFixture = selectedFixture || fixtures[0] || null;
  const decision = activeFixture ? calculateMatchDecision(activeFixture, selectedVenue) : null;

  const [headline, setHeadline] = useState(HEADLINES[0]);
  const [customHeadline, setCustomHeadline] = useState('');
  const [offerText, setOfferText] = useState(SPECIAL_OFFERS[0]);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [aspectRatio, setAspectRatio] = useState<'story' | 'square'>('square');
  const [isGenerating, setIsGenerating] = useState(false);

  const screenMatches = fixtures.filter(f => {
    const d = calculateMatchDecision(f, selectedVenue);
    return d.decision === 'Screen';
  });

  const displayHeadline = customHeadline.trim() || headline;

  const renderCanvas = async (): Promise<string | null> => {
    if (!activeFixture || !decision) return null;

    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = aspectRatio === 'story' ? 1920 : 1080;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background Gradient based on blue, red, white, golden yellow
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    if (selectedTheme.id === 'royal_blue') {
      gradient.addColorStop(0, '#1e3a8a'); // dark blue
      gradient.addColorStop(0.5, '#0f172a');
      gradient.addColorStop(1, '#172554');
    } else if (selectedTheme.id === 'match_red') {
      gradient.addColorStop(0, '#991b1b'); // red
      gradient.addColorStop(0.5, '#0f172a');
      gradient.addColorStop(1, '#7f1d1d');
    } else if (selectedTheme.id === 'golden_glory') {
      gradient.addColorStop(0, '#78350f'); // golden amber
      gradient.addColorStop(0.5, '#0f172a');
      gradient.addColorStop(1, '#451a03');
    } else {
      gradient.addColorStop(0, '#1e3a8a'); // blue
      gradient.addColorStop(0.5, '#0f172a');
      gradient.addColorStop(1, '#991b1b'); // red
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative stadium field lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width * 0.38, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width * 0.18, 0, Math.PI * 2);
    ctx.stroke();

    // Top Header Pill: FanFlow Screening
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    const topPillY = aspectRatio === 'story' ? 120 : 60;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 200, topPillY, 400, 48, 24);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24'; // golden yellow accent
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`FANFLOW · ${activeFixture.competition.name.toUpperCase()}`, width / 2, topPillY + 31);

    // Headline
    const headlineY = aspectRatio === 'story' ? 240 : 160;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 44px Inter, sans-serif';
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
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.arc(width / 2 - spacing, centerY, badgeSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // VS text in Red with White glow
    ctx.fillStyle = '#ef4444'; // Red
    ctx.font = '900 50px Inter, sans-serif';
    ctx.fillText('VS', width / 2, centerY + 18);

    // Away Badge
    if (awayImg) {
      try {
        ctx.drawImage(awayImg, width / 2 + spacing - badgeSize / 2, centerY - badgeSize / 2, badgeSize, badgeSize);
      } catch (err) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.arc(width / 2 + spacing, centerY, badgeSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Team Names
    const namesY = centerY + badgeSize / 2 + 60;
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 36px Inter, sans-serif';
    ctx.fillText(activeFixture.homeTeam.name, width / 2 - spacing, namesY);
    ctx.fillText(activeFixture.awayTeam.name, width / 2 + spacing, namesY);

    // Kickoff Box in deep navy with golden border
    const boxY = aspectRatio === 'story' ? 1060 : 660;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 350, boxY, 700, 114, 24);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#93c5fd'; // blue tint text
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText('SINGAPORE KICKOFF TIME (UTC+8)', width / 2, boxY + 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px Inter, sans-serif';
    ctx.fillText(decision.kickoffSGT.fullFormatted.toUpperCase(), width / 2, boxY + 86);

    // Venue Box
    const venueY = boxY + 146;
    ctx.fillStyle = '#fbbf24'; // Gold
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.fillText(`📍 SCREENING LIVE AT ${selectedVenue.venue.toUpperCase()}`, width / 2, venueY);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 20px Inter, sans-serif';
    ctx.fillText(`${selectedVenue.area} · ${selectedVenue.seats} Seats · Full Audio Experience`, width / 2, venueY + 34);

    // Special Offer Tag
    const offerY = venueY + 82;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'; // Red tint
    ctx.beginPath();
    ctx.roundRect(width / 2 - 380, offerY, 760, 58, 29);
    ctx.fill();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 21px Inter, sans-serif';
    ctx.fillText(`🍺 ${offerText}`, width / 2, offerY + 37);

    // Footer Watermark
    const footerY = height - 40;
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px Inter, sans-serif';
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
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500 font-semibold">No matches available to create posters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Poster Customizer Controls */}
      <div className="lg:col-span-5 space-y-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-red-600" />
            Promo Poster Generator
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Pick a match to create instant promotional graphics for Instagram, WhatsApp, or table flyers.
          </p>
        </div>

        {/* Match Selector */}
        <div>
          <label className="text-xs uppercase font-extrabold tracking-wider text-slate-700 mb-1.5 block">
            Select Match to Promote:
          </label>
          <select
            value={activeFixture.id}
            onChange={(e) => {
              const f = fixtures.find(item => item.id.toString() === e.target.value);
              if (f) setSelectedFixture(f);
            }}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
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
          <label className="text-xs uppercase font-extrabold tracking-wider text-slate-700 mb-1.5 block">
            Headline Tag:
          </label>
          <div className="space-y-2">
            <select
              value={headline}
              onChange={(e) => {
                setHeadline(e.target.value);
                setCustomHeadline('');
              }}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-xl px-3 py-2 shadow-2xs"
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
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Special Offer / Perk */}
        <div>
          <label className="text-xs uppercase font-extrabold tracking-wider text-slate-700 mb-1.5 block">
            Bar / Cafe Special Tag:
          </label>
          <select
            value={offerText}
            onChange={(e) => setOfferText(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-xl px-3 py-2 shadow-2xs"
          >
            {SPECIAL_OFFERS.map(offer => (
              <option key={offer} value={offer}>{offer}</option>
            ))}
          </select>
        </div>

        {/* Theme Palette */}
        <div>
          <label className="text-xs uppercase font-extrabold tracking-wider text-slate-700 mb-1.5 block flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-blue-600" />
            Color Theme:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  selectedTheme.id === theme.id
                    ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: theme.accent }}></span>
                <span>{theme.name}</span>
                {selectedTheme.id === theme.id && <Check className="w-3.5 h-3.5 ml-auto text-blue-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="text-xs uppercase font-extrabold tracking-wider text-slate-700 mb-1.5 block">
            Format:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setAspectRatio('square')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                aspectRatio === 'square'
                  ? 'bg-blue-600 text-white shadow-xs border-blue-700'
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Square (1:1 Feed)
            </button>
            <button
              onClick={() => setAspectRatio('story')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                aspectRatio === 'story'
                  ? 'bg-blue-600 text-white shadow-xs border-blue-700'
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
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
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-md shadow-red-600/20 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? 'Rendering PNG...' : 'Download as PNG'}
        </button>
      </div>

      {/* Right Column: Live Poster Visual Preview */}
      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">
          Live Poster Preview (Export: 1080px HD)
        </div>

        {/* Poster Card Mockup */}
        <div
          className={`w-full max-w-md bg-gradient-to-b ${selectedTheme.bg} border-4 ${selectedTheme.border} rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl relative overflow-hidden transition-all duration-300 ${
            aspectRatio === 'story' ? 'aspect-[9/16]' : 'aspect-square'
          } flex flex-col justify-between`}
        >
          {/* Subtle background stadium glow */}
          <div
            className="absolute -top-24 -left-24 w-64 h-64 rounded-full filter blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: selectedTheme.accent }}
          ></div>
          <div
            className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full filter blur-3xl opacity-20 pointer-events-none bg-red-500"
          ></div>

          {/* Top Badge */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-amber-300/40 text-[11px] font-black tracking-widest text-amber-300 shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-300" />
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
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white/10 p-2.5 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
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

              <div className="text-xl sm:text-2xl font-black text-red-400 uppercase tracking-widest px-2 py-1 bg-red-950/60 rounded-xl border border-red-500/40">
                VS
              </div>

              {/* Away Team */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white/10 p-2.5 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
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
            <div className="mt-6 bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-amber-400/40 shadow-inner">
              <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                Singapore Kickoff (UTC+8)
              </div>
              <div className="text-sm sm:text-base font-black text-white mt-0.5">
                {decision.kickoffSGT.fullFormatted}
              </div>
            </div>
          </div>

          {/* Bottom: Venue & Bar Details */}
          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Screening Live at {selectedVenue.venue}
            </div>
            <div className="text-[11px] text-slate-200 font-medium">
              {selectedVenue.area} · {selectedVenue.seats} Seats · Full Match Audio
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-red-600/30 text-[10px] text-white font-bold border border-red-400/50">
              🍺 {offerText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
