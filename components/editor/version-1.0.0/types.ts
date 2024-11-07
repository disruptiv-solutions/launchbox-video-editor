export interface Clip {
  id: string;
  start: number;
  duration: number;
  src: string;
  row: number;
}

export interface LocalSound {
  id: string;
  title: string;
  artist: string;
  duration: number;
  file: string;
}

export interface TextOverlay {
  id: string;
  start: number;
  duration: number;
  text: string;
  row: number;
}

export interface Sound {
  id: string;
  start: number;
  duration: number;
  content: string;
  row: number;
  file: string; 
}

export interface PexelsMedia {
  id: number;
  width: number;
  height: number;
  url: string;
  image?: string;
  duration?: number;
  video_files?: { link: string; quality: string }[];
}

export interface Effect {
  id: string;
  type: string;
  start: number;
  duration: number;
  row: number;
}