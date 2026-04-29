const BASE = 'https://movieapi.xcasper.space/api';
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Referer': 'https://h5.aoneroom.com/',
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = await res.json();
  return json.data;
}

export const api = {
  trending: (p = 1) => get<{ subjectList: any[] }>(`/trending?page=${p}&perPage=18`),
  hot: () => get<any>('/hot'),
  detail: (id: string) => get<any>(`/detail?subjectId=${id}`),
  play: (id: string) => get<any>(`/play?subjectId=${id}`),
  search: (q: string, p = 1) => get<{ subjectList: any[] }>(`/search?keyword=${encodeURIComponent(q)}&page=${p}&perPage=12`),
  recommend: (id: string) => get<{ subjectList: any[] }>(`/recommend?subjectId=${id}&page=1&perPage=10`),
  homepage: () => get<any>('/homepage'),
  popular: () => get<any>('/popular-search'),
  browse: (type?: number, genre?: string) => {
    const q = new URLSearchParams();
    if (type) q.set('subjectType', String(type));
    if (genre && genre !== 'All') q.set('genre', genre);
    q.set('page', '1');
    q.set('perPage', '12');
    return get<{ subjectList: any[] }>(`/browse?${q}`);
  },
};
