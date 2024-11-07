/**
 * Represents a video clip in the editor.
 */
export interface Clip {
  id: string;
  start: number;
  duration: number;
  src: string;
  row: number;
  videoStartTime?: number
}

/**
 * Represents a text overlay in the editor.
 */
export interface TextOverlay {
  id: string;
  start: number;
  duration: number;
  text: string;
  row: number;
}

/**
 * Represents a sound element in the editor.
 */
export interface Sound {
  id: string;
  start: number;
  duration: number;
  content: string;
  row: number;
  file: string;
  startFrom?: number;
}

/**
 * Represents media from Pexels API.
 */
export interface PexelsMedia {
  id: string;
  duration?: number;
  image?: string;
  video_files?: { link: string }[];
}

/**
 * Represents a local sound file.
 */
export interface LocalSound {
  id: string;
  title: string;
  artist: string;
  file: string;
  duration: number;
}