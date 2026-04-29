import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Moon, Home, Film, Tv, Plus, Download, Play, Pause, X, Volume2, VolumeX, Maximize, RotateCcw, TrendingUp, Flame, ChevronRight, ChevronDown, Star, Clock, Globe, Loader, ArrowLeft } from 'lucide-react';
import { Subject, Page, PlayData } from './types';
import { api } from './api';
import Hls from 'hls.js';

export function Header({ onNavigate, onSearch }: { onNavigate: (p: Page) => void; onSearch: () => void }) {
  const [err, setErr] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/90 to-transparent">
      <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
        {!err ? (
          <img src="https://files.catbox.moe/k29c8r.png" alt="M" className="h-8" onError={() => setErr(true)} />
        ) : (
          <div className="flex items-center gap-1.5">
            <Moon className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-bold text-lg">MOONSTREAM</span>
          </div>
        )}
      </button>
      <div className="flex items-center gap-4">
        <button onClick={onSearch} className="text-white/80 hover:text-cyan-400">
          <Search className="w-5 h-5" />
        </button>
        <Bell className="w-5 h-5 text-white/80" />
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 bg-gray-900 flex items-center justify-center">
          <Moon className="w-4 h-4 text-cyan-400" />
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ current, onNavigate }: { current: Page; onNavigate: (p: Page) => void }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'browse', label: 'Browse', icon: Plus },
    { id: 'trending', label: 'Trending', icon: Download },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 border-t border-white/10 flex justify-around px-2 py-2 pb-safe">
      {tabs.map(({ id, label, icon: I }: any) => (
        <button key={id} onClick={() => onNavigate(id as Page)} className="flex flex-col items-center gap-0.5">
          <I className={`w-5 h-5 ${current === id ? 'text-cyan-400' : 'text-white/40'}`} />
          <span className={`text-[10px] ${current === id ? 'text-cyan-400' : 'text-white/40'}`}>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export function MovieCard({ subject, onClick }: { subject: Subject; onClick: (s: Subject) => void }) {
  return (
    <button onClick={() => onClick(subject)} className="relative w-full rounded-lg overflow-hidden group">
      <div className="aspect-[2/3] relative">
        {subject.cover?.url && <img src={subject.cover.url} alt={subject.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        {subject.imdbRatingValue && parseFloat(subject.imdbRatingValue) > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full">
            <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
            <span className="text-white text-[10px]">{subject.imdbRatingValue}</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white text-xs font-semibold line-clamp-2">{subject.title}</p>
        </div>
      </div>
    </button>
  );
}

export function HeroSection({ subject, onWatch, onDetail }: { subject: Subject; onWatch: (s: Subject) => void; onDetail: (s: Subject) => void }) {
  const year = subject.releaseDate?.slice(0, 4);
  const genres = subject.genre?.split(',').slice(0, 2) || [];
  return (
    <div className="relative w-full h-screen min-h-[600px] overflow-hidden">
      {subject.cover?.url && <img src={subject.cover.url} alt={subject.title} className="absolute inset-0 w-full h-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-32">
        <div className="flex flex-wrap gap-2 mb-3">
          {year && <span className="bg-black/60 border border-white/20 text-white text-xs px-2 py-1 rounded">{year}</span>}
          {genres.map((g) => (
            <span key={g} className="bg-black/60 border border-white/20 text-white text-xs px-2 py-1 rounded">{g.trim()}</span>
          ))}
        </div>
        <h1 className="text-4xl font-black text-white mb-3">{subject.title}</h1>
        {subject.description && <p className="text-white/80 text-sm mb-6 max-w-sm line-clamp-3">{subject.description}</p>}
        <div className="flex gap-3">
          <button onClick={() => onWatch(subject)} className="flex items-center gap-2 bg-cyan-400 text-black font-bold px-6 py-3 rounded-full hover:bg-cyan-300">
            <Play className="w-4 h-4 fill-black" />
            WATCH NOW
          </button>
          <button onClick={() => onDetail(subject)} className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function VideoPlayer({ streamUrl, title, onClose }: { streamUrl: string; title: string; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showCtrl, setShowCtrl] = useState(true);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !streamUrl) return;
    if (streamUrl.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(v);
      hls.on(Hls.Events.MANIFEST_PARSED, () => v.play().then(() => setPlaying(true)).catch(() => {}));
      return () => hls.destroy();
    } else {
      v.src = streamUrl;
      v.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [streamUrl]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const handlers = {
      timeupdate: () => setProgress(v.currentTime),
      durationchange: () => setDuration(v.duration),
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
    };
    Object.entries(handlers).forEach(([k, h]) => v.addEventListener(k, h));
    return () => Object.entries(handlers).forEach(([k, h]) => v.removeEventListener(k, h));
  }, []);

  const resetCtrl = () => {
    setShowCtrl(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowCtrl(false), 3000);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black" onMouseMove={resetCtrl} onClick={resetCtrl}>
      <video ref={videoRef} className="w-full h-full object-contain" playsInline />
      <div className={`absolute inset-0 flex flex-col justify-between transition-opacity ${showCtrl ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center gap-3">
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white">
            <X className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold truncate">{title}</span>
        </div>
        <div className="flex justify-center gap-8">
          <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }} className="text-white">
            <RotateCcw className="w-8 h-8" />
          </button>
          <button onClick={() => { const v = videoRef.current; if (v) v.paused ? v.play() : v.pause(); }} className="w-16 h-16 rounded-full bg-cyan-400/20 border border-cyan-400/60 flex items-center justify-center text-white">
            {playing ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white ml-1" />}
          </button>
          <div className="w-8" />
        </div>
        <div className="bg-gradient-to-t from-black/80 to-transparent p-4 space-y-3">
          <div className="w-full h-1 bg-white/20 rounded-full cursor-pointer" onClick={(e: any) => { if (videoRef.current) videoRef.current.currentTime = (e.nativeEvent.offsetX / e.currentTarget.offsetWidth) * duration; }}>
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }} />
          </div>
          <div className="flex justify-between">
            <span className="text-white/60 text-xs">{fmt(progress)} / {fmt(duration)}</span>
            <div className="flex gap-4">
              <button onClick={() => { const v = videoRef.current; if (v) { v.muted = !v.muted; setMuted(v.muted); } }} className="text-white/80">
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button onClick={() => videoRef.current?.requestFullscreen?.()} className="text-white/80">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchModal({ onClose, onSelect }: { onClose: () => void; onSelect: (s: Subject) => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Subject[]>([]);
  const [popular, setPopular] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    inputRef.current?.focus();
    api.popular().then((d) => setPopular(d.everyoneSearch?.map((x: any) => x.title) || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const d = await api.search(q);
        setResults(d.subjectList || []);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 600);
  }, [q]);

  return (
    <div className="fixed inset-0 z-[80] bg-black/95 flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-14 pb-4 border-b border-white/10">
        <Search className="w-5 h-5 text-white/40" />
        <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search movies..." className="flex-1 bg-transparent text-white outline-none" />
        {q && <button onClick={() => setQ('')} className="text-white/40"><X className="w-4 h-4" /></button>}
        <button onClick={onClose} className="text-cyan-400 text-sm">Cancel</button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {!q && popular.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-white text-sm font-semibold">POPULAR</span>
            </div>
            <div className="flex flex-wrap gap-2">{popular.map((t) => (<button key={t} onClick={() => setQ(t)} className="bg-white/10 text-white/70 text-sm px-3 py-1.5 rounded-full">{t}</button>))}</div>
          </div>
        )}
        {loading && <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" /></div>}
        {!loading && results.length > 0 && (
          <div className="space-y-3">
            {results.map((s) => (
              <button key={s.subjectId} onClick={() => { onSelect(s); onClose(); }} className="w-full flex gap-3 bg-white/5 hover:bg-white/10 rounded-lg p-3">
                {s.cover?.url && <img src={s.cover.url} alt={s.title} className="w-12 h-16 object-cover rounded" />}
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{s.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{s.releaseDate?.slice(0, 4)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {!loading && q && results.length === 0 && <div className="text-center py-16 text-white/40">No results for "{q}"</div>}
      </div>
    </div>
  );
}
