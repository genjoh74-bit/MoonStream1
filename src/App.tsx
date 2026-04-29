import { useState } from 'react';
import { Subject, Page, PlayData } from './types';
import { Header, BottomNav, SearchModal, VideoPlayer } from './components';
import { HomePage, BrowsePage, TrendingPage, DetailPage } from './pages';

type ViewState = { type: 'home' } | { type: 'browse' } | { type: 'trending' } | { type: 'detail'; subject: Subject } | { type: 'player'; subject: Subject; url: string };

function extractStreamUrl(playData: PlayData | undefined): string | null {
  if (!playData) return null;
  const streams = playData.streamList || [];
  const hls = streams.find((s) => s.url?.includes('.m3u8'));
  return hls?.url || streams[0]?.url || null;
}

export default function App() {
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [showSearch, setShowSearch] = useState(false);
  const [history, setHistory] = useState<ViewState[]>([]);

  const navigate = (next: ViewState) => { setHistory([...history, view]); setView(next); window.scrollTo(0, 0); };
  const goBack = () => { const p = history[history.length - 1]; if (p) { setHistory(history.slice(0, -1)); setView(p); } else setView({ type: 'home' }); window.scrollTo(0, 0); };

  const handlePageNav = (page: Page) => {
    const m: Record<Page, ViewState> = { home: { type: 'home' }, browse: { type: 'browse' }, trending: { type: 'trending' }, movies: { type: 'browse' }, tv: { type: 'browse' }, detail: { type: 'home' }, player: { type: 'home' } };
    if (page === 'home') { setHistory([]); setView(m.home); } else navigate(m[page]);
  };

  const handleWatch = (subject: Subject, playData?: PlayData) => {
    const url = extractStreamUrl(playData) || subject.trailer?.videoAddress?.url;
    url ? navigate({ type: 'player', subject, url }) : alert('No stream available');
  };

  const showNav = view.type !== 'player';
  const showHeader = view.type !== 'player';

  return (
    <div className="bg-black text-white min-h-screen">
      {showHeader && <Header onNavigate={handlePageNav} onSearch={() => setShowSearch(true)} />}
      {view.type === 'home' && <HomePage onWatch={handleWatch} onDetail={(s) => navigate({ type: 'detail', subject: s })} />}
      {view.type === 'browse' && <BrowsePage onDetail={(s) => navigate({ type: 'detail', subject: s })} />}
      {view.type === 'trending' && <TrendingPage onDetail={(s) => navigate({ type: 'detail', subject: s })} />}
      {view.type === 'detail' && <DetailPage subject={(view as any).subject} onBack={goBack} onWatch={handleWatch} onDetail={(s) => navigate({ type: 'detail', subject: s })} />}
      {view.type === 'player' && <VideoPlayer streamUrl={(view as any).url} title={(view as any).subject.title} onClose={goBack} />}
      {showNav && <BottomNav current={view.type === 'detail' ? 'detail' : view.type as Page} onNavigate={handlePageNav} />}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} onSelect={(s) => { setShowSearch(false); navigate({ type: 'detail', subject: s }); }} />}
    </div>
  );
}
