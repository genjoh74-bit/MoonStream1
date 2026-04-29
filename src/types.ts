export interface Image { url: string; width: number; height: number; }
export interface VideoAddr { url: string; duration: number; width: number; height: number; }
export interface Trailer { videoAddress: VideoAddr; cover: Image; }
export interface Subject {
  subjectId: string;
  subjectType: 1 | 2 | 9;
  title: string;
  description: string;
  releaseDate: string;
  duration: number;
  genre: string;
  cover: Image;
  countryName: string;
  imdbRatingValue: string;
  subtitles: string;
  hasResource: boolean;
  trailer: Trailer | null;
  detailPath: string;
  staffList: any[];
  imdbRatingCount: number;
  postTitle: string;
}
export interface PlayStream { url: string; definition: string; width: number; height: number; }
export interface PlayData { streamList: PlayStream[]; subtitleList: any[]; url?: string; }
export interface DetailData { subject: Subject; stars: any[]; resource: any; }
export type Page = 'home' | 'browse' | 'trending' | 'detail' | 'player' | 'movies' | 'tv';
