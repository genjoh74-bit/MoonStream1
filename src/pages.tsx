import { useEffect, useState } from 'react';
import { TrendingUp, Flame, ChevronRight, Play, ChevronDown, Search, SlidersHorizontal, ArrowLeft, Star, Clock, Globe, Loader, Plus, Film } from 'lucide-react';
import { Subject, Page, PlayData } from './types';
import { api } from './api';
import { MovieCard, HeroSection } from './components';

export function HomePage({ onWatch, onDetail }: { onWatch: (s: Subject) => void; onDetail: (s: Subject) => void }) {
  const [hero, setHero] = useState<Subject | null>(null);
  const [trending, setTrending] = useState<Subject[]>([]);
  const [hot, setHot] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.trending(), api.hot(), api.homepage()])
      .then(([t, h, home]) => {
        const list = t.subjectList || [];
        setTrending(list);
        if (list.length) setHero(list[Math.floor(Math.random() * Math.min(5, list.length))]);
        setHot(h);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" /></div>;

  const Row = ({ title, icon: I, items }: any) => (
    <div className="mb-8">
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">{I && <I className="w-4 h-4 text-cyan-400" />}<h2 className="text-white font-bold text-base uppercase">{title}</h2></div>
        <button className="text-white/40 text-xs flex items-center gap-1">View All <ChevronRight className="w-3 h-3" /></button>
      </div>
      <div className="px-4 grid grid-cols-2 gap-3">{items.slice(0, 4).map((s: Subject) => <MovieCard key={s.subjectId} subject={s} onClick={onDetail} />)}</div>
    </div>
  );

  return (
    <div className="bg-black min-h-screen pb-24">
      {hero && <HeroSection subject={hero} onWatch={onWatch} onDetail={onDetail} />}
      <div className="pt-4">
        {trending.length > 0 && <Row title="Trending Now" icon={TrendingUp} items={trending} />}
        {hot.tv?.length > 0 && <Row title="Hot TV Shows" icon={Flame} items={hot.tv} />}
        {hot.movie?.length > 0 && <Row title="Hot Movies" icon={Flame} items={hot.movie} />}
      </div>
    </div>
  );
}

export function TrendingPage({ onDetail }: { onDetail: (s: Subject) => void }) {
  const [items, setItems] = useState<Subject[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    api.trending().then((d) => { setItems(d.subjectList || []); setHasMore((d.subjectList || []).length === 18); }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-black min-h-screen pt-20 pb-24 px-4">
      <div className="flex items-center gap-3 mb-6"><TrendingUp className="w-6 h-6 text-cyan-400" /><h1 className="text-white text-2xl font-black uppercase">Trending Now</h1></div>
      {loading ? <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" /></div> : (
        <>
          <div className="grid grid-cols-2 gap-3">{items.map((s) => <MovieCard key={s.subjectId} subject={s} onClick={onDetail} />)}</div>
          {hasMore && <button onClick={() => api.trending(page + 1).then((d) => { setItems((p) => [...p, ...(d.subjectList || [])]); setPage(page + 1); })} className="w-full mt-6 py-3 border border-cyan-400/30 rounded-lg text-cyan-400 flex items-center justify-center gap-2 hover:bg-cyan-400/10"><ChevronDown className="w-4 h-4" />Load More</button>}
        </>
      )}
    </div>
  );
}

export function BrowsePage({ onDetail }: { onDetail: (s: Subject) => void }) {
  const [q, setQ] = useState('');
  const [genre, setGenre] = useState('All');
  const [items, setItems] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const d = q.trim() ? await api.search(q) : await api.browse(undefined, genre);
        setItems(d.subjectList || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [q, genre]);

  const GENRES = ['All', 'Action', 'Drama', 'Comedy', 'Sci-Fi', 'Horror', 'Romance', 'Thriller'];

  return (
    <div className="bg-black min-h-screen pt-20 pb-24 px-4">
      <h1 className="text-white text-3xl font-black uppercase mb-5">Browse</h1>
      <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-4 py-3 mb-4">
        <Search className="w-4 h-4 text-white/40" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search movies..." className="flex-1 bg-transparent text-white outline-none" />
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {GENRES.map((g) => <button key={g} onClick={() => setGenre(g)} className={`px-4 py-1.5 rounded-full text-sm font-medium ${genre === g ? 'bg-cyan-400 text-black' : 'bg-white/10 text-white/70'}`}>{g}</button>)}
      </div>
      {loading ? <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" /></div> : (
        <div className="grid grid-cols-2 gap-3">{items.length > 0 ? items.map((s) => <MovieCard key={s.subjectId} subject={s} onClick={onDetail} />) : <div className="col-span-2 text-center py-16 text-white/30">No results</div>}</div>
      )}
    </div>
  );
}

export function DetailPage({ subject, onBack, onWatch, onDetail }: { subject: Subject; onBack: () => void; onWatch: (s: Subject, p?: PlayData) => void; onDetail: (s: Subject) => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [recommend, setRecommend] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [playLoading, setPlayLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.detail(subject.subjectId), api.recommend(subject.subjectId)])
      .then(([d, r]) => { setDetail(d); setRecommend(r.subjectList || []); })
      .finally(() => setLoading(false));
  }, [subject.subjectId]);

  const s = detail?.subject || subject;
  const year = s.releaseDate?.slice(0, 4);

  return (
    <div className="bg-black min-h-screen pb-24">
      <div className="relative w-full aspect-[16/9]">
        {s.cover?.url && <img src={s.cover.url} alt={s.title} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <button onClick={onBack} className="absolute top-14 left-4 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white"><ArrowLeft className="w-5 h-5" /></button>
      </div>
      <div className="px-4 -mt-8 relative z-10">
        {year && <span className="bg-black/70 border border-white/20 text-white/70 text-xs px-2 py-1 rounded inline-block mb-3">{year}</span>}
        <h1 className="text-white text-3xl font-black mb-2">{s.title}</h1>
        <div className="flex gap-3 my-5">
          <button onClick={async () => { setPlayLoading(true); try { const p = await api.play(subject.subjectId); onWatch(subject, p); } catch { onWatch(subject); } finally { setPlayLoading(false); } }} className="flex-1 flex items-center justify-center gap-2 bg-cyan-400 text-black font-bold py-3 rounded-full">
            {playLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-black" />}
            {playLoading ? 'Loading...' : 'Watch'}
          </button>
          <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white"><Plus className="w-5 h-5" /></button>
        </div>
        {loading ? <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" /></div> : (
          <div className="space-y-4">
            {s.description && <p className="text-white/70 text-sm">{s.description}</p>}
            {recommend.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><ChevronRight className="w-4 h-4" />You May Also Like</h3>
                <div className="grid grid-cols-2 gap-3">{recommend.map((r) => <MovieCard key={r.subjectId} subject={r} onClick={onDetail} />)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
